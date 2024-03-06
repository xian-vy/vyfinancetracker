import { Timestamp } from "firebase/firestore";

interface SavingGoalsModel {
  id: string;
  description: string;
  notes: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: string;
  autoContributionAmount: number;
  contributionFrequency: string;
  autoContributionStatus: number;
  lastModified?: Timestamp;
  deleted?: boolean;
}

export default SavingGoalsModel;
