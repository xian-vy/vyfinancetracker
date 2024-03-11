import { Timestamp } from "firebase/firestore";
import { convertToFirestoreTimestamp } from "../firebase/utils";

export const setLastSync = (syncDate: Timestamp, persistenceId: string | null) => {
  if (!persistenceId) {
    return;
  }
  localStorage.setItem("lastsync" + persistenceId, JSON.stringify(syncDate));
};

export const getLastSync = (persistenceId: string | null): Timestamp | null => {
  if (!persistenceId) {
    return null;
  }
  const storedLastSync = localStorage.getItem("lastsync" + persistenceId);
  if (storedLastSync) {
    try {
      const parsedTimestamp = JSON.parse(storedLastSync);

      return convertToFirestoreTimestamp(parsedTimestamp);
    } catch (error) {
      console.error("Error parsing last sync timestamp:", error);
    }
  }
  return null;
};
