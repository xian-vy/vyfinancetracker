/* !!!! DO NOT CHANGE !!!!*/
export const TEST_DATA = "This is a test string for encryption and decryption.";
export const ITERATIONS = 1000000;
export const APP_NAME = "VyFinanceTracker";
/* !!!! ------------- !!!!*/

export enum async_result {
  success = "success",
  failed = "failed",
  nochange = "no change",
  error = "error",
  timeout = "timeout",
  duplicate = "duplicate",
}

export enum SORT_TYPE {
  date = "Date",
  amount = "Amount",
}
