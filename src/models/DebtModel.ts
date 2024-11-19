import { Timestamp } from "firebase/firestore";
import { DEBT_STATUS } from "../constants/constants";

interface DebtModel {
  id: string;
  entity : string;
  note: string;
  amount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  isCreditor: boolean;
  account_id : string;
  // rate: number;
  // frequency: string;
  status: DEBT_STATUS;
  lastModified?: Timestamp;
}

export default DebtModel;
