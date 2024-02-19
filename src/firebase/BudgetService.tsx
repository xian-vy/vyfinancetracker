import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDocFromCache,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { BudgetItemsModel, BudgetModel } from "../models/BudgetModel";
import { fetchCachedData } from "./GenericFetch";
import { getUserDocRef } from "./UsersService";
import { collections } from "../constants/collections";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { decryptFromBase64, encryptAndConvertToBase64 } from "../encryption/encryption";
import { convertToFirestoreTimestamp } from "./utils";

const mapDataToBudgetModel = (doc: QueryDocumentSnapshot, data: DocumentData): BudgetModel[] => {
  const budgets = data.budgets;
  data.budgets = budgets.map((budgetItem: BudgetItemsModel) => {
    const dateTimestamp = convertToFirestoreTimestamp(budgetItem.date);
    return { ...budgetItem, date: dateTimestamp };
  });

  const budgetModel: BudgetModel = {
    budgets: data.budgets,
    id: doc.id,
    monthYear: data.monthYear,
    timeframe: data.timeframe,
    lastModified: data.lastModified,
  };
  return [budgetModel];
};
export const getBudget = async (): Promise<BudgetModel[]> => {
  return fetchCachedData<BudgetModel>(collections.Budgets, mapDataToBudgetModel);
};

export const addBudget = async (budgetModel: BudgetModel): Promise<BudgetModel> => {
  const userDocRef = await getUserDocRef();

  const budgetDocRef = doc(collection(userDocRef, collections.Budgets));

  const budgetData = {
    ...budgetModel,
    lastModified: Timestamp.now(),
  };

  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  const encryptedData64 = await encryptAndConvertToBase64(budgetData, key);

  setDoc(budgetDocRef, { encryptedData: encryptedData64, lastModified: Timestamp.now() });

  return {
    ...budgetData,
    id: budgetDocRef.id,
  };
};

export const updateBudget = async (budget: BudgetModel) => {
  if (!budget.id) {
    throw new Error("Budget must have an 'id' property to update");
  }
  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  const updatedBudgetData = {
    ...budget,
    lastModified: Timestamp.now(),
  };

  try {
    const userDocRef = await getUserDocRef();
    const budgetDocRef = doc(userDocRef, collections.Budgets, budget.id);
    const budgetDoc = await getDocFromCache(budgetDocRef);
    if (!budgetDoc.exists()) {
      throw new Error("Budget not found.");
    }

    const encryptedDataBase64 = budgetDoc.data().encryptedData;

    //decrypt
    const decryptedBudget = await decryptFromBase64(
      encryptedDataBase64.encryptedDataBase64,
      key,
      encryptedDataBase64.iv
    );
    const updatedBudget = { ...decryptedBudget, ...updatedBudgetData };
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(updatedBudget, key);

    updateDoc(budgetDocRef, { encryptedData: updatedEncryptedDataBase64, lastModified: Timestamp.now() });
  } catch (error) {
    console.error("Error updating Budget:", error);
    throw error;
  }
};
