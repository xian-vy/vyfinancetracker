import { Timestamp } from "firebase/firestore";

interface DebtModel {
  id: string;
  name: string;
  description: string;
  amount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  // rate: number;
  // frequency: string;
  status: string;
  lastModified?: Timestamp;
}

export default DebtModel;
