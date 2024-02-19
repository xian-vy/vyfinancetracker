import {
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  getDocs,
  getDocsFromCache,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { decryptFromBase64 } from "../encryption/encryption";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { getPersistenceID, getUserDocRef } from "./UsersService";
import { convertToFirestoreTimestamp } from "./utils";

interface IDataWithIdAndLastModified {
  id?: string;
  lastModified?: Timestamp;
}

export const fetchCachedData = async <T extends IDataWithIdAndLastModified>(
  collectionName: string,
  mapFunction: (doc: QueryDocumentSnapshot<DocumentData>, data: DocumentData) => T[]
): Promise<T[]> => {
  try {
    const key = await retrieveKeySecurely();
    if (!key) {
      throw new Error("Missing encryption key.");
    }
    const persistenceID = await getPersistenceID();
    const userDocRef = await getUserDocRef();

    const col = collection(userDocRef, collectionName);
    let firstFetch = false;

    let querySnapshot: QuerySnapshot<DocumentData> | null = null;

    // Fetch the data from the cache
    const q = query(col, orderBy("lastModified", "desc"));
    querySnapshot = await getDocsFromCache(q);
    // Store the last modified timestamp in local storage
    if (querySnapshot.docs[0]) {
      const data = querySnapshot.docs[0].data() as DocumentData;
      if (data.lastModified) {
        localStorage.setItem(collectionName + "lastModified" + persistenceID, JSON.stringify(data.lastModified));
      }
    } else {
      firstFetch = true;
      const q = query(col, orderBy("lastModified", "desc"));
      querySnapshot = await getDocs(q);
      if (querySnapshot.docs[0]) {
        const data = querySnapshot.docs[0].data() as DocumentData;
        if (data.lastModified) {
          localStorage.setItem(collectionName + "lastModified" + persistenceID, JSON.stringify(data.lastModified));
        }
      }
    }

    let decryptedDataPromises = querySnapshot.docs.map(async (doc) =>
      decryptAndMapData(doc, doc.data() as DocumentData, key, mapFunction)
    );
    let decryptedData = (await Promise.all(decryptedDataPromises)).flat();

    if (firstFetch) {
      return decryptedData;
    }

    //decryptedData isn't empty, check and append newer data from server
    let newData: T[] = [];

    if (decryptedData.length > 0) {
      newData = await tryFetchNewerData(collectionName, mapFunction, persistenceID, col, newData, key);
    }

    let combinedData = [...decryptedData, ...newData];

    //Conflict Resolution, last write wins
    if (newData.length > 0) {
      const map = new Map();
      combinedData.forEach((newItem) => {
        const existingItem = map.get(newItem.id);

        if (
          !existingItem ||
          (newItem.lastModified &&
            newItem.lastModified.toDate().getTime() > existingItem.lastModified.toDate().getTime())
        ) {
          //set will override/update existing item
          map.set(newItem.id, newItem);
        }
      });
      combinedData = Array.from(map.values());
    }

    return combinedData;
  } catch (error) {
    throw error;
  }
};

const tryFetchNewerData = async <T,>(
  collectionName: string,
  mapFunction: (doc: QueryDocumentSnapshot<DocumentData>, data: DocumentData) => T[],
  persistenceID: string,
  col: CollectionReference,
  latestData: T[],
  key: CryptoKey
): Promise<T[]> => {
  const lastModifiedString = localStorage.getItem(collectionName + "lastModified" + persistenceID);
  const lastModified = lastModifiedString ? JSON.parse(lastModifiedString) : null;
  const lastModifiedTimestamp = convertToFirestoreTimestamp(lastModified);

  const q = query(col, orderBy("lastModified", "desc"), where("lastModified", ">", lastModifiedTimestamp));

  // console.log("new data", timestamp.toDate());
  let latestSnapshot: QuerySnapshot<DocumentData> | null = null;
  try {
    latestSnapshot = await getDocs(q);
    if (latestSnapshot.docs[0]) {
      const data = latestSnapshot.docs[0].data() as DocumentData;
      if (data.lastModified) {
        localStorage.setItem(collectionName + "lastModified" + persistenceID, JSON.stringify(data.lastModified));
      }
    }
  } catch (error) {
    console.error("Failed to fetch data from Firestore:", error);
  }

  let latestDataPromise: Promise<T[]>[] = [];
  if (latestSnapshot) {
    latestDataPromise = latestSnapshot.docs.map(async (doc) =>
      decryptAndMapData(doc, doc.data() as DocumentData, key, mapFunction)
    );
    latestData = (await Promise.all(latestDataPromise)).flat();
  }
  return latestData;
};

const decryptAndMapData = async <T,>(
  doc: QueryDocumentSnapshot<DocumentData>,
  data: DocumentData,
  key: CryptoKey,
  mapFunction: (doc: QueryDocumentSnapshot<DocumentData>, data: DocumentData) => T[]
) => {
  const decryptedData = await decryptFromBase64(data.encryptedData.encryptedDataBase64, key, data.encryptedData.iv);

  return mapFunction(doc, decryptedData);
};
