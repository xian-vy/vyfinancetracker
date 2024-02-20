import { User, getAuth } from "firebase/auth";
import {
  DocumentData,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  getDocsFromCache,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { signOutWithGoogle } from "../Helper/AuthHelper";
import { collections } from "../constants/collections";
import { TEST_DATA } from "../constants/constants";
import { _arrayBufferToBase64, encryptAndConvertToBase64 } from "../encryption/encryption";
import { deleteIndexedDB, retrieveKeySecurely } from "../encryption/keyhandling";
import { db } from "../firebase";
import UsersModel from "../models/UsersModel";

export const getUserDocRef = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    return doc(db, collections.Users, user.uid);
  } else {
    throw new Error("No user is logged in");
  }
};
export const checkUserAgreement = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, collections.Users, user.uid);
    try {
      let userDocSnapshot: DocumentData;
      try {
        userDocSnapshot = await getDocFromCache(userDocRef);
      } catch (cacheError) {
        console.log("Failed to get document from cache, retrieving from server ");
        userDocSnapshot = await getDoc(userDocRef);
      }
      if (
        userDocSnapshot.exists() &&
        userDocSnapshot.data().hasAgreedToTermsOfUse === true &&
        userDocSnapshot.data().hasAgreedToPrivacyPolicy === true
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Failed to get user agreement status: ", error);
      throw error;
    }
  }
};

export const saveUserAndAgreement = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const agreement = {
        hasAgreedToTermsOfUse: true,
        hasAgreedToPrivacyPolicy: true,
        agreementTimestamp: Timestamp.now(),
      };
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout after   5 seconds")), 5000)
      );

      await Promise.race([
        addUsers({
          id: user.uid,
          accountCreationDate: Timestamp.now(),
          agreementDetails: agreement,
        }),
        timeoutPromise,
      ]);

      return true;
    } catch (error) {
      console.error("Failed to populate collection. ", error);
      throw error;
    }
  }
};

export const getPersistenceID = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userDocRef = doc(db, collections.Users, user.uid);
    try {
      let userDocSnapshot: DocumentData;
      try {
        userDocSnapshot = await getDocFromCache(userDocRef);
      } catch (cacheError) {
        console.log("Failed to get document from cache, retrieving from server ");
        userDocSnapshot = await getDoc(userDocRef);
      }
      if (userDocSnapshot.exists() && userDocSnapshot.data().persistenceId) {
        return userDocSnapshot.data().persistenceId;
      } else {
        throw new Error("User document does not exist or has no persistenceId");
      }
    } catch (error) {
      console.error("Failed to get persistence ID: ", error);
      throw error;
    }
  }
};

//INSERT
const addUsers = async (user: UsersModel): Promise<string> => {
  try {
    const userDocRef = doc(db, collections.Users, user.id);

    const userDocSnapshot = await getDoc(userDocRef);
    if (
      userDocSnapshot.exists() &&
      userDocSnapshot.data().hasAgreedToTermsOfUse &&
      userDocSnapshot.data().hasAgreedToPrivacyPolicy
    ) {
      return user.id;
    } else {
      if (user.agreementDetails) {
        const newUser = {
          hasAgreedToTermsOfUse: user.agreementDetails.hasAgreedToTermsOfUse,
          hasAgreedToPrivacyPolicy: user.agreementDetails.hasAgreedToPrivacyPolicy,
          agreementTimestamp: user.agreementDetails.agreementTimestamp,
          persistenceId: uuidv4(),
        };
        await setDoc(userDocRef, newUser, { merge: true });
      }
    }

    return user.id;
  } catch (error) {
    console.error("Error writing document: ", error);
    throw error;
  }
};

export const updateUserSalt = async (salt: Uint8Array): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is logged in");
    }
    const userDocRef = doc(db, collections.Users, user.uid);
    const saltBase64 = _arrayBufferToBase64(salt.buffer);

    // Test data to be encrypted
    const testData = TEST_DATA;
    // Encrypt the test data
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    const { encryptedDataBase64, iv } = await encryptAndConvertToBase64(testData, key);

    await setDoc(userDocRef, { salt: saltBase64, testEncryptedData: encryptedDataBase64, testIv: iv }, { merge: true });
  } catch (error) {
    console.error("Error updating user salt: ", error);
    throw error;
  }
};

export const retrieveUserSalt = async (): Promise<Uint8Array | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is logged in");
    }
    const userDocRef = doc(db, collections.Users, user.uid);
    const userDocSnapshot = await getDoc(userDocRef);
    const saltBase64 = userDocSnapshot.data()?.salt;

    if (saltBase64) {
      // Convert the base64 string back to a Uint8Array
      const binaryString = window.atob(saltBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    return null; // Return null if the salt is not found
  } catch (error) {
    console.error("Error retrieving user salt: ", error);
    throw error;
  }
};

export async function deleteAuthAccount(user: User): Promise<void> {
  try {
    await user.delete();
  } catch (error) {
    console.error("Error deleting user account", error);
    throw error;
  }
}

const UserData = [
  collections.Expenses,
  collections.Budgets,
  collections.Income,
  collections.SavingGoalsContributions,
  collections.SavingGoals,
  collections.AccountTypes,
  collections.Categories,
  collections.IncomeSources,
  collections.Transaction_Logs,
];

export async function deleteAccountData(): Promise<boolean> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    //await new Promise((resolve) => setTimeout(resolve, 20000));

    //unique key for user
    const persistenceID = await getPersistenceID();
    if (!user) {
      throw new Error("User is not signed In.");
    }
    console.log("Delete starts.");
    const userDocRef = doc(db, collections.Users, user.uid);
    let batch = writeBatch(db);
    let totalDeleted = 0;

    for (const collectionName of UserData) {
      const subcollectionRef = collection(userDocRef, collectionName);
      const snapshot = await getDocsFromCache(subcollectionRef);

      if (snapshot.empty) {
        continue;
      }
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        totalDeleted++;
      }
      if (totalDeleted >= 500) {
        await batch.commit();
        batch = writeBatch(db);
        totalDeleted = 0;
      }
    }
    if (totalDeleted > 0) {
      await batch.commit();
    }
    console.log("Collections deleted.");
    await deleteIndexedDB(persistenceID);
    console.log("DB deleted.");
    await deleteAuthAccount(user);
    console.log("Auth deleted.");
    await deleteDoc(userDocRef);
    console.log("Doc deleted.");
    signOutWithGoogle();

    //remove all user associated data in localstorage
    Object.keys(localStorage).forEach((key) => {
      if (key.endsWith(persistenceID)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error("Error deleting account data:", error);
    return false;
  }
}

// export async function resetAccountData() {
//   const auth = getAuth();
//   const user = auth.currentUser;

//   if (user) {
//     const userDocRef = doc(db, collections.Users, user.uid);
//     const persistenceID = await getPersistenceID();

//     const batch = writeBatch(db);
//     for (const collectionName of UserData) {
//       const subcollectionRef = collection(userDocRef, collectionName);
//       const snapshot = await getDocs(subcollectionRef);

//       snapshot.docs.forEach((doc) => {
//         batch.delete(doc.ref);
//       });
//     }
//     await batch.commit();

//     //reset user associated data in localstorage
//     Object.keys(localStorage).forEach((key) => {
//       if (key.endsWith(persistenceID)) {
//         localStorage.removeItem(key);
//       }
//     });

//     window.location.href = DASHBOARD_PATH;
//   }
// }
