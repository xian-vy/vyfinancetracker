import {
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { decryptFromBase64 } from "../encryption/encryption";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { getPersistenceID, getUserDocRef } from "./UsersService";
import { convertToFirestoreTimestamp } from "./utils";

interface DataWithIdAndLastModified {
  id?: string;
  lastModified?: Timestamp;
}
// Optimize data fetch to reduce Firestore reads.
export const fetchTransactionData = async <T extends DataWithIdAndLastModified>(
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
    const collectionRef = collection(userDocRef, collectionName);

    /* FETCH OLD/CACHED DATA ----------------------------------------------------------------*/
    const fetchOldResult = await fetchInitialData(collectionRef, collectionName, persistenceID, mapFunction, key);
    const { initialData, firstFetch } = fetchOldResult;

    if (firstFetch) {
      return initialData;
    }

    /* FETCH NEW DATA -----------------------------------------------------------------------*/
    const fetchNewResult = await fetchNewData(collectionRef, collectionName, persistenceID, mapFunction, key);
    const newData = fetchNewResult;

    let combinedData = [...initialData, ...newData];

    /* CONFLICT RESOLUTIOON - LAST WRITE WINS -----------------------------------------------*/

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

type FetchResult<T> = {
  initialData: T[];
  firstFetch: boolean;
};
const fetchInitialData = async <T>(
  collectionRef: CollectionReference,
  collectionName: string,
  persistenceID: string,
  mapFunction: (doc: QueryDocumentSnapshot<DocumentData>, data: DocumentData) => T[],
  key: CryptoKey
): Promise<FetchResult<T>> => {
  let firstFetch = false;
  let oldSnapshot: QuerySnapshot<DocumentData> | null = null;
  let initialData: T[] = [];
  try {
    const getCollectionQ = query(collectionRef, orderBy("lastModified", "desc"));

    //check if cache data is available
    oldSnapshot = await getDocsFromCache(getCollectionQ);
    if (oldSnapshot.docs[0]) {
      storeLastModified(collectionName, persistenceID, oldSnapshot.docs[0].data().lastModified);
    } else {
      //cache data isnt available, fetch from server (first sign in or change device)
      firstFetch = true;
      oldSnapshot = await getDocsFromServer(getCollectionQ);
      if (oldSnapshot.docs[0]) {
        storeLastModified(collectionName, persistenceID, oldSnapshot.docs[0].data().lastModified);
      }
    }
    if (oldSnapshot) {
      const decryptedDataPromises = oldSnapshot.docs.map(async (doc) =>
        decryptAndMapData(doc, doc.data() as DocumentData, key, mapFunction)
      );
      initialData = (await Promise.all(decryptedDataPromises)).flat();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return { initialData, firstFetch };
};

const fetchNewData = async <T>(
  collectionRef: CollectionReference,
  collectionName: string,
  persistenceID: string,
  mapFunction: (doc: QueryDocumentSnapshot<DocumentData>, data: DocumentData) => T[],
  key: CryptoKey
): Promise<T[]> => {
  let newData: T[] = [];
  try {
    const lastModifiedString = localStorage.getItem(collectionName + "lastModified" + persistenceID);
    const lastModified = lastModifiedString ? JSON.parse(lastModifiedString) : null;
    const lastModifiedTimestamp = convertToFirestoreTimestamp(lastModified);

    const getCollectionQ = query(
      collectionRef,
      orderBy("lastModified", "desc"),
      where("lastModified", ">", lastModifiedTimestamp)
    );

    let latestSnapshot: QuerySnapshot<DocumentData> | null = null;

    latestSnapshot = await getDocs(getCollectionQ);
    if (latestSnapshot.docs[0]) {
      storeLastModified(collectionName, persistenceID, latestSnapshot.docs[0].data().lastModified);
    }

    if (latestSnapshot) {
      const latestDataPromise = latestSnapshot.docs.map(async (doc) =>
        decryptAndMapData(doc, doc.data() as DocumentData, key, mapFunction)
      );
      newData = (await Promise.all(latestDataPromise)).flat();
    }
  } catch (error) {
    console.error("Failed to fetch data from Firestore:", error);
  }
  return newData;
};

const decryptAndMapData = async <T>(
  doc: QueryDocumentSnapshot<DocumentData>,
  data: DocumentData,
  key: CryptoKey,
  mapFunction: (doc: QueryDocumentSnapshot<DocumentData>, data: DocumentData) => T[]
) => {
  const decryptedData = await decryptFromBase64(data.encryptedData.encryptedDataBase64, key, data.encryptedData.iv);

  return mapFunction(doc, decryptedData);
};

const storeLastModified = (collectionName: string, persistenceID: string, lastModified: Timestamp | null) => {
  if (lastModified) {
    localStorage.setItem(collectionName + "lastModified" + persistenceID, JSON.stringify(lastModified));
  }
};
