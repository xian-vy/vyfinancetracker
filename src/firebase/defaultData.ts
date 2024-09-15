import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { collections, subcollections } from "../constants/collections";
import { db } from "../firebase";
// Array of colors used in the CirclePicker
const colors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#9e9e9e",
  "#607d8b",
];

export const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

const categories = [
  {
    description: "Meals",
    color: "#ff9800",
    icon: "Dine",
  },
  {
    description: "Snacks",
    color: "#9c27b0",
    icon: "Pizza",
  },
  {
    description: "Groceries",
    color: "#2196f3",
    icon: "GroceryStore",
  },
  {
    description: "Transportation",
    color: "#795548",
    icon: "Taxi",
  },
  {
    description: "Utilities",
    color: "#e91e63",
    icon: "Utility",
  },
  {
    description: "Monthly Rent",
    color: "#795548",
    icon: "House",
  },
  {
    description: "Online Shopping",
    color: "#ff5722",
    icon: "ShoppingBasket",
  },
  {
    description: "Swap Account",
    color: "#8bc34a",
    icon: "Swap Account",
  },
  {
    description: "Uncategorized",
    color: "#607d8b",
    icon: "Uncategorized",
  },
];

const incomesources = [
  {
    description: "Salary/Wage",
    color: "#ff5722",
    icon: "Dollar",
  },
  {
    description: "Investment Income",
    color: "#e91e63",
    icon: "Crypto",
  },
  {
    description: "Business Income",
    color: "#2196f3",
    icon: "Store",
  },
  {
    description: "Freelance/Contract Work",
    color: "#9c27b0",
    icon: "Freelance",
  },
  {
    description: "Swap Account",
    color: "#8bc34a",
    icon: "Swap Account",
  },
  {
    description: "Uncategorized",
    color: "#607d8b",
    icon: "Uncategorized",
  },
];

const Account_Type = [
  {
    description: "Cash",
    color: "#00bcd4",
    icon: "Money",
  },
  {
    description: "Credit Card",
    color: "#ff9800",
    icon: "Credit",
  },
  {
    description: "Bank",
    color: "#2196f3",
    icon: "Bank",
  },
  {
    description: "Uncategorized",
    color: "#607d8b",
    icon: "Uncategorized",
  },
];

export const mock_categories = {
  Category: categories,
  Income_source: incomesources,
  Account_Type: Account_Type,
};

export async function populateFirestoreCollection() {
  const auth = getAuth();
  const user = auth.currentUser;
  try {
    if (!user) {
      console.error("Unauthorized user.");
      return;
    }
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));

    await Promise.race([
      Promise.all([populateAccountTypes(user.uid), populateCategories(user.uid), populateIncomeSources(user.uid)]),
      timeoutPromise,
    ]);
    return true;
  } catch (error) {
    console.error("Error populating Firestore collection:", error);
  }
}

export async function populateCategories(uid: string) {
  const userDocRef = doc(db, collections.Users, uid);
  const categoryCollectionRef = collection(userDocRef, collections.Categories);
  const categoryCollectionSnapshot = await getDocs(categoryCollectionRef);

  if (categoryCollectionSnapshot.empty) {
    const batch = writeBatch(db);
    const docRef = doc(categoryCollectionRef, subcollections.categories);
    const categories = mock_categories.Category.map((category) => ({ id: uuidv4(), ...category }));
    batch.set(docRef, { categories: categories });
    await batch.commit();
  }
}
export async function populateIncomeSources(uid: string) {
  const userDocRef = doc(db, collections.Users, uid);
  const incomeSourceCollectionRef = collection(userDocRef, collections.IncomeSources);
  const incomeSourceCollectionSnapshot = await getDocs(incomeSourceCollectionRef);

  if (incomeSourceCollectionSnapshot.empty) {
    const batch = writeBatch(db);
    const docRef = doc(incomeSourceCollectionRef, subcollections.incomesources);
    const accounttypes = mock_categories.Income_source.map((incomesource) => ({ id: uuidv4(), ...incomesource }));
    batch.set(docRef, { incomesources: accounttypes });
    await batch.commit();
  }
}

export async function populateAccountTypes(uid: string) {
  const userDocRef = doc(db, collections.Users, uid);
  const ptypeCollectionRef = collection(userDocRef, collections.AccountTypes);
  const ptypeCollectionSnapshot = await getDocs(ptypeCollectionRef);

  if (ptypeCollectionSnapshot.empty) {
    const batch = writeBatch(db);
    const docRef = doc(ptypeCollectionRef, subcollections.accounttypes);
    const accounttypes = mock_categories.Account_Type.map((accounts) => ({ id: uuidv4(), ...accounts }));
    batch.set(docRef, { accounttypes: accounttypes });
    await batch.commit();
  }
}
