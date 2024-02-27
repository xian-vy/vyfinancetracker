import { WriteBatch, DocumentReference, doc, arrayUnion, Timestamp, collection, writeBatch } from "firebase/firestore";
import { collections, operation_types, subcollections, txn_types } from "../../constants/collections";
import { getRandomColor } from "../../firebase/defaultData";
import AccountTypeModel from "../../models/AccountTypeModel";
import { v4 as uuidv4 } from "uuid";
import CategoryModel from "../../models/CategoryModel";
import { encryptAndConvertToBase64 } from "../../encryption/encryption";
import { retrieveKeySecurely } from "../../encryption/keyhandling";
import { db } from "../../firebase";
import { getUserDocRef } from "../../firebase/UsersService";
import { validateDateFormat, convertFormattedDateToTimestamp } from "../../helper/date";
import ExpenseModel from "../../models/ExpenseModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import {
  setUploadProgressAction,
  resetUploadProgress,
  addExpenseToStateAction,
} from "../../redux/actions/expenseAction";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { ASYNC_RESULT } from "../../constants/constants";
import { setUploadCancelled, setUploadCount, setUploadStatus } from "../../redux/reducer/expenseSlice";

const getAccountTypeId = async (
  accountName: string,
  batch: WriteBatch,
  userDocRef: DocumentReference,
  accountType: AccountTypeModel[]
): Promise<string> => {
  let existingAccountType = accountType.find((ptype) => ptype.description === accountName);

  if (!accountName) {
    // If accountName is empty, check for an existing "Uncategorized" Account Type
    existingAccountType = accountType.find((ptype) => ptype.description === "Uncategorized");
  }

  if (existingAccountType) {
    return existingAccountType.id;
  } else {
    const id = uuidv4();
    const account = {
      id: id,
      description: accountName,
      color: getRandomColor(),
      icon: "No Icon",
    };

    // Add the new acc to the batch instead of writing immediately
    const accountDocRef = doc(userDocRef, collections.AccountTypes, subcollections.accounttypes);
    batch.update(accountDocRef, {
      accounttypes: arrayUnion(account),
    });

    accountType.push(account);

    return id;
  }
};

const getCategoryId = async (
  categoryName: string,
  batch: WriteBatch,
  userDocRef: DocumentReference,
  categories: CategoryModel[]
): Promise<string> => {
  let existingCategory = categories.find((category) => category.description === categoryName);

  if (!categoryName) {
    // If categoryName is empty, check for an existing "Uncategorized" category
    existingCategory = categories.find((category) => category.description === "Uncategorized");
  }

  if (existingCategory) {
    return existingCategory.id;
  } else {
    const id = uuidv4();
    const category = {
      id: id,
      description: categoryName,
      color: getRandomColor(),
      icon: "No Icon",
    };

    // Add the new category to the batch instead of writing immediately
    const categoriesDocRef = doc(userDocRef, collections.Categories, subcollections.categories);
    batch.update(categoriesDocRef, {
      categories: arrayUnion(category),
    });

    categories.push(category);
    return id;
  }
};

type UploadType = {
  expensesData: any[];
  categories: CategoryModel[];
  accountType: AccountTypeModel[];
  dispatch: ThunkDispatch<any, any, any>;
};

type UploadErrorMessage = {
  rowNumber: number;
  description: string;
  date: string;
};

