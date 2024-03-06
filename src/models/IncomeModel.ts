import { Timestamp } from "firebase/firestore";

interface IncomeModel {
  id: string;
  category_id: string;
  amount: number;
  date: Timestamp;
  description: string;
  account_id: string;
  lastModified?: Timestamp;
  deleted?: boolean;
}

export default IncomeModel;
