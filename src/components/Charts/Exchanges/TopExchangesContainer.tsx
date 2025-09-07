import { Box, Breadcrumbs, Link } from "@mui/material";
import React, { useMemo } from "react";
import { filterDataByDateRange, groupDataByIdWithIcons } from "../../../helper/GenericTransactionHelper";
import { getAccountsDetails } from "../../../firebase/utils";
import { FilterTimeframe } from "../../../constants/timeframes";
import { useAccountTypeContext } from "../../../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import TransactionOverviewBreakdown from "../TransactionOverviewBreakdown";
import { Timestamp } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

type ExchangeItem = {
  id: string;
  amount: number;
  description: string;
  account_id: string;
  date: Timestamp;
  category_id: string;
  kind: "income" | "expense";
};

interface Props {
  filterOption: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
  exchanges?: ExchangeItem[];
}

type GroupedData = {
  category: string;
  amount: number;
  color: string;
  icon: React.ReactElement;
};


const TopExchangesContainer = ({ filterOption, startDate, endDate, exchanges }: Props) => {
  const [filter, setFilter] = React.useState("Account");

  const { accountType } = useAccountTypeContext();
  const { incomeSource } = useIncomeSourcesContext();
  const { categories } = useCategoryContext();
  const incomeSlice = useSelector((state: RootState) => state.income.income);
  const expenseSlice = useSelector((state: RootState) => state.expenses.expenses);

  const swapIncomeSourceId = useMemo(() => incomeSource.find((s) => s.description === "Swap Account")?.id || "", [incomeSource]);
  const swapExpenseCategoryId = useMemo(() => categories.find((c) => c.description === "Swap Account")?.id || "", [categories]);

  const localMergedExchanges = useMemo<ExchangeItem[]>(() => {
    if (!swapIncomeSourceId && !swapExpenseCategoryId) return [] as ExchangeItem[];
    const positives: ExchangeItem[] = incomeSlice
      .filter((i) => i.category_id === swapIncomeSourceId)
      .map((i) => ({
        id: i.id,
        amount: i.amount,
        description: i.description,
        account_id: i.account_id,
        date: i.date,
        category_id: i.category_id,
        kind: "income" as const,
      }));
    const negatives: ExchangeItem[] = expenseSlice
      .filter((e) => e.category_id === swapExpenseCategoryId)
      .map((e) => ({
        id: e.id,
        amount: e.amount, // will be normalized later
        description: e.description,
        account_id: e.account_id,
        date: e.date,
        category_id: e.category_id,
        kind: "expense" as const,
      }));
    return [...positives, ...negatives];
  }, [incomeSlice, expenseSlice, swapIncomeSourceId, swapExpenseCategoryId]);

  const sourceExchanges = exchanges && exchanges.length > 0 ? exchanges : localMergedExchanges;

  const swapOnlyExchanges = useMemo(() => {
    if (!swapIncomeSourceId && !swapExpenseCategoryId) return [] as ExchangeItem[];
    return sourceExchanges.filter((e) => e.category_id === swapIncomeSourceId || e.category_id === swapExpenseCategoryId);
  }, [sourceExchanges, swapIncomeSourceId, swapExpenseCategoryId]);

  const normalizedExchanges = useMemo(() => swapOnlyExchanges.map((e) => ({ ...e, amount: Math.abs(e.amount) })), [swapOnlyExchanges]);

  const exchangeData: ExchangeItem[] = useMemo(
    () => filterDataByDateRange(normalizedExchanges, "date", filterOption, startDate || undefined, endDate || undefined),
    [normalizedExchanges, startDate, endDate, filterOption]
  );

  const groupedData = useMemo(() => {
    let result: Record<string, GroupedData> | GroupedData[] = [] as unknown as GroupedData[];

    switch (filter) {
      case "Account":
        result = groupDataByIdWithIcons(getAccountsDetails, accountType, exchangeData, "account_id") as unknown as Record<string, GroupedData>;
        break;
      default:
        break;
    }

    const arrayResult = Array.isArray(result) ? result : Object.values(result);

    // Ensure category label shows only 'Swap Account'
    return arrayResult.map((item) => ({ ...item, category: "Swap Account" }));
  }, [filter, exchangeData, accountType]);

  return (
    <>
      <Box display="flex" justifyContent="center" sx={{ p: 0, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            variant="body1"
            underline={filter === "Account" ? "always" : "hover"}
            onClick={() => setFilter("Account")}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            Accounts
          </Link>
        </Breadcrumbs>
      </Box>
      <TransactionOverviewBreakdown groupedData={groupedData} />
    </>
  );
};

export default React.memo(TopExchangesContainer);


