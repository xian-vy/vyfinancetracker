import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AccountTypeModel from "../models/AccountTypeModel";
import { getUserDocRef } from "../firebase/UsersService";
import { RootState } from "../redux/store";
import { collections, subcollections } from "../constants/collections";

interface AccountTypeContextType {
  accountType: AccountTypeModel[];
  addAccountType: (newAccountType: AccountTypeModel) => Promise<AccountTypeModel>;
  deleteAccountType: (id: string) => void;
  updateAccountType: (newAccountType: AccountTypeModel) => void;
  loading: boolean;
}

const AccountTypeContext = createContext<AccountTypeContextType>({
  accountType: [],
  addAccountType: async () => {
    return {
      id: "",
      description: "",
      color: "",
      icon: "",
    };
  },
  deleteAccountType: async () => {},
  updateAccountType: async () => {},
  loading: true,
});

export const useAccountTypeContext = () => {
  return useContext(AccountTypeContext);
};

export const AccountTypeProvider = ({ children }: { children: ReactNode }) => {
  const [accountType, setAccountType] = useState<AccountTypeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        const userDocRef = await getUserDocRef();
        const docRef = doc(userDocRef, collections.AccountTypes, subcollections.accounttypes);

        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();
        if (data) {
          setAccountType(data.accounttypes);
          setLoading(false);
        }
      }
    };

    fetchAccounts();
  }, [user]);

  const addAccountType = async (AccountType: AccountTypeModel): Promise<AccountTypeModel> => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.AccountTypes, subcollections.accounttypes);

      const newCategories = [...accountType, AccountType];
      updateDoc(docRef, { accounttypes: newCategories });

      setAccountType(newCategories);

      return AccountType;
    } catch (error) {
      console.error("Error adding new AccountType", error);
      return {
        id: "",
        description: "",
        color: "",
        icon: "",
      };
    }
  };

  const updateAccountType = async (AccountType: AccountTypeModel) => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.AccountTypes, subcollections.accounttypes);

      const updatedCategories = accountType.map((acc) => (acc.id === AccountType.id ? AccountType : acc));
      updateDoc(docRef, { accounttypes: updatedCategories });

      setAccountType(updatedCategories);
    } catch (error) {
      console.error("Error updating AccountType:", error);
      throw error;
    }
  };

  const deleteAccountType = async (AccountTypeId: string) => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.AccountTypes, subcollections.accounttypes);

      const remainingCategories = accountType.filter((cat) => cat.id !== AccountTypeId);
      updateDoc(docRef, { accounttypes: remainingCategories });

      setAccountType(remainingCategories);
    } catch (error) {
      console.error("Error deleting AccountType", error);
    }
  };

  return (
    <AccountTypeContext.Provider value={{ accountType, addAccountType, deleteAccountType, updateAccountType, loading }}>
      {children}
    </AccountTypeContext.Provider>
  );
};
