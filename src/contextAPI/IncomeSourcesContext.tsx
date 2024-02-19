import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import IncomeSourcesModel from "../models/IncomeSourcesModel";
import { getUserDocRef } from "../firebase/UsersService";
import { RootState } from "../redux/store";
import React from "react";
import { collections, subcollections } from "../constants/collections";

type IncomeSourcesContextType = {
  incomeSource: IncomeSourcesModel[];
  addIncomeSource: (newIncomeSource: IncomeSourcesModel) => void;
  updateIncomeSource: (newIncomeSource: IncomeSourcesModel) => void;
  deleteIncomeSources: (id: string) => void;
  loading: boolean;
};

const IncomeSourcesContext = createContext<IncomeSourcesContextType>({
  incomeSource: [],
  addIncomeSource: async () => {},
  updateIncomeSource: async () => {},
  deleteIncomeSources: async () => {},
  loading: true,
});
export const useIncomeSourcesContext = () => {
  return useContext(IncomeSourcesContext);
};

export const IncomeSourcesProvider = ({ children }: { children: ReactNode }) => {
  const [incomeSource, setIncomeSource] = useState<IncomeSourcesModel[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchIncomeSources = async () => {
      if (user) {
        const userDocRef = await getUserDocRef();
        const docRef = doc(userDocRef, collections.IncomeSources, subcollections.incomesources);

        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();
        if (data) {
          setIncomeSource(data.incomesources);
          setLoading(false);
        }
      }
    };

    fetchIncomeSources();
  }, [user]);

  const addIncomeSource = async (IncomeSource: IncomeSourcesModel): Promise<IncomeSourcesModel> => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.IncomeSources, subcollections.incomesources);

      const newIncomeSource = [...incomeSource, IncomeSource];
      updateDoc(docRef, { incomesources: newIncomeSource });

      setIncomeSource(newIncomeSource);

      return IncomeSource;
    } catch (error) {
      console.error("Error adding new IncomeSource", error);
      return {
        id: "",
        description: "",
        color: "",
        icon: "",
      };
    }
  };

  const updateIncomeSource = async (IncomeSource: IncomeSourcesModel) => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.IncomeSources, subcollections.incomesources);

      const updatedIncomeSource = incomeSource.map((ic) => (ic.id === IncomeSource.id ? IncomeSource : ic));
      updateDoc(docRef, { incomesources: updatedIncomeSource });

      setIncomeSource(updatedIncomeSource);
    } catch (error) {
      console.error("Error updating IncomeSource:", error);
      throw error;
    }
  };

  const deleteIncomeSources = async (IncomeSourceId: string) => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.IncomeSources, subcollections.incomesources);

      const remainingIncomeSource = incomeSource.filter((ic) => ic.id !== IncomeSourceId);
      updateDoc(docRef, { incomesources: remainingIncomeSource });

      setIncomeSource(remainingIncomeSource);
    } catch (error) {
      console.error("Error deleting IncomeSource", error);
    }
  };
  return (
    <IncomeSourcesContext.Provider
      value={{ incomeSource, addIncomeSource, deleteIncomeSources, updateIncomeSource, loading }}
    >
      {children}
    </IncomeSourcesContext.Provider>
  );
};
