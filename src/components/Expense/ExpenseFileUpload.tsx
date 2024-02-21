import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Button, Dialog, DialogContent, Hidden, Stack, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { DocumentReference, Timestamp, WriteBatch, arrayUnion, collection, doc, writeBatch } from "firebase/firestore";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { convertFormattedDateToTimestamp, validateDateFormat } from "../../helper/date";
import { ThemeColor } from "../../helper/utils";
import { collections, operation_types, subcollections, txn_types } from "../../constants/collections";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { db } from "../../firebase";
import { getUserDocRef } from "../../firebase/UsersService";
import { getRandomColor } from "../../firebase/defaultData";
import { hasInternetConnection } from "../../firebase/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import ExpenseModel from "../../models/ExpenseModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { addExpenseToStateAction, setUploadProgressAction } from "../../redux/actions/expenseAction";
import {
  resetUploadProgress,
  setUploadCancelled,
  setUploadCount,
  setUploadStatus,
} from "../../redux/reducer/expenseSlice";
import { RootState } from "../../redux/store";
import UploadInvalidDateDialog from "../Dialog/UploadInvalidDateDialog";
import { retrieveKeySecurely } from "../../encryption/keyhandling";
import { encryptAndConvertToBase64 } from "../../encryption/encryption";

const validFileTypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 1048576; // 1MB
const ExpenseFileUploadStepper = React.lazy(() => import("../Stepper/ExpenseFileUploadStepper"));

const ExpenseFileUpload = () => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const theme = useTheme();

  const isDarkMode = theme.palette.mode === "dark";
  const [isStepperFormOpen, setIsStepperFormOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  let { accountType } = useAccountTypeContext();
  let { categories } = useCategoryContext();
  const [invalidExpenses, setInvalidExpenses] = useState<any>([]);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const isUploading = useSelector((state: RootState) => state.expenses.isUploading);

  const handleFileClick = async () => {
    setIsCheckingNetwork(true);

    const isConnected = await hasInternetConnection();
    setIsCheckingNetwork(false);

    if (!isConnected) {
      openSuccessSnackbar("This feature is not available Offline.", true);
      return;
    }

    const inputElement = document.getElementById("file-upload-input");
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processAndUploadFile(selectedFile);
    }
    event.target.value = "";
  };

  function getIncorrectHeaders(set1: Set<string>, set2: Set<string>): string[] {
    const incorrectHeaders: string[] = [];
    for (const item of Array.from(set1)) {
      if (!set2.has(item)) incorrectHeaders.push(item);
    }
    return incorrectHeaders;
  }

  const processAndUploadFile = async (selectedFile: File) => {
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
          saveExpensesToFirestore(expensesData);
        }
      } catch (error) {
        console.error(error);
      } finally {
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const getAccountTypeId = async (
    accountName: string,
    batch: WriteBatch,
    userDocRef: DocumentReference
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
    userDocRef: DocumentReference
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
  const saveExpensesToFirestore = async (expensesData: any[]) => {
    let logsToSave: TransactionLogsModel[] = [];
    let expensesWithInvalidDate: { rowNumber: number; description: string; date: string }[] = [];
    let expensesWithExceedingCharacters: { rowNumber: number; description: string; date: string }[] = [];
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
        if (index === 0) continue; // Skip the header row

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
          const account_id = await getAccountTypeId(account, batch, userDocRef);
          const category_id = await getCategoryId(category, batch, userDocRef);

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

      /*// Calculate the file size for each Base64 string
      const expenseFileSize = new Blob([atob(encryptedExpenseBase64.encryptedDataBase64)]).size;
      const logsFileSize = new Blob([atob(encryptedLogsBase64.encryptedDataBase64)]).size;
      // Calculate the combined file size
      const combinedFileSize = expenseFileSize + logsFileSize;
      console.log(`Combined file size: ${combinedFileSize} bytes`); */
      // Create a promise that rejects in <10 seconds
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Commit operation timed out")), 20000)
      );
      try {
        await Promise.race([batch.commit(), timeout]);
      } catch (error) {
        if (error instanceof Error && error.message === "Commit operation timed out") {
          openSuccessSnackbar("The operation timed out. Please try again.", true);
          return;
        } else {
          console.error("Expense Upload : Error saving expenses to Firestore", error);
        }
      }

      const dispatchPromises = expensesToSave.map((expenseData) => dispatch(addExpenseToStateAction(expenseData)));
      await Promise.all(dispatchPromises);

      if (expensesWithInvalidDate?.length > 0 || expensesWithExceedingCharacters?.length > 0) {
        setErrorDialogOpen(true);
        setInvalidExpenses([...expensesWithInvalidDate, ...expensesWithExceedingCharacters]);
      }
    } catch (error) {
      console.error("Expense Upload : Error saving expenses to Firestore", error);
    } finally {
      dispatch(resetUploadProgress());
    }
  };

  const handleDialogClose = () => {
    setErrorDialogOpen(false);
  };

  const handleCloseForm = () => {
    setIsStepperFormOpen(false);
  };

  return (
    <>
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="file-upload-input"
        disabled={isUploading}
      />
      <Stack direction="row" alignItems="center" ml={{ xs: 0, md: 2 }}>
        <FileUploadOutlinedIcon sx={{ fontSize: "16px" }} onClick={handleFileClick} />

        <Hidden smDown>
          <Button
            component="span"
            color="inherit"
            onClick={handleFileClick}
            sx={{
              color: ThemeColor(theme),
              minWidth: { xs: 35, md: 48 },
              textTransform: "none",
              fontSize: "12px",
            }}
            disabled={isCheckingNetwork}
          >
            Import
          </Button>
        </Hidden>
        <HelpOutlineIcon
          sx={{ fontSize: "14px", cursor: "pointer", ml: { xs: 1, md: 0 } }}
          onClick={() => setIsStepperFormOpen(true)}
        />
      </Stack>

      <UploadInvalidDateDialog
        isDialogOpen={errorDialogOpen}
        onClose={handleDialogClose}
        msgTitle="Upload successful, but.."
        msgHeader="Some entries have invalid date formats and/or exceeding characters count:"
        msgBody={invalidExpenses}
        bg={isDarkMode ? "#1e1e1e" : "#fff"}
      ></UploadInvalidDateDialog>

      <Dialog
        open={isStepperFormOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { margin: { xs: 0, sm: 1, md: 2 } },
        }}
      >
        <React.Suspense fallback={<div>loading...</div>}>
          <DialogContent
            sx={{
              background: isDarkMode ? "#1e1e1e" : "#fff",
              px: { xs: 1, sm: 2, md: 3 },
              py: { xs: 1, sm: 2 },
              maxHeight: 500,
            }}
          >
            <ExpenseFileUploadStepper closeForm={() => setIsStepperFormOpen(false)} />
          </DialogContent>
        </React.Suspense>
      </Dialog>

      <div> {SnackbarComponent}</div>
    </>
  );
};

export default React.memo(ExpenseFileUpload);
