import { Timestamp } from "firebase/firestore";

interface BudgetItemsModel {
  id: string;
  category_id: string;
  amount: number;
  date: Timestamp;
}
interface BudgetModel {
  id?: string; //doc id
  budgets: BudgetItemsModel[];
  monthYear: string;
  timeframe: string;
  lastModified?: Timestamp;
}

export { BudgetItemsModel, BudgetModel };
