import { CircularProgress } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ASYNC_RESULT } from "../../constants/constants";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { hasInternetConnection } from "../../firebase/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import ExpenseModel from "../../models/ExpenseModel";
import ExpenseListActionCheckbox from "./ExpenseListActionCheckbox";
import { saveMultipleExpenses } from "./ExpenseListHelper";
import ExpenseListVirtualized from "./ExpenseListVirtualized";

type DialogState = {
  open: boolean;
  actionType: "update" | "delete" | null;
};

interface Props {
  filteredExpenses: ExpenseModel[];
  onEditExpense: (expense: ExpenseModel) => void;
  onDeleteExpense: (expense: ExpenseModel) => void;
}
const ExpenseListDialog = React.lazy(() => import("./ExpenseListDialog"));

const ExpenseList = (props: Props) => {
  const { categories, loading } = useCategoryContext();
  const { accountType, loading: accountLoading } = useAccountTypeContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [dialog, setDialog] = React.useState<DialogState>({ open: false, actionType: null });
  const [selectedExpenses, setSelectedExpenses] = React.useState<ExpenseModel[]>([]);
  const [newCategoryId, setNewCategoryId] = React.useState<string | null>(null);
  const [newAccountId, setNewAccountId] = React.useState<string | null>(null);
  const [shouldUpdateCategory, setShouldUpdateCategory] = React.useState(false);
  const [shouldUpdateAccount, setShouldUpdateAccount] = React.useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const [selectAll, setSelectAll] = React.useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const handleOfflineNetwork = async () => {
    const isConnected = await hasInternetConnection();
    if (!isConnected) {
      openSuccessSnackbar("This feature is not available offline.", true);
      return false;
    }
    return true;
  };
  const handleMoreAction = (action: string, expense: ExpenseModel) => {
    if (action === "Edit") {
      props.onEditExpense(expense);
    } else if (action === "Delete") {
      props.onDeleteExpense(expense);
    }
  };

  const handleSelectAllCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(!selectAll);
    if (event.target.checked) {
      setSelectedExpenses(props.filteredExpenses);
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleResetStates = () => {
    setShouldUpdateCategory(false);
    setShouldUpdateAccount(false);
    setIsLoading(false);
    setDialog({ open: false, actionType: null });
    setSelectAll(false);
    setSelectedExpenses([]);
  };

  const handleMultipleDeleteUpdate = async () => {
    setIsLoading(true);
    const isOnline = await handleOfflineNetwork();
    if (!isOnline) {
      handleResetStates();
      return;
    }
    if (selectedExpenses.length > 300) {
      openSuccessSnackbar("Please limit to 300 expenses per modification", true);
      setIsLoading(false);
      return;
    }
    const result = await saveMultipleExpenses({
      actionType: dialog.actionType,
      dispatch,
      newAccountId,
      newCategoryId,
      selectedExpenses,
      shouldUpdateAccount,
      shouldUpdateCategory,
    });

    if (result === ASYNC_RESULT.success) {
      openSuccessSnackbar(`Expenses have been ${dialog.actionType === "delete" ? "Deleted" : "Updated"}`);
    } else {
      openSuccessSnackbar("Something went wrong, please try refreshing page.");
    }
    handleResetStates();
  };

  const handleCheckboxChange =   (value: ExpenseModel) => {   
      const currentIndex = selectedExpenses.indexOf(value);
      const newChecked = [...selectedExpenses];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setSelectedExpenses(newChecked);
    }
    
  useEffect(() => {
    if (!loading) {
      setNewCategoryId(categories[0]?.id || "");
    }
  }, [categories]);
  useEffect(() => {
    if (!accountLoading) {
      setNewAccountId(accountType[0]?.id || "");
    }
  }, [accountType]);

  return (
    <>
      <ExpenseListActionCheckbox
        filteredExpenses={props.filteredExpenses}
        selectedExpenses={selectedExpenses}
        selectAll={selectAll}
        onSelectAllChange={handleSelectAllCheckboxChange}
        onMultipleDelete={async () => {
          const isOnline = await handleOfflineNetwork();
          if (isOnline) {
            setDialog({ open: true, actionType: "delete" });
          }
        }}
        onMultipleEdit={async () => {
          const isOnline = await handleOfflineNetwork();
          if (isOnline) {
            setDialog({ open: true, actionType: "update" });
          }
        }}
      />

      <ExpenseListVirtualized
        accountType={accountType}
        categories={categories}
        filteredExpenses={props.filteredExpenses}
        selectAll={selectAll}
        selectedExpenses={selectedExpenses}
        handleCheckboxChange={handleCheckboxChange}
        onActionSelect={handleMoreAction}
      />

      <React.Suspense fallback={<CircularProgress size={20} />}>
        <ExpenseListDialog
          actionType={dialog.actionType}
          open={dialog.open}
          onClose={() => {
            setDialog({ open: false, actionType: null });
          }}
          isLoading={isLoading}
          selectedExpenses={selectedExpenses}
          updateAccount={shouldUpdateAccount}
          shouldUpdateAccount={() => {
            setShouldUpdateAccount(!shouldUpdateAccount);
          }}
          updateCategory={shouldUpdateCategory}
          shouldUpdateCategory={() => {
            setShouldUpdateCategory(!shouldUpdateCategory);
          }}
          newCategoryId={newCategoryId || ""}
          setNewCategoryId={setNewCategoryId}
          newAccountId={newAccountId || ""}
          setNewAccountId={setNewAccountId}
          handleMultipleUpdateDelete={handleMultipleDeleteUpdate}
        />
      </React.Suspense>

      {SnackbarComponent}
    </>
  );
};

export default React.memo(ExpenseList);