export const uploadExpenses = async ({
  expensesData,
  categories,
  accountType,
  dispatch,
}: UploadType): Promise<ASYNC_RESULT | UploadErrorMessage[]> => {
  let logsToSave: TransactionLogsModel[] = [];
  let expensesWithInvalidDate: UploadErrorMessage[] = [];
  let expensesWithExceedingCharacters: UploadErrorMessage[] = [];
  let expensesToSave: ExpenseModel[] = [];
  const batchId = uuidv4();
  const batch = writeBatch(db);
  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    const now = Timestamp.now();

    const userDocRef = await getUserDocRef();

    const headers = expensesData[0];
    const descriptionIndex = headers.indexOf("description");
    const amountIndex = headers.indexOf("amount");
    const accountIndex = headers.indexOf("account");
    const dateIndex = headers.indexOf("date");
    const categoryIndex = headers.indexOf("category");

    for (const [index, expense] of Array.from(expensesData.entries())) {
      if (index === 0) continue;

      const description = expense[descriptionIndex].trim();
      const strDate = expense[dateIndex];
      const trimmedStrDate = strDate.trim();
      const account = expense[accountIndex].toString().trim();
      const category = expense[categoryIndex].toString().trim();
      const amountString = expense[amountIndex].replace(/,/g, "");

      // Check if any field exceeds the limit
      if (
        description.length > 75 ||
        account.length > 50 ||
        category.length > 50 ||
        amountString.length > 50 ||
        trimmedStrDate.length > 50
      ) {
        expensesWithExceedingCharacters.push({
          rowNumber: index + 1,
          description: description,
          date: trimmedStrDate,
        });

        continue;
      }

      if (validateDateFormat(trimmedStrDate)) {
        const account_id = await getAccountTypeId(account, batch, userDocRef, accountType);
        const category_id = await getCategoryId(category, batch, userDocRef, categories);

        const formatDate = convertFormattedDateToTimestamp(trimmedStrDate);
        const firestoreTimestamp = Timestamp.fromMillis(formatDate);

        const amount = parseFloat(amountString);

        const expenseId = uuidv4();
        const expenseData = {
          id: expenseId,
          description: description,
          amount: amount,
          account_id: account_id,
          date: firestoreTimestamp,
          category_id: category_id,
          batchId: batchId,
          lastModified: now,
        };

        expensesToSave.push(expenseData);

        const progress = ((index + 1) / expensesData.length) * 100;
        dispatch(setUploadProgressAction(progress));

        await new Promise((resolve) => setTimeout(resolve, 10));

        const log: TransactionLogsModel = {
          txn_id: uuidv4(),
          txn_ref_id: expenseId,
          txn_type: txn_types.Expenses,
          operation: operation_types.Create,
          category_id: expenseData.category_id,
          account_id: expenseData.account_id,
          amount: expenseData.amount,
          lastModified: now,
        };
        logsToSave.push(log);
      } else {
        expensesWithInvalidDate.push({ rowNumber: index + 1, description: description, date: trimmedStrDate });
      }
    }

    // Save all expenses in a single document
    const encryptedExpenseBase64 = await encryptAndConvertToBase64(expensesToSave, key);
    const expensesDocRef = doc(collection(userDocRef, collections.Expenses), batchId);
    batch.set(expensesDocRef, { encryptedData: encryptedExpenseBase64, lastModified: now, isMultiple: true });

    dispatch(resetUploadProgress());

    // Save all logs in a single document
    const logsDocRef = doc(collection(userDocRef, collections.Transaction_Logs), batchId);
    const encryptedLogsBase64 = await encryptAndConvertToBase64(logsToSave, key);
    batch.set(logsDocRef, { encryptedData: encryptedLogsBase64, lastModified: now, isMultiple: true });

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Commit operation timed out")), 20000)
    );
    try {
      await Promise.race([batch.commit(), timeout]);
    } catch (error) {
      if (error instanceof Error && error.message === "Commit operation timed out") {
        return ASYNC_RESULT.timeout;
      } else {
        console.error("Expense Upload : Error saving expenses to Firestore", error);
        return ASYNC_RESULT.error;
      }
    }

    const dispatchPromises = expensesToSave.map((expenseData) => dispatch(addExpenseToStateAction(expenseData)));
    await Promise.all(dispatchPromises);

    if (expensesWithInvalidDate?.length > 0 || expensesWithExceedingCharacters?.length > 0) {
      return [...expensesWithInvalidDate, ...expensesWithExceedingCharacters];
    }

    return ASYNC_RESULT.success;
  } catch (error) {
    console.error("Expense Upload : Error saving expenses to Firestore", error);
  } finally {
    dispatch(resetUploadProgress());
  }
  return ASYNC_RESULT.success;
};

const validFileTypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = 1048576; // 1MB

function getIncorrectHeaders(set1: Set<string>, set2: Set<string>): string[] {
  const incorrectHeaders: string[] = [];
  for (const item of Array.from(set1)) {
    if (!set2.has(item)) incorrectHeaders.push(item);
  }
  return incorrectHeaders;
}

type HandleFileChangeType = {
  selectedFile: File;
  openSuccessSnackbar: (message: string, error?: boolean) => void;
  dispatch: ThunkDispatch<any, any, any>;
  handleUploadExpenses: (expensesData: any[]) => Promise<void>; // Add this line
};

export const processAndUploadFile = async ({
  selectedFile,
  openSuccessSnackbar,
  dispatch,
  handleUploadExpenses,
}: HandleFileChangeType) => {
  const xlsx = await import("xlsx/dist/xlsx.mini.min.js");
  const utils = xlsx.utils;
  const read = xlsx.read;

  if (!validFileTypes.includes(selectedFile.type)) {
    openSuccessSnackbar("Please upload excel files only.", true);
    return;
  }
  if (selectedFile.size > MAX_FILE_SIZE) {
    openSuccessSnackbar("Please upload excel file up to 1MB only.", true);
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const result = event.target?.result as string;

      const workbook = read(result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        openSuccessSnackbar("The uploaded Excel file must contain at least one sheet.", true);
        return;
      }
      const sheet = workbook.Sheets[sheetName];
      const data = utils.sheet_to_json(sheet, {
        header: 1,
        blankrows: false,
        raw: false,
      });

      if (data.length === 0) {
        openSuccessSnackbar("Your uploaded file is empty.", true);
        return;
      }

      const headers = data[0] as string[];
      const expectedHeaders = ["description", "amount", "account", "date", "category"];
      const headersSet = new Set(headers);
      const expectedHeadersSet = new Set(expectedHeaders);

      const incorrectHeaders = getIncorrectHeaders(headersSet, expectedHeadersSet);

      if (incorrectHeaders.length > 0) {
        openSuccessSnackbar(`Incorrect header: ${incorrectHeaders.join(", ")}`, true);
        return;
      } else {
        const expensesData = data;

        if (expensesData.length > 501) {
          openSuccessSnackbar("Please upload max 500 expenses at a time.", true);
          return;
        }

        dispatch(setUploadCancelled(false));
        dispatch(setUploadStatus(true));
        dispatch(setUploadCount(data.length - 1)); // Subtract 1 to exclude the header row

        handleUploadExpenses(expensesData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  reader.readAsBinaryString(selectedFile);
};
