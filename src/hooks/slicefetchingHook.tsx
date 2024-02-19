import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

import { useState, useEffect } from "react";
import { useCategoryContext } from "../contextAPI/CategoryContext";
import { useAccountTypeContext } from "../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../contextAPI/IncomeSourcesContext";

export const useSliceFetchingStates = () => {
  const persistenceID = useSelector((state: RootState) => state.auth.persistentId);

  const expensesLoading = useSelector((state: RootState) => state.expenses.isfetching);
  const budgetsLoading = useSelector((state: RootState) => state.budget.isfetching);
  const incomeLoading = useSelector((state: RootState) => state.income.isfetching);
  const savingsLoading = useSelector((state: RootState) => state.savings.isfetching);
  const savingsContributionLoading = useSelector((state: RootState) => state.savingsContribution.isfetching);
  const { loading: categoryLoading } = useCategoryContext();
  const { loading: accountLoading } = useAccountTypeContext();
  const { loading: incomesourceLoading } = useIncomeSourcesContext();

  const [isLoading, setLoadingData] = useState(true);
  const [timeoutError, setTimeoutError] = useState(false);
  const loading =
    expensesLoading ||
    budgetsLoading ||
    incomeLoading ||
    savingsLoading ||
    savingsContributionLoading ||
    categoryLoading ||
    accountLoading ||
    incomesourceLoading;
  useEffect(() => {
    setLoadingData(loading);

    if (loading) {
      if (persistenceID) {
        const timer = setTimeout(() => {
          setTimeoutError(true);
        }, 20000);

        return () => clearTimeout(timer);
      }
    }
  }, [
    expensesLoading,
    budgetsLoading,
    incomeLoading,
    savingsLoading,
    savingsContributionLoading,
    categoryLoading,
    accountLoading,
    incomesourceLoading,
  ]);

  return { isLoading, timeoutError };
};
