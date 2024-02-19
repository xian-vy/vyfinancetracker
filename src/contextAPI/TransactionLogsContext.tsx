import { QueryDocumentSnapshot, Timestamp, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getStartAndEndDate } from "../Helper/date";
import { collections } from "../constants/collections";
import { encryptAndConvertToBase64 } from "../encryption/encryption";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { db } from "../firebase";
import { fetchCachedData } from "../firebase/GenericFetch";
import { getUserDocRef } from "../firebase/UsersService";
import { convertToFirestoreTimestamp } from "../firebase/utils";
import TransactionLogsModel from "../models/TransactionLogsModel";

interface TransactionLogsModelType {
  logs: TransactionLogsModel[];
  saveLogs: (logs: TransactionLogsModel) => Promise<void>;
  saveBatchLogs: (logs: TransactionLogsModel[]) => Promise<void>;
  fetchLogsByTimeframe: (filterOption: string, startDate?: Date, endDate?: Date) => Promise<void>;
  loading: boolean;
}

const TransactionLogsContext = createContext<TransactionLogsModelType>({
  logs: [],
  saveLogs: async () => {},
  saveBatchLogs: async () => {},
  fetchLogsByTimeframe: async () => {},
  loading: true,
});

export const useTransactionLogsContext = () => {
  return useContext(TransactionLogsContext);
};

const mapDataToLogsModel = (doc: QueryDocumentSnapshot<any>, data: any): TransactionLogsModel[] => {
  if (doc.data().isMultiple) {
    // This is a batch upload
    return data.map((log: TransactionLogsModel) => ({
      txn_id: log.txn_id,
      txn_ref_id: log.txn_ref_id,
      txn_type: log.txn_type,
      operation: log.operation,
      category_id: log.category_id,
      account_id: log.account_id,
      amount: log.amount,
      lastModified: convertToFirestoreTimestamp(log.lastModified),
    }));
  } else {
    // This is a single log
    return [
      {
        txn_id: doc.id,
        txn_ref_id: data.txn_ref_id,
        txn_type: data.txn_type,
        operation: data.operation,
        category_id: data.category_id,
        account_id: data.account_id,
        amount: data.amount,
        lastModified: convertToFirestoreTimestamp(data.lastModified),
      },
    ];
  }
};

export const TransactionLogsProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<TransactionLogsModel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogsByTimeframe = async (filterOption: string, startDateParam?: Date, endDateParam?: Date) => {
    const cachedLogs = await fetchCachedData<TransactionLogsModel>(collections.Transaction_Logs, mapDataToLogsModel);

    const { startDate, endDate } = getStartAndEndDate(filterOption, startDateParam, endDateParam);

    const filteredLogs = cachedLogs.filter((log) => {
      const logDate = new Date(log.lastModified.toDate());

      return logDate >= startDate && logDate <= endDate;
    });

    setLogs(filteredLogs);
  };
  const saveLogs = async (logs: TransactionLogsModel) => {
    try {
      const userDocRef = await getUserDocRef();

      const newLogs = {
        txn_ref_id: logs.txn_ref_id,
        txn_type: logs.txn_type,
        operation: logs.operation,
        category_id: logs.category_id,
        account_id: logs.account_id,
        amount: logs.amount,
        lastModified: Timestamp.now(),
      };

      const key = await retrieveKeySecurely();
      if (!key) {
        throw new Error("Missing encryption key.");
      }
      const encryptedLogBase64 = await encryptAndConvertToBase64(newLogs, key);

      const CollectionRef = collection(userDocRef, collections.Transaction_Logs);
      const docRef = doc(CollectionRef);

      setDoc(docRef, { encryptedData: encryptedLogBase64, lastModified: Timestamp.now() });
    } catch (error) {
      console.error("Error adding new Logs", error);
    } finally {
      setLoading(false);
    }
  };
  const saveBatchLogs = async (logsToSave: TransactionLogsModel[]) => {
    try {
      const userDocRef = await getUserDocRef();
      const batchId = uuidv4();
      const batch = writeBatch(db);

      const logsDocRef = doc(collection(userDocRef, collections.Transaction_Logs), batchId);

      const key = await retrieveKeySecurely();
      if (!key) {
        throw new Error("Missing encryption key.");
      }
      const updatedLogsToSave = logsToSave.map((log) => ({
        ...log,
        lastModified: Timestamp.now(),
      }));
      const encryptedLogBase64 = await encryptAndConvertToBase64(updatedLogsToSave, key);
      batch.set(logsDocRef, { encryptedData: encryptedLogBase64, lastModified: Timestamp.now(), isMultiple: true });
      batch.commit();
    } catch (error) {
      console.error("Error saving batch Logs", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionLogsContext.Provider value={{ logs, saveLogs, fetchLogsByTimeframe, loading, saveBatchLogs }}>
      {children}
    </TransactionLogsContext.Provider>
  );
};
