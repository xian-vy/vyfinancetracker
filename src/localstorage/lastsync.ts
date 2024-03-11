import { Timestamp } from "firebase/firestore";
import { convertToFirestoreTimestamp } from "../firebase/utils";

export const setLastSync = (syncDate: Timestamp) => {
  localStorage.setItem("lastsync", JSON.stringify(syncDate));
};

export const getLastSync = (): Timestamp | null => {
  const storedLastSync = localStorage.getItem("lastsync");
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
