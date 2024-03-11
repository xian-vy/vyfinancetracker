import { Timestamp, collection, getDocsFromServer, query } from "firebase/firestore";
import AccountsIcons from "../media/AccountsIcons";
import CategoryIcons from "../media/CategoryIcons";
import IncomeSourceIcons from "../media/IncomeSourceIcons";
import SavingsIcons from "../media/SavingsIcons";
import { getUserDocRef } from "./UsersService";
import AccountTypeModel from "../models/AccountTypeModel";
import CategoryModel from "../models/CategoryModel";
import IncomeSourcesModel from "../models/IncomeSourcesModel";
import SavingGoalsModel from "../models/SavingGoalsModel";
import { CategoriesType } from "../helper/GenericTransactionHelper";

export const hasInternetConnection = async () => {
  try {
    const userDocRef = await getUserDocRef();
    const col = collection(userDocRef, "Users");
    const q = query(col);

    const firestorePromise = getDocsFromServer(q);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), 5000));

    await Promise.race([firestorePromise, timeoutPromise]);
    return true;
  } catch (error) {
    return false;
  }
};

export const getCategoryAndAccountTypeDescription = (id: string, model: CategoriesType[]) => {
  const Model = model.find((modelname) => modelname.id === id);
  return Model ? Model.description : "";
};

export const getColorbyDescription = (description: string, category: CategoriesType[]) => {
  const Category = category.find((category) => category.description === description);
  return Category ? Category.color : "";
};
export const getCategoriesIDByDescription = (description: string, category: CategoriesType[]) => {
  const Category = category.find((category) => category.description === description);
  return Category ? Category.id : "";
};

export const getIncomeSourceDetails = (context: IncomeSourcesModel[], id: string) => {
  const data = context.find((data) => data.id === id);
  const color = data?.color;
  const categoryIcon = IncomeSourceIcons.find((icon) => icon.name === data?.icon);
  const description = data?.description;
  return { data, color, categoryIcon, description };
};

export const getCategoryDetails = (context: CategoryModel[], id: string) => {
  const data = context.find((data) => data.id === id);
  const color = data?.color;
  const categoryIcon = CategoryIcons.find((icon) => icon.name === data?.icon);
  const description = data?.description;
  return { data, color, categoryIcon, description };
};

export const getSavingsDetails = <K extends Partial<CategoriesType>>(savings: K[], savingsid: string) => {
  const data = savings.find((data) => data.id === savingsid);
  const color = data?.color;
  const categoryIcon = SavingsIcons.find((icon) => icon.name === data?.icon);
  const description = data?.description;
  return { data, color, categoryIcon, description };
};

export const getSavingsIDByDescription = (description: string, savings: SavingGoalsModel[]) => {
  const Savings = savings.find((category) => category.description === description);
  return Savings ? Savings.id : "";
};

export const getAccountsDetails = (context: AccountTypeModel[], id: string) => {
  const data = context.find((data) => data.id === id);
  const color = data?.color;
  const categoryIcon = AccountsIcons.find((icon) => icon.name === data?.icon);
  const description = data?.description;
  return { data, color, categoryIcon, description };
};

export async function retryPromise<T>(
  promiseFunction: () => Promise<T>,
  maxAttempts: number,
  delay: number
): Promise<T | undefined> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await promiseFunction();
      return result; // If the promise resolves, return the result
    } catch (error) {
      if (attempt === maxAttempts) {
        return undefined; // If we've reached the max attempts, return undefined
      }
      await new Promise((resolve) => setTimeout(resolve, delay)); // Wait for the specified delay
    }
  }
  return undefined; // In case the loop finishes without returning (should not happen)
}

export function convertToFirestoreTimestamp(timestampObj: { seconds: number; nanoseconds: number }): Timestamp {
  return Timestamp.fromMillis(timestampObj.seconds * 1000 + Math.floor(timestampObj.nanoseconds / 1e6));
}
