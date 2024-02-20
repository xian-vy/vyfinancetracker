// src/firebase/expenseServices.tsx
import {
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDocFromCache,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { collections } from "../constants/collections";
import { db } from "../firebase";
import ExpenseModel from "../models/ExpenseModel";
import { fetchTransactionData } from "./GenericFetch";
import { getUserDocRef } from "./UsersService";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { decryptFromBase64, encryptAndConvertToBase64 } from "../encryption/encryption";
import { convertToFirestoreTimestamp } from "./utils";

//FETCH EXPENSE

const mapDataToExpenseModel = (doc: QueryDocumentSnapshot<any>, data: any): ExpenseModel[] => {
  //console.log("Data:", data);

  if (doc.data().isMultiple) {
    // This is a batch upload
    return data
      .filter((expense: ExpenseModel) => !expense.deleted)
      .map((expense: ExpenseModel) => {
        return {
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          account_id: expense.account_id,
          date: convertToFirestoreTimestamp(expense.date),
          category_id: expense.category_id,
          batchId: expense.batchId,
          lastModified: expense.lastModified,
        };
      });
  } else {
    // This is a single expense
    if (data.deleted) {
      return [];
    } else {
      return [
        {
          id: doc.id,
          description: data.description,
          amount: data.amount,
          account_id: data.account_id,
          date: convertToFirestoreTimestamp(data.date),
          category_id: data.category_id,
          lastModified: data.lastModified,
        },
      ];
    }
  }
};

export const getExpenses = async (): Promise<ExpenseModel[]> => {
  return fetchTransactionData<ExpenseModel>(collections.Expenses, mapDataToExpenseModel);
};

export const addExpensetoFirestore = async (expense: ExpenseModel): Promise<string> => {
  try {
    const { id, ...newExpense } = expense;

    newExpense.lastModified = Timestamp.now();
    const userDocRef = await getUserDocRef();
    const collectionRef = collection(userDocRef, collections.Expenses);
    const newExpenseRef = doc(collectionRef);
    const newId = newExpenseRef.id;

    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    const encryptedExpenseBase64 = await encryptAndConvertToBase64(newExpense, key);

    setDoc(newExpenseRef, { encryptedData: encryptedExpenseBase64, lastModified: Timestamp.now() });

    return newId;
  } catch (error) {
    throw error;
  }
};

// DELETE
export const deleteExpensetoFirestore = async (expenseData: ExpenseModel): Promise<void> => {
  try {
    const userDocRef = await getUserDocRef();

    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    if (expenseData.batchId) {
      //multiple expenses
      const expensesRef = collection(userDocRef, collections.Expenses);
      const expensesDocRef = doc(expensesRef, expenseData.batchId);

      const expenseDoc = await getDocFromCache(expensesDocRef);
      if (expenseDoc.exists()) {
        const expenses = expenseDoc.data();

        //decrypt
        const decryptedExpenses = await decryptFromBase64(
          expenses.encryptedData.encryptedDataBase64,
          key,
          expenses.encryptedData.iv
        );

        const expenseIndex = decryptedExpenses.findIndex((expense: ExpenseModel) => expense.id === expenseData.id);
        if (expenseIndex !== -1) {
          decryptedExpenses[expenseIndex].deleted = true;
          decryptedExpenses[expenseIndex].lastModified = Timestamp.now();

          // Re-encrypt the updated expenses array
          const updatedEncryptedExpenses = await encryptAndConvertToBase64(decryptedExpenses, key);

          // Update the document in Firestore with the new encrypted data
          await updateDoc(expensesDocRef, { encryptedData: updatedEncryptedExpenses });
        }
        // Update the lastModified field in the header
        await updateDoc(expensesDocRef, { lastModified: Timestamp.now(), deleted: true });
      }
    } else {
      // This is a single expense
      const expenseDocRef = doc(userDocRef, collections.Expenses, expenseData.id);
      const expenseDoc = await getDocFromCache(expenseDocRef);
      if (!expenseDoc.exists()) {
        throw new Error("Expense not found.");
      }
      const encryptedExpenseBase64 = expenseDoc.data().encryptedData;
      const decryptedExpense = await decryptFromBase64(
        encryptedExpenseBase64.encryptedDataBase64,
        key,
        encryptedExpenseBase64.iv
      );
      decryptedExpense.deleted = true;
      decryptedExpense.lastModified = Timestamp.now();
      const updatedEncryptedExpenseBase64 = await encryptAndConvertToBase64(decryptedExpense, key);

      await updateDoc(expenseDocRef, {
        encryptedData: updatedEncryptedExpenseBase64,
        lastModified: Timestamp.now(),
        deleted: true,
      });
    }
  } catch (error) {
    throw error;
  }
};

//UPDATE
export const updateExpensetoFirestore = async (expenseData: ExpenseModel): Promise<void> => {
  try {
    const userDocRef = await getUserDocRef();
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }

    if (expenseData.batchId) {
      //multiple expenses
      const expensesRef = collection(userDocRef, collections.Expenses);
      const expensesDocRef = doc(expensesRef, expenseData.batchId);

      const expenseDoc = await getDocFromCache(expensesDocRef);
      if (expenseDoc.exists()) {
        const expenses = expenseDoc.data();

        //decrypt
        const decryptedExpenses = await decryptFromBase64(
          expenses.encryptedData.encryptedDataBase64,
          key,
          expenses.encryptedData.iv
        );

        const expenseIndex = decryptedExpenses.findIndex((expense: ExpenseModel) => expense.id === expenseData.id);
        if (expenseIndex !== -1) {
          decryptedExpenses[expenseIndex] = { ...expenseData, lastModified: Timestamp.now() };
          // Re-encrypt the updated expenses array
          const updatedEncryptedExpenses = await encryptAndConvertToBase64(decryptedExpenses, key);

          // Update the document in Firestore with the new encrypted data
          await updateDoc(expensesDocRef, { encryptedData: updatedEncryptedExpenses });
        }
        // Update the lastModified field in the header
        await updateDoc(expensesDocRef, { lastModified: Timestamp.now() });
      }
    } else {
      // This is a single expense (no Id, uses collection document ID
      const { id, ...updatedExpenseData } = expenseData;
      const expenseDocRef = doc(userDocRef, collections.Expenses, id);
      const expenseDoc = await getDocFromCache(expenseDocRef);
      if (!expenseDoc.exists()) {
        throw new Error("Expense not found.");
      }

      const encryptedExpenseBase64 = expenseDoc.data().encryptedData;
      const decryptedExpense = await decryptFromBase64(
        encryptedExpenseBase64.encryptedDataBase64,
        key,
        encryptedExpenseBase64.iv
      );

      const updatedExpense = { ...decryptedExpense, ...updatedExpenseData, lastModified: Timestamp.now() };
      const updatedEncryptedExpenseBase64 = await encryptAndConvertToBase64(updatedExpense, key);
      await updateDoc(expenseDocRef, { encryptedData: updatedEncryptedExpenseBase64, lastModified: Timestamp.now() });
    }
  } catch (error) {
    console.error("Error updating expense in Firestore:", error);
    throw error;
  } finally {
  }
};
export const updateMultipleExpenses = async (
  expensesData: ExpenseModel[],
  categoryId: string | null,
  accountId: string | null
): Promise<void> => {
  try {
    const userDocRef = await getUserDocRef();
    let batch = writeBatch(db);
    let operationCount = 0;
    const now = Timestamp.now();
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }

    // Group expenses by batchId, filtering out any with null or undefined batchId
    const groupedExpenses = expensesData.reduce((acc, expenseItem) => {
      const batchId = expenseItem.batchId;
      if (batchId) {
        // This will skip over null or undefined batchId values
        (acc[batchId] = acc[batchId] || []).push(expenseItem);
      }
      return acc;
    }, {} as Record<string, ExpenseModel[]>);

    // Process batch upload expenses
    for (const [batchId, expensesToUpdate] of Object.entries(groupedExpenses)) {
      const expensesRef = collection(userDocRef, collections.Expenses);
      const expensesDocRef = doc(expensesRef, batchId);

      const expenseDoc = await getDocFromCache(expensesDocRef);
      if (expenseDoc.exists()) {
        const expenses = expenseDoc.data();
        //decrypt
        const decryptedExpenses = await decryptFromBase64(
          expenses.encryptedData.encryptedDataBase64,
          key,
          expenses.encryptedData.iv
        );

        // Update each expense in the group
        for (const expenseItem of expensesToUpdate) {
          const expenseIndex = decryptedExpenses.findIndex((expense: ExpenseModel) => expense.id === expenseItem.id);
          if (expenseIndex !== -1) {
            // expenses[expenseIndex] = { ...expenseItem, lastModified: now, category_id: categoryId };
            const updatedExpense = { ...expenseItem, lastModified: now };
            if (categoryId) updatedExpense.category_id = categoryId;
            if (accountId) updatedExpense.account_id = accountId;
            decryptedExpenses[expenseIndex] = updatedExpense;
          }
        }
        // Re-encrypt the updated expenses array
        const updatedEncryptedExpenses = await encryptAndConvertToBase64(decryptedExpenses, key);

        // Perform a single batch update for the entire expenses array
        // update header lastmodified
        batch.update(expensesDocRef, { encryptedData: updatedEncryptedExpenses, lastModified: now });
        operationCount++;
        if (operationCount >= 500) {
          console.log("batch exceed1");
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
        }
      }
    }

    // Process single expenses
    for (const expenseItem of expensesData.filter((e) => !e.batchId)) {
      const { id, ...updatedExpenseData } = expenseItem;
      const expenseDocRef = doc(userDocRef, collections.Expenses, id);
      const expenseDoc = await getDocFromCache(expenseDocRef);
      if (!expenseDoc.exists()) {
        throw new Error("Expense not found.");
      }
      const encryptedExpenseBase64 = expenseDoc.data().encryptedData;
      //decrypt
      const decryptedExpense = await decryptFromBase64(
        encryptedExpenseBase64.encryptedDataBase64,
        key,
        encryptedExpenseBase64.iv
      );

      if (categoryId) updatedExpenseData.category_id = categoryId;
      if (accountId) updatedExpenseData.account_id = accountId;

      const updatedExpense = { ...decryptedExpense, ...updatedExpenseData, lastModified: Timestamp.now() };

      //re encrypt
      const updatedEncryptedExpenseBase64 = await encryptAndConvertToBase64(updatedExpense, key);

      batch.update(expenseDocRef, { encryptedData: updatedEncryptedExpenseBase64, lastModified: Timestamp.now() });

      operationCount++;
      if (operationCount >= 500) {
        console.log("batch exceed2");
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }
    if (operationCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Error updating multiple expenses in Firestore:", error);
    throw error;
  }
};

export const deleteMultipleExpenses = async (expensesData: ExpenseModel[]): Promise<void> => {
  try {
    const userDocRef = await getUserDocRef();
    let batch = writeBatch(db);
    let operationCount = 0;
    const now = Timestamp.now();
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }

    // Group expenses by batchId, filtering out any with null or undefined batchId
    const groupedExpenses = expensesData.reduce((acc, expenseItem) => {
      const batchId = expenseItem.batchId;
      if (batchId) {
        // This will skip over null or undefined batchId values
        (acc[batchId] = acc[batchId] || []).push(expenseItem);
      }
      return acc;
    }, {} as Record<string, ExpenseModel[]>);

    // Process batch upload expenses
    for (const [batchId, expensesToUpdate] of Object.entries(groupedExpenses)) {
      const expensesRef = collection(userDocRef, collections.Expenses);
      const expensesDocRef = doc(expensesRef, batchId);

      const expenseDoc = await getDocFromCache(expensesDocRef);
      if (expenseDoc.exists()) {
        const expenses = expenseDoc.data();
        //decrypt
        const decryptedExpenses = await decryptFromBase64(
          expenses.encryptedData.encryptedDataBase64,
          key,
          expenses.encryptedData.iv
        );

        // Update each expense in the group
        for (const expenseItem of expensesToUpdate) {
          const expenseIndex = decryptedExpenses.findIndex((expense: ExpenseModel) => expense.id === expenseItem.id);
          if (expenseIndex !== -1) {
            decryptedExpenses[expenseIndex] = { ...expenseItem, lastModified: now, deleted: true };
          }
        }
        // Re-encrypt the updated expenses array
        const updatedEncryptedExpenses = await encryptAndConvertToBase64(decryptedExpenses, key);

        // Perform a single batch update for the entire expenses array
        // update header lastmodified
        batch.update(expensesDocRef, { encryptedData: updatedEncryptedExpenses, lastModified: now });
        operationCount++;

        if (operationCount >= 500) {
          console.log("batch exceed1");
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
        }
      }
    }

    // Process single expenses
    for (const expenseItem of expensesData.filter((e) => !e.batchId)) {
      const { id, ...updatedExpenseData } = expenseItem;
      const expenseDocRef = doc(userDocRef, collections.Expenses, id);
      const expenseDoc = await getDocFromCache(expenseDocRef);
      if (!expenseDoc.exists()) {
        throw new Error("Expense not found.");
      }
      const encryptedExpenseBase64 = expenseDoc.data().encryptedData;
      //decrypt
      const decryptedExpense = await decryptFromBase64(
        encryptedExpenseBase64.encryptedDataBase64,
        key,
        encryptedExpenseBase64.iv
      );
      const updatedExpense = {
        ...decryptedExpense,
        ...updatedExpenseData,
        lastModified: Timestamp.now(),
        deleted: true,
      };

      //re encrypt
      const updatedEncryptedExpenseBase64 = await encryptAndConvertToBase64(updatedExpense, key);
      batch.update(expenseDocRef, {
        encryptedData: updatedEncryptedExpenseBase64,
        lastModified: Timestamp.now(),
        deleted: true,
      });

      operationCount++;
      if (operationCount >= 500) {
        console.log("batch exceed2");
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Error updating multiple expenses in Firestore:", error);
    throw error;
  }
};
