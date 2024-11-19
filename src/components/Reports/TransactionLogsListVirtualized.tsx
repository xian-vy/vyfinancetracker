import LiveHelpOutlinedIcon from "@mui/icons-material/LiveHelpOutlined";
import {
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { operation_types, txn_types } from "../../constants/collections";
import { iconSizeXS } from "../../constants/size";
import { FilterTimeframe } from "../../constants/timeframes";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import {
  getCategoryAndAccountTypeDescription,
  getCategoryDetails,
  getDebtDetails,
  getIncomeSourceDetails,
  getSavingsDetails,
} from "../../firebase/utils";
import { generateDebtAmounts } from "../../helper/DebtHelper";
import { formatShortAmountWithCurrency, hoverBgColor, useResponsiveCharLimit } from "../../helper/utils";
import { BudgetItemsModel, BudgetModel } from "../../models/BudgetModel";
import DebtModel from "../../models/DebtModel";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeModel from "../../models/IncomeModel";
import SavingGoalsModel from "../../models/SavingGoalsModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { RootState } from "../../redux/store";

function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
}

const indexById = <T extends { id: string }>(array: T[]): { [key: string]: T } => {
  return array.reduce((acc: { [key: string]: T }, current: T) => {
    acc[current.id] = current;
    return acc;
  }, {});
};

interface IconType {
  name: string;
  icon: React.ReactElement;
}
interface Props {
  logs: TransactionLogsModel[];
  selectedTimeframe: FilterTimeframe;
}

const TransactionLogsListVirtualized = ({ logs, selectedTimeframe }: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const charLimit = useResponsiveCharLimit();

  const savings  : SavingGoalsModel[] = useSelector((state: RootState) => state.savings.savings);
  const income   : IncomeModel[]= useSelector((state: RootState) => state.income.income);
  const expenses  : ExpenseModel[]= useSelector((state: RootState) => state.expenses.expenses);
  const budgets : BudgetModel[] = useSelector((state: RootState) => state.budget.budgets);
  const budgetItems  : BudgetItemsModel[] = budgets.flatMap((budget) => budget.budgets);
  const debts : DebtModel[] = useSelector((state: RootState) => state.debt.debt);
  const debtItems : DebtModel[] = generateDebtAmounts(debts);

  const { categories } = useCategoryContext();
  const { incomeSource } = useIncomeSourcesContext();
  const { accountType } = useAccountTypeContext();

  const indexedSavings = useMemo(() => indexById(savings), [savings]);
  const indexedIncome = useMemo(() => indexById(income), [income]);
  const indexedExpenses = useMemo(() => indexById(expenses), [expenses]);
  const indexedBudgets = useMemo(() => indexById(budgetItems), [budgets]);
  const indexedDebts = useMemo(() => indexById(debtItems), [debts]);
  const rows = useMemo(() => {
    return logs.map((item, index) => {
      let color: string | undefined = "";
      let categoryIcon: IconType | undefined = undefined;
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
        case txn_types.Debt:
          ({ color, categoryIcon } = getDebtDetails());
          const isCreditor = indexedDebts[item.txn_ref_id]?.isCreditor;
          const entity = indexedDebts[item.txn_ref_id]?.entity || "Deleted";
          description = isCreditor ?  "Borrower: " : "Lender: " + entity;
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
    categories,
    incomeSource,
    savings,
    accountType,
    indexedBudgets,
    indexedExpenses,
    indexedIncome,
    indexedSavings,
    selectedTimeframe,
  ]);

  const List = ({ index, style }: ListChildComponentProps) => {
    const row = rows[index];
    return (
      <div style={style} key={row.id}>
        <ListItem
          sx={{
            "&:hover": {
              backgroundColor: hoverBgColor(theme),
              borderRadius: 1,
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
            <Tooltip
              title={row.Date.toDate().toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            >
              <Typography variant="caption">{row.Date.toDate().toDateString()}</Typography>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>

        <Divider />
      </div>
    );
  };

  return (
    <FixedSizeList height={315} itemCount={rows.length} itemSize={63} style={{ listStyle: "none" }} width="100%">
      {List}
    </FixedSizeList>
  );
};

export default TransactionLogsListVirtualized;
