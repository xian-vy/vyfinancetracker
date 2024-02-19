import {
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDocFromCache,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import IncomeModel from "../models/IncomeModel";
import { fetchCachedData } from "./GenericFetch";
import { getUserDocRef } from "./UsersService";
import { collections } from "../constants/collections";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { decryptFromBase64, encryptAndConvertToBase64 } from "../encryption/encryption";
import { convertToFirestoreTimestamp } from "./utils";

const mapDataToIncomeModel = (doc: QueryDocumentSnapshot<any>, data: any): IncomeModel[] => {
  if (data.deleted) {
    return [];
  } else {
    return [
      {
        id: doc.id,
        category_id: data.category_id,
        amount: data.amount,
        date: convertToFirestoreTimestamp(data.date),
        description: data.description,
        account_id: data.account_id,
        lastModified: data.lastModified,
      },
    ];
  }
};

export const getIncome = async (): Promise<IncomeModel[]> => {
  return fetchCachedData<IncomeModel>(collections.Income, mapDataToIncomeModel);
};

//INSERT
export const addIncome = async (income: IncomeModel): Promise<string> => {
  try {
    const { id, ...newIncome } = income;
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    newIncome.lastModified = Timestamp.now();

    const userDocRef = await getUserDocRef();
    const collectionRef = collection(userDocRef, collections.Income);
    const incomeDocRef = doc(collectionRef);
    const newId = incomeDocRef.id;

    const encryptedData64 = await encryptAndConvertToBase64(newIncome, key);
    setDoc(incomeDocRef, { encryptedData: encryptedData64, lastModified: Timestamp.now() });

    return newId;
  } catch (error) {
    throw error;
  }
};

export const updateIncome = async (income: IncomeModel): Promise<void> => {
  const { id, ...newIncome } = income;
  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    newIncome.lastModified = Timestamp.now();
    const userDocRef = await getUserDocRef();
    const Ref = doc(userDocRef, collections.Income, id);
    const incomeDoc = await getDocFromCache(Ref);
    if (!incomeDoc.exists()) {
      throw new Error("Income not found.");
    }
    const encryptedDataBase64 = incomeDoc.data().encryptedData;

    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    const updatedIncome = { ...decryptedData, ...newIncome };
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(updatedIncome, key);

    updateDoc(Ref, { encryptedData: updatedEncryptedDataBase64, lastModified: Timestamp.now() });
  } catch (error) {
    console.error("Error updating Income:", error);
    throw error;
  }
};

export const deleteIncome = async (incomeID: string): Promise<void> => {
  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    const userDocRef = await getUserDocRef();
    const Ref = doc(userDocRef, collections.Income, incomeID);
    const incomeDoc = await getDocFromCache(Ref);
    if (!incomeDoc.exists()) {
      throw new Error("Income not found.");
    }
    const encryptedDataBase64 = incomeDoc.data().encryptedData;
    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    decryptedData.deleted = true;
    decryptedData.lastModified = Timestamp.now();
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(decryptedData, key);

    await updateDoc(Ref, { encryptedData: updatedEncryptedDataBase64, lastModified: Timestamp.now(), deleted: true });
  } catch (error) {
    throw error;
  }
};
