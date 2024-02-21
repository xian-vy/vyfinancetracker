import LiveHelpOutlinedIcon from "@mui/icons-material/LiveHelpOutlined";
import {
  CircularProgress,
  Container,
  Divider,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import {
  formatShortAmountWithCurrency,
  getFilterTitle,
  hoverBgColor,
  useResponsiveCharLimit,
} from "../../helper/utils";
import { iconSizeXS } from "../../constants/size";
import { operation_types, txn_types } from "../../constants/collections";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import {
  getCategoryAndAccountTypeDescription,
  getCategoryDetails,
  getIncomeSourceDetails,
  getSavingsDetails,
} from "../../firebase/utils";
import { useFilterHandlers } from "../../hooks/filterHook";
import { RootState } from "../../redux/store";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTransactionLogs from "../Filter/FilterTransactionLogs";

type Id = { id: string };

const indexById = <T extends Id>(array: T[]): { [key: string]: T } => {
  return array.reduce((acc: { [key: string]: T }, current: T) => {
    acc[current.id] = current;
    return acc;
  }, {});
};

interface icontype {
  name: string;
  icon: React.ReactElement;
}
export const TransactionLogs = () => {
  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    anchorEl,
    filterOpen,
    handleFilterClose,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers();

  const [type, setType] = useState("All");

  const handleTypeChange = (type: string) => {
    setType(type);
  };

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const { categories } = useCategoryContext();
  const { incomeSource } = useIncomeSourcesContext();
  const { accountType } = useAccountTypeContext();
  const savings = useSelector((state: RootState) => state.savings.savings);
  const income = useSelector((state: RootState) => state.income.income);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const budgets = useSelector((state: RootState) => state.budget.budgets);
  const budgetItems = budgets.flatMap((budget) => budget.budgets);
  const indexedSavings = useMemo(() => indexById(savings), [savings]);
  const indexedIncome = useMemo(() => indexById(income), [income]);
  const indexedExpenses = useMemo(() => indexById(expenses), [expenses]);
  const indexedBudgets = useMemo(() => indexById(budgetItems), [budgets]);
  const charLimit = useResponsiveCharLimit();
  const [initialLoading, setInitialLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { logs, fetchLogsByTimeframe } = useTransactionLogsContext();

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
  }
  useEffect(() => {
    const fetchLogs = async () => {
      if (user) {
        setInitialLoading(true);
        try {
          await fetchLogsByTimeframe(filterOption, startDate || undefined, endDate || undefined);
          setInitialLoading(false);
        } catch (error) {
          console.error("Error fetching logs by timeframe", error);
          setInitialLoading(false);
        }
      }
    };

    fetchLogs();
  }, [filterOption, user]);

  const rows = useMemo(() => {
    return logs
      .filter(
        (log) =>
          type === "All" ||
          log.txn_type === type ||
          (type === txn_types.Savings && //To show both savings/conntributions if type = Savings
            (log.txn_type === txn_types.Savings || log.txn_type === txn_types.SavingsContribution))
      )
      .map((item, index) => {
        let color: string | undefined = "";
        let categoryIcon: icontype | undefined = undefined;
        let categoryDescription: string | undefined = "";
        let description: string | undefined = "";

        switch (item.txn_type) {
          case txn_types.Budget:
            ({
              color,
              categoryIcon,
              description: categoryDescription,
            } = getCategoryDetails(categories, item.category_id));
            description = categoryDescription;
            break;
          case txn_types.Expenses:
            ({
              color,
              categoryIcon,
              description: categoryDescription,
            } = getCategoryDetails(categories, item.category_id));
            description = indexedExpenses[item.txn_ref_id]?.description;
            break;
          case txn_types.Income:
            ({
              color,
              categoryIcon,
              description: categoryDescription,
            } = getIncomeSourceDetails(incomeSource, item.category_id));
            description = indexedIncome[item.txn_ref_id]?.description;
            break;
          case txn_types.Savings:
          case txn_types.SavingsContribution:
            ({ color, categoryIcon, description: categoryDescription } = getSavingsDetails(savings, item.category_id));
            description = indexedSavings[item.txn_ref_id]?.description;
            break;
          default:
            break;
        }
        return {
          id: item.txn_id,
          rowNumber: index + 1,
          txn_type: item.txn_type,
          operation: item.operation,
          typeOperation: item.operation + " " + item.txn_type,
          amount: formatShortAmountWithCurrency(item.amount, false, true),
          categoryDescription: categoryDescription,
          Date: item.lastModified,
          color: color,
          icon: categoryIcon?.icon,
          account: getCategoryAndAccountTypeDescription(item.account_id, accountType),
          description: description,
        };
      });
  }, [
    logs,
    type,
    categories,
    incomeSource,
    savings,
    accountType,
    indexedBudgets,
    indexedExpenses,
    indexedIncome,
    indexedSavings,
    filterOption,
  ]);

  const List = ({ index, style }: ListChildComponentProps) => {
    const row = rows[index];
    return (
      <div style={style} key={row.id}>
        <ListItem
          sx={{
            "&:hover": {
              backgroundColor: hoverBgColor(theme),
              borderRadius: 3,
            },
            px: 1,
            listStyle: "none",
            "&::-webkit-scrollbar": {
              display: ["none", "auto"],
            },
          }}
        >
          <ListItemAvatar sx={{ minWidth: 25 }}>
            <Tooltip title={row.categoryDescription || "Original Category has been deleted."}>
              {row.icon
                ? renderIcon(row.icon, row.color || "#ccc")
                : renderIcon(<LiveHelpOutlinedIcon />, isDarkMode ? "#000" : "#fff")}
            </Tooltip>
          </ListItemAvatar>
          <Tooltip title={row.description}>
            <ListItemText
              primary={
                <>
                  <Typography variant="body1">{row.typeOperation}</Typography>
                  <Typography
                    variant="body1"
                    sx={{ textDecoration: row.operation === operation_types.Delete ? "line-through" : "none" }}
                  >
                    {row.description && row.description.length > charLimit
                      ? row.description.substring(0, charLimit)
                      : row.description?.length === 0 || !row.description //for savings contribution since it has no description, get the desc of its savings
                      ? row.categoryDescription
                      : row.description}
                  </Typography>
                </>
              }
            />
          </Tooltip>
          <ListItemSecondaryAction>
            <Stack direction="row" justifyContent="flex-end" alignItems="center">
              <Typography
                textAlign="right"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color:
                    (row.txn_type === txn_types.Expenses && row.operation !== operation_types.Delete) ||
                    (row.txn_type === txn_types.SavingsContribution && row.operation !== operation_types.Delete)
                      ? "salmon"
                      : row.txn_type === txn_types.Income
                      ? "green"
                      : "inherit",
                  textDecoration: row.operation === operation_types.Delete ? "line-through" : "none",
                }}
              >
                {(row.txn_type === txn_types.Expenses && row.operation !== operation_types.Delete) ||
                (row.txn_type === txn_types.SavingsContribution && row.operation !== operation_types.Delete)
                  ? "-"
                  : row.txn_type === txn_types.Income
                  ? "+"
                  : ""}
                {row.amount}
              </Typography>
              <Typography textAlign="right" sx={{ fontSize: "0.65rem", ml: 0.5 }}>
                {row.account}
              </Typography>
            </Stack>
            <Tooltip title={row.Date.toDate().toDateString()}>
              <Typography variant="caption">{row.Date.toDate().toDateString()}</Typography>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>

        <Divider />
      </div>
    );
  };

  return (
    <>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <FilterTransactionLogs
          onFilterChange={handleFilterOptionChange}
          title={getFilterTitle(filterOption, startDate, endDate)}
          onTypeChange={handleTypeChange}
          totalLogs={rows.length}
          filterOption={filterOption}
        />
      </Container>
      <Container maxWidth={false} sx={{ px: 0, pb: 2 }}>
        <FixedSizeList height={315} itemCount={rows.length} itemSize={63} style={{ listStyle: "none" }} width="100%">
          {List}
        </FixedSizeList>
        <Grid
          container
          style={{ height: "100%", visibility: initialLoading ? "visible" : "hidden" }}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size={20} />
        </Grid>
      </Container>
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
    </>
  );
};

export default React.memo(TransactionLogs);
