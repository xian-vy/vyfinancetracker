import {
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDocFromCache,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { collections } from "../constants/collections";
import { decryptFromBase64, encryptAndConvertToBase64 } from "../encryption/encryption";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import DebtModel from "../models/DebtModel";
import { fetchTransactionData } from "./GenericFetch";
import { getUserDocRef } from "./UsersService";
import { convertToFirestoreTimestamp } from "./utils";

const mapDataToDebtsModel = (doc: QueryDocumentSnapshot<any>, data: any): DebtModel[] => {
  if (data.deleted) {
    return [];
  } else {
    return [
      {
        id: doc.id,
        entity: data.entity,
        account_id: data.account_id,
        note: data.note,
        amount: data.amount,
        startDate: convertToFirestoreTimestamp(data.startDate),
        endDate: convertToFirestoreTimestamp(data.endDate),
        status: data.status,
        isCreditor: data.isCreditor,
        // rate: data.rate,
        // frequency: data.frequency,
        lastModified: convertToFirestoreTimestamp(data.lastModified),
      },
    ];
  }
};


export const getDebts = async (): Promise<DebtModel[]> => {
  return fetchTransactionData<DebtModel>(collections.Debt, mapDataToDebtsModel);
};


//INSERT
export const addDebts = async (Debts: DebtModel): Promise<string> => {
  try {
    const { id, ...newDebts } = Debts;
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    newDebts.lastModified = Timestamp.now();

    const userDocRef = await getUserDocRef();
    const collectionRef = collection(userDocRef, collections.Debt);
    const DebtsDocRef = doc(collectionRef);
    const newId = DebtsDocRef.id;

    const encryptedData64 = await encryptAndConvertToBase64(newDebts, key);
    setDoc(DebtsDocRef, { encryptedData: encryptedData64, lastModified: Timestamp.now() });

    return newId;
  } catch (error) {
    throw error;
  }
};



export const updateDebts = async (Debts: DebtModel): Promise<void> => {
  const { id, ...updatedDebtsData } = Debts;
  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    updatedDebtsData.lastModified = Timestamp.now();
    const userDocRef = await getUserDocRef();
    const Ref = doc(userDocRef, collections.Debt, id);
    const savingsDoc = await getDocFromCache(Ref);
    if (!savingsDoc.exists()) {
      throw new Error("Debts not found.");
    }
    const encryptedDataBase64 = savingsDoc.data().encryptedData;

    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    const updatedDebts = { ...decryptedData, ...updatedDebtsData };
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(updatedDebts, key);
    updateDoc(Ref, { encryptedData: updatedEncryptedDataBase64, lastModified: Timestamp.now() });
  } catch (error) {
    console.error("Error updating Debts:", error);
    throw error;
  }
};



export const deleteDebts = async (DebtsID: string): Promise<void> => {
  try {
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    const userDocRef = await getUserDocRef();
    const savingsDocRef = doc(userDocRef, collections.Debt, DebtsID);
    const savingsDoc = await getDocFromCache(savingsDocRef);
    if (!savingsDoc.exists()) {
      throw new Error("Debts not found.");
    }
    const encryptedDataBase64 = savingsDoc.data().encryptedData;
    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    decryptedData.deleted = true;
    decryptedData.lastModified = Timestamp.now();
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(decryptedData, key);

    await updateDoc(savingsDocRef, {
      encryptedData: updatedEncryptedDataBase64,
      lastModified: Timestamp.now(),
      deleted: true,
    });

  } catch (error) {
    throw error;
  }
};
