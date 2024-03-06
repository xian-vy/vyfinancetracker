import { Timestamp } from "firebase/firestore";

interface TransactionLogsModel {
  txn_id: string;
  txn_ref_id: string;
  txn_type: string;
  operation: string;
  category_id: string;
  account_id: string;
  amount: number;
  batchId?: string;
  lastModified: Timestamp;
}

export default TransactionLogsModel;
