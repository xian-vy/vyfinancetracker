// src/models/Expense

import { Timestamp } from "firebase/firestore";

interface ExpenseModel {
  id: string;
  description: string;
  amount: number;
  date: Timestamp;
  account_id: string;
  category_id: string;
  batchId?: string | null;
  lastModified?: Timestamp;
  deleted?: boolean;
}

export default ExpenseModel;
