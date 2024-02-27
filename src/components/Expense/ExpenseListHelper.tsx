import React from "react";
import ExpenseModel from "../../models/ExpenseModel";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { deleteMultipleExpensesAction, updateMultpleExpensesAction } from "../../redux/actions/expenseAction";
import { retrieveKeySecurely } from "../../encryption/keyhandling";
import { Timestamp, writeBatch, doc, collection } from "firebase/firestore";
import { txn_types, operation_types, collections } from "../../constants/collections";
import { encryptAndConvertToBase64 } from "../../encryption/encryption";
import { db } from "../../firebase";
import { getUserDocRef } from "../../firebase/UsersService";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { v4 as uuidv4 } from "uuid";
import { async_result } from "../../constants/constants";

type Props = {
  dispatch: ThunkDispatch<any, any, any>;
  actionType: string | null;
  selectedExpenses: ExpenseModel[];
  shouldUpdateCategory: boolean;
  shouldUpdateAccount: boolean;
  newCategoryId: string | null;
  newAccountId: string | null;
};

export const saveMultipleExpenses = async ({
  dispatch,
  actionType,
  selectedExpenses,
  shouldUpdateCategory,
  shouldUpdateAccount,
  newCategoryId,
  newAccountId,
}: Props): Promise<async_result> => {
  let operation = "";

  try {
    if (actionType === "update") {
      await dispatch(
        updateMultpleExpensesAction({
          expenseData: selectedExpenses,
          categoryId: shouldUpdateCategory ? newCategoryId : null,
          accountId: shouldUpdateAccount ? newAccountId : null,
        })
      );
      operation = "updated";
    } else if (actionType === "delete") {
      const resultAction = await dispatch(deleteMultipleExpensesAction(selectedExpenses));
      if (deleteMultipleExpensesAction.fulfilled.match(resultAction)) {
        const key = await retrieveKeySecurely();
        if (!key) {
          throw new Error("Missing encryption key.");
        }
        const now = Timestamp.now();
        const batch = writeBatch(db);
        const batchId = uuidv4();
        const userDocRef = await getUserDocRef();
        let logsToSave: TransactionLogsModel[] = [];

        selectedExpenses.map((expense) => {
          const log: TransactionLogsModel = {
            txn_id: uuidv4(),
            txn_ref_id: expense.id,
            txn_type: txn_types.Expenses,
            operation: operation_types.Delete,
            category_id: expense.category_id,
            account_id: expense.account_id,
            amount: expense.amount,
            lastModified: now,
          };
          logsToSave.push(log);
        });
        const logsDocRef = doc(collection(userDocRef, collections.Transaction_Logs), batchId);
        const encryptedLogsBase64 = await encryptAndConvertToBase64(logsToSave, key);
        batch.set(logsDocRef, { encryptedData: encryptedLogsBase64, lastModified: now, isMultiple: true });
        batch.commit();
        operation = "deleted";
      }
    }
    return async_result.success;
  } catch (error) {
    console.error(error);
    return async_result.error;
  }
};
