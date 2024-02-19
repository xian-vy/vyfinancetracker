import { Timestamp } from "firebase/firestore";

interface SavingGoalsContributionModel {
  id: string;
  savingsId: string;
  amount: number;
  date: Timestamp;
  account_id: string;
  lastModified?: Timestamp;
  deleted?: boolean;
}

export default SavingGoalsContributionModel;
