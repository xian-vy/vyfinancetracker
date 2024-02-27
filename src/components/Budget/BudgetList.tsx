import { Dialog, DialogContent, Grid, Stack, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FilterExpenseAndBudgetbyCategory } from "./BudgetListHelper";
import { filterBudgetByDateRange } from "../../helper/BudgetHelper";
import { filterDataByDateRange } from "../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../helper/utils";
import { FORM_WIDTH } from "../../constants/size";
import { useFilterHandlers } from "../../hooks/filterHook";
import { RootState } from "../../redux/store";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import BudgetListHeader from "./BudgetListHeader";
import { BudgetListItems } from "./BudgetListItems";
import EntryFormSkeleton from "../Skeleton/EntryFormSkeleton";

const BudgetForm = React.lazy(() => import("./BudgetForm"));

const BudgetList = ({ URLopenForm }: { URLopenForm: boolean }) => {
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(URLopenForm || false);
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    anchorEl,
    filterOpen,
    handleFilterClick,
    handleFilterClose,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers();

  const budgets = useSelector((state: RootState) => state.budget.budgets);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const filteredExpense = useMemo(() => {
    return filterDataByDateRange(expenses, "date", filterOption, startDate || undefined, endDate || undefined);
  }, [expenses, filterOption, startDate, endDate]);

  const { budgetItems: filteredBudget } = useMemo(() => {
    return filterBudgetByDateRange(budgets, filterOption, startDate || undefined, endDate || undefined);
  }, [budgets, filterOption, startDate, endDate]);

  const finalData = useMemo(() => {
    return FilterExpenseAndBudgetbyCategory(filteredExpense, filteredBudget);
  }, [filteredExpense, filteredBudget]);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const totalExpense = filteredExpense.reduce((acc, expense) => acc + expense.amount, 0);
  const totalBudget = filteredBudget.reduce((acc, budget) => acc + budget.amount, 0);

  const filter = getFilterTitle(filterOption, startDate, endDate);
  return (
    <Stack direction="column" sx={{ p: 1 }}>
      <BudgetListHeader
        selectedTimeframe={filter}
        openBudgetForm={() => {
          setIsBudgetFormOpen(true);
        }}
        handleFilterClick={handleFilterClick}
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

      <FilterActionsComponent
        filterOpen={filterOpen}
        anchorEl={anchorEl}
        handleFilterClose={handleFilterClose}
        customMonthOpen={customMonthOpen}
        customYearOpen={customYearOpen}
        handleFilterOptionChange={handleFilterOptionChange}
        handleCloseForm={handleCloseForm}
        handleMonthFilter={handleMonthFilter}
        handleYearFilter={handleYearFilter}
        selectedTimeframe={filterOption}
      />
    </Stack>
  );
};

export default React.memo(BudgetList);
