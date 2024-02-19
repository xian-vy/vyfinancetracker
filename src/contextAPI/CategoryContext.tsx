import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CategoryModel from "../models/CategoryModel";
import { getUserDocRef } from "../firebase/UsersService";
import { RootState } from "../redux/store";
import { collections, subcollections } from "../constants/collections";

type CategoryContextType = {
  categories: CategoryModel[];
  loading: boolean;
  addCategory: (category: CategoryModel) => Promise<CategoryModel>;
  updateCategory: (category: CategoryModel) => void;
  deleteCategory: (id: string) => void;
};

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  loading: true,
  addCategory: async () => {
    return {
      id: "",
      description: "",
      color: "",
      icon: "",
    };
  },
  updateCategory: () => {},
  deleteCategory: () => {},
});
export const useCategoryContext = () => {
  return useContext(CategoryContext);
};

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchCategories = async () => {
      if (user) {
        const userDocRef = await getUserDocRef();
        const docRef = doc(userDocRef, collections.Categories, subcollections.categories);

        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();
        if (data) {
          setCategories(data.categories);
          setLoading(false);
        }
      }
    };

    fetchCategories();
  }, [user]);

  const addCategory = async (category: CategoryModel): Promise<CategoryModel> => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.Categories, subcollections.categories);

      const newCategories = [...categories, category];
      updateDoc(docRef, { categories: newCategories });

      setCategories(newCategories);

      return category;
    } catch (error) {
      console.error("Error adding new Category", error);
      return {
        id: "",
        description: "",
        color: "",
        icon: "",
      };
    }
  };

  const updateCategory = async (category: CategoryModel) => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.Categories, subcollections.categories);

      const updatedCategories = categories.map((cat) => (cat.id === category.id ? category : cat));
      updateDoc(docRef, { categories: updatedCategories });

      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error updating Category:", error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const userDocRef = await getUserDocRef();
      const docRef = doc(userDocRef, collections.Categories, subcollections.categories);

      const remainingCategories = categories.filter((cat) => cat.id !== categoryId);
      updateDoc(docRef, { categories: remainingCategories });

      setCategories(remainingCategories);
    } catch (error) {
      console.error("Error deleting category", error);
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, loading, deleteCategory, addCategory, updateCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
