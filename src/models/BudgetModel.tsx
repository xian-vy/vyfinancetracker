import { Timestamp } from "firebase/firestore";

export interface BudgetItemsModel {
  id: string;
  category_id: string;
  amount: number;
  date: Timestamp;
}
export interface BudgetModel {
  id?: string; //doc id
  budgets: BudgetItemsModel[];
  monthYear: string;
  timeframe: string;
  lastModified?: Timestamp;
}
