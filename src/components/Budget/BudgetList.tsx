import { Dialog, DialogContent, Grid, Stack, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FORM_WIDTH } from "../../constants/size";
import { filterBudgetByDateRange } from "../../helper/BudgetHelper";
import { filterDataByDateRange } from "../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../helper/utils";
import { RootState } from "../../redux/store";
import EntryFormSkeleton from "../Skeleton/EntryFormSkeleton";
import BudgetListHeader from "./BudgetListHeader";
import { FilterExpenseAndBudgetbyCategory } from "./BudgetListHelper";
import { BudgetListItems } from "./BudgetListItems";
import { FilterTimeframe } from "../../constants/timeframes";

interface Props {
  selectedTimeframe: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
  URLopenForm: boolean;
}

const BudgetForm = React.lazy(() => import("./BudgetForm"));

const BudgetList = ({ selectedTimeframe, startDate, endDate, URLopenForm }: Props) => {
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(URLopenForm || false);
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const budgets = useSelector((state: RootState) => state.budget.budgets);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const filteredExpense = useMemo(() => {
    return filterDataByDateRange(expenses, "date", selectedTimeframe, startDate || undefined, endDate || undefined);
  }, [expenses, selectedTimeframe, startDate, endDate]);

  const { budgetItems: filteredBudget } = useMemo(() => {
    return filterBudgetByDateRange(budgets, selectedTimeframe, startDate || undefined, endDate || undefined);
  }, [budgets, selectedTimeframe, startDate, endDate]);

  const finalData = useMemo(() => {
    return FilterExpenseAndBudgetbyCategory(filteredExpense, filteredBudget);
  }, [filteredExpense, filteredBudget]);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const totalExpense = filteredExpense.reduce((acc, expense) => acc + expense.amount, 0);
  const totalBudget = filteredBudget.reduce((acc, budget) => acc + budget.amount, 0);

  const filter = getFilterTitle(selectedTimeframe, startDate, endDate);
  return (
    <Stack direction="column" sx={{ p: 1 }}>
      <BudgetListHeader
        openBudgetForm={() => {
          setIsBudgetFormOpen(true);
        }}
        totalExpense={totalExpense}
        totalBudget={totalBudget}
        filterDate={filter}
      />

      <Grid container rowSpacing={2} pt={2} columnSpacing={3} sx={{ minHeight: 250, px: { xs: 1, md: 2, lg: 3 } }}>
        {finalData.map(({ categoryId, totalBudgetAmount, totalExpenseAmount }) => {
          return (
            <BudgetListItems
              key={categoryId}
              categoryId={categoryId}
              totalExpenseAmount={totalExpenseAmount}
              totalBudgetAmount={totalBudgetAmount}
            />
          );
        })}
      </Grid>

      <Dialog
        open={isBudgetFormOpen}
        PaperProps={{
          sx: { borderRadius: 4, margin: { xs: 0, sm: 1, md: 2 }, width: FORM_WIDTH },
          background: isDarkMode ? "#1e1e1e" : "#fff",
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 1, lg: 1 }, background: isDarkMode ? "#1e1e1e" : "#fff" }}>
          <React.Suspense fallback={<EntryFormSkeleton />}>
            <BudgetForm
              onCloseForm={() => {
                setIsBudgetFormOpen(false);
              }}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default React.memo(BudgetList);
