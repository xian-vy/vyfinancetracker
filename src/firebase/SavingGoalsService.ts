import {
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDocFromCache,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { collections } from "../constants/collections";
import { decryptFromBase64, encryptAndConvertToBase64 } from "../encryption/encryption";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import {
  default as SavingGoalsContribution,
  default as SavingGoalsContributionModel,
} from "../models/SavingGoalsContribution";
import SavingGoalsModel from "../models/SavingGoalsModel";
import { fetchTransactionData } from "./GenericFetch";
import { getUserDocRef } from "./UsersService";
import { convertToFirestoreTimestamp } from "./utils";

const mapDataToSavingsModel = (doc: QueryDocumentSnapshot<any>, data: any): SavingGoalsModel[] => {
  if (data.deleted) {
    return [];
  } else {
    return [
      {
        id: doc.id,
        description: data.description,
        notes: data.notes,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        startDate: convertToFirestoreTimestamp(data.startDate),
        endDate: convertToFirestoreTimestamp(data.endDate),
        status: data.status,
        color: data.color,
        icon: data.icon,
        autoContributionAmount: data.autoContributionAmount,
        contributionFrequency: data.contributionFrequency,
        autoContributionStatus: data.autoContributionStatus,
        lastModified: convertToFirestoreTimestamp(data.lastModified),
      },
    ];
  }
};

const mapDataToSavingsContributionModel = (doc: QueryDocumentSnapshot<any>, data: any): SavingGoalsContribution[] => {
  if (data.deleted) {
    return [];
  } else {
    return [
      {
        id: doc.id,
        savingsId: data.savingsId,
        amount: data.amount,
        date: convertToFirestoreTimestamp(data.date),
        account_id: data.account_id,
        lastModified: convertToFirestoreTimestamp(data.lastModified),
      },
    ];
  }
};

export const getSavings = async (): Promise<SavingGoalsModel[]> => {
  return fetchTransactionData<SavingGoalsModel>(collections.SavingGoals, mapDataToSavingsModel);
};

export const getSavingsContributions = async (): Promise<SavingGoalsContribution[]> => {
  return fetchTransactionData<SavingGoalsContribution>(
    collections.SavingGoalsContributions,
    mapDataToSavingsContributionModel
  );
};

//INSERT
export const addSavings = async (Savings: SavingGoalsModel): Promise<string> => {
  try {
    const { id, ...newSavings } = Savings;
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    newSavings.lastModified = Timestamp.now();

    const userDocRef = await getUserDocRef();
    const collectionRef = collection(userDocRef, collections.SavingGoals);
    const SavingsDocRef = doc(collectionRef);
    const newId = SavingsDocRef.id;

    const encryptedData64 = await encryptAndConvertToBase64(newSavings, key);
    setDoc(SavingsDocRef, { encryptedData: encryptedData64, lastModified: Timestamp.now() });

    return newId;
  } catch (error) {
    throw error;
  }
};

export const addSavingsContribution = async (contribution: SavingGoalsContribution): Promise<string> => {
  try {
    const { id, ...newContributions } = contribution;
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    newContributions.lastModified = Timestamp.now();

    const userDocRef = await getUserDocRef();
    const collectionRef = collection(userDocRef, collections.SavingGoalsContributions);
    const contributionDocRef = doc(collectionRef);
    const newId = contributionDocRef.id;

    const encryptedData64 = await encryptAndConvertToBase64(newContributions, key);
    setDoc(contributionDocRef, {
      encryptedData: encryptedData64,
      lastModified: Timestamp.now(),
      savingsId: newContributions.savingsId,
    });
    return newId;
  } catch (error) {
    console.error("Error adding contribution:", error);
    throw error;
  }
};

export const updateSavings = async (Savings: SavingGoalsModel): Promise<void> => {
  const { id, ...updatedSavingsData } = Savings;
  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    updatedSavingsData.lastModified = Timestamp.now();
    const userDocRef = await getUserDocRef();
    const Ref = doc(userDocRef, collections.SavingGoals, id);
    const savingsDoc = await getDocFromCache(Ref);
    if (!savingsDoc.exists()) {
      throw new Error("Savings not found.");
    }
    const encryptedDataBase64 = savingsDoc.data().encryptedData;

    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    const updatedSavings = { ...decryptedData, ...updatedSavingsData };
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(updatedSavings, key);
    updateDoc(Ref, { encryptedData: updatedEncryptedDataBase64, lastModified: Timestamp.now() });
  } catch (error) {
    console.error("Error updating Savings:", error);
    throw error;
  }
};

export const updateSavingsContribution = async (SavingsContribution: SavingGoalsContributionModel): Promise<void> => {
  const { id, ...updatedSavingsData } = SavingsContribution;
  const key = await retrieveKeySecurely();
  if (!key) {
    throw new Error("Missing encryption key.");
  }
  try {
    updatedSavingsData.lastModified = Timestamp.now();
    const userDocRef = await getUserDocRef();
    const Ref = doc(userDocRef, collections.SavingGoalsContributions, id);
    const contributionDoc = await getDocFromCache(Ref);
    if (!contributionDoc.exists()) {
      throw new Error("Savings not found.");
    }
    const encryptedDataBase64 = contributionDoc.data().encryptedData;

    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    const updatedSavings = { ...decryptedData, ...updatedSavingsData };
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(updatedSavings, key);
    updateDoc(Ref, { encryptedData: updatedEncryptedDataBase64, lastModified: Timestamp.now() });
  } catch (error) {
    console.error("Error updating Savings:", error);
    throw error;
  }
};

export const deleteSavings = async (SavingsID: string): Promise<void> => {
  try {
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    const userDocRef = await getUserDocRef();
    const savingsDocRef = doc(userDocRef, collections.SavingGoals, SavingsID);
    const savingsDoc = await getDocFromCache(savingsDocRef);
    if (!savingsDoc.exists()) {
      throw new Error("Savings not found.");
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

    /* Delete Savings Contributions  */
    const contributionCollectionRef = collection(userDocRef, collections.SavingGoalsContributions);
    const q = query(contributionCollectionRef, where("savingsId", "==", SavingsID));
    const querySnapshot = await getDocs(q);

    const deleteContributions = querySnapshot.docs.map((doc) => deleteSavingsContribution(doc.id));
    await Promise.all(deleteContributions);
  } catch (error) {
    throw error;
  }
};

export const deleteSavingsContribution = async (contributionId: string): Promise<void> => {
  try {
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    const userDocRef = await getUserDocRef();
    const contributionDocRef = doc(userDocRef, collections.SavingGoalsContributions, contributionId);
    const contributionDoc = await getDocFromCache(contributionDocRef);
    if (!contributionDoc.exists()) {
      throw new Error("Contribution not found.");
    }
    const encryptedDataBase64 = contributionDoc.data().encryptedData;
    //decrypt
    const decryptedData = await decryptFromBase64(encryptedDataBase64.encryptedDataBase64, key, encryptedDataBase64.iv);
    decryptedData.deleted = true;
    decryptedData.lastModified = Timestamp.now();
    //re encrypt
    const updatedEncryptedDataBase64 = await encryptAndConvertToBase64(decryptedData, key);

    await updateDoc(contributionDocRef, {
      encryptedData: updatedEncryptedDataBase64,
      lastModified: Timestamp.now(),
      deleted: true,
    });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    throw error;
  }
};
