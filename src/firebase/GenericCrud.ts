import { Timestamp, collection, doc, getDocFromCache, setDoc, updateDoc } from "firebase/firestore";
import { collections } from "../constants/collections";
import { decryptFromBase64, encryptAndConvertToBase64 } from "../encryption/encryption";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { TransactionTypes } from "../helper/GenericTransactionHelper";
import { getUserDocRef } from "./UsersService";

type ReturnType<T> = {
  item?: T;
  id?: string;
  error: string | null;
};
interface Props<T> {
  item: T;
  collectionName: collections;
}

/****** SINGLE DOCUMENT CREATE *********************************************************/
export const createSingleDocument = async <T extends TransactionTypes & { lastModified?: Timestamp }>({
  item,
  collectionName,
}: Props<T>): Promise<ReturnType<T>> => {
  try {
    const { id, ...newItem } = item;
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }

    const now = Timestamp.now();
    newItem.lastModified = now;

    const userDocRef = await getUserDocRef();
    const collectionRef = collection(userDocRef, collectionName);
    const docRef = doc(collectionRef);
    const newId = docRef.id;

    const encryptedData64 = await encryptAndConvertToBase64(newItem, key);
    setDoc(docRef, { encryptedData: encryptedData64, lastModified: now });

    return { id: newId, error: null };
  } catch (error) {
    return { error: `error creating document ${error}` };
  }
};
/****** SINGLE DOCUMENT UPDATE *********************************************************/
export const updateSingleDocument = async <T extends TransactionTypes & { lastModified?: Timestamp }>({
  item,
  collectionName,
}: Props<T>): Promise<ReturnType<T>> => {
  const { id, ...newItem } = item;

  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    const now = Timestamp.now();

    newItem.lastModified = now;

    const userDocRef = await getUserDocRef();
    const Ref = doc(userDocRef, collectionName, id);
    const document = await getDocFromCache(Ref);

    if (!document.exists()) {
      return { error: "error updating document, Item not found" };
    }
    const encryptedDataBase64 = document.data().encryptedData;

    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    const updatedIncome = { ...decryptedData, ...newItem };
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(updatedIncome, key);

    updateDoc(Ref, { encryptedData: updatedEncryptedDataBase64, lastModified: now });

    return { error: null };
  } catch (error) {
    return { error: `error updating document ${error}` };
  }
};

/****** SINGLE DOCUMENT DELETE *********************************************************/

export const deleteSingleDocument = async <T extends TransactionTypes & { lastModified?: Timestamp }>({
  item,
  collectionName,
}: Props<T>): Promise<ReturnType<T>> => {
  const { id, ...newItem } = item;

  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    const now = Timestamp.now();

    newItem.lastModified = now;

    const userDocRef = await getUserDocRef();
    const Ref = doc(userDocRef, collectionName, id);
    const document = await getDocFromCache(Ref);

    if (!document.exists()) {
      return { error: "error deleting document, Item not found" };
    }
    const encryptedDataBase64 = document.data().encryptedData;

    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    const updatedIncome = { ...decryptedData, ...newItem };
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(updatedIncome, key);

    updateDoc(Ref, { encryptedData: updatedEncryptedDataBase64, lastModified: now });
    return { error: null };
  } catch (error) {
    return { error: `error deleting document ${error}` };
  }
};
