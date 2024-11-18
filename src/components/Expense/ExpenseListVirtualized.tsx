import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { FIXED_SIZE, TABLE_HEIGHT, iconSizeXS } from "../../constants/size";
import { getCategoryAndAccountTypeDescription, getCategoryDetails } from "../../firebase/utils";
import { TimestamptoDate } from "../../helper/date";
import { formatNumberWithoutCurrency, hoverBgColor, useResponsiveCharLimit } from "../../helper/utils";
import AccountTypeModel from "../../models/AccountTypeModel";
import CategoryModel from "../../models/CategoryModel";
import ExpenseModel from "../../models/ExpenseModel";
import { useActionPopover } from "../../hooks/actionHook";

type ExpenseListVirtualizedProps = {
  filteredExpenses: ExpenseModel[];
  categories: CategoryModel[];
  accountType: AccountTypeModel[];
  selectedExpenses: ExpenseModel[];
  selectAll: boolean;
  handleCheckboxChange: (expense: ExpenseModel) => void;
  onActionSelect: (action: string, expense: ExpenseModel) => void;
};

function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
}

const ExpenseListVirtualized: React.FC<ExpenseListVirtualizedProps> = ({
  filteredExpenses,
  categories,
  accountType,
  selectedExpenses,
  selectAll,
  handleCheckboxChange,
  onActionSelect,
}) => {
  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const charLimit = useResponsiveCharLimit();

  const handleAction = (action: string, expense: ExpenseModel) => {
    onActionSelect(action, expense);
    handleActionClose();
  };

  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: ["Edit", "Delete"],
    handleAction,
  });

  const expensesList = React.useMemo(
    () =>
      ({ index, style }: ListChildComponentProps) => {
        const expenses = filteredExpenses[index];
        const { color, categoryIcon, description } = getCategoryDetails(categories, expenses.category_id);
        const account = getCategoryAndAccountTypeDescription(expenses.account_id, accountType);

        return (
          <div key={index} style={style}>
            <ListItem
              sx={{
                "&:hover": {
                  backgroundColor: hoverBgColor(theme),
                  borderRadius: 1,
                },
                pl: smScreen ? 0.5 : 1,
                pr: smScreen ? 0 : 1,
                py: 0,
              }}
            >
              <Stack direction="row" alignItems="center">
                {selectAll && (
                  <Checkbox
                    edge="start"
                    onClick={() => handleCheckboxChange(expenses)}
                    checked={selectedExpenses.indexOf(expenses) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                )}
                <ListItemAvatar sx={{ minWidth: smScreen ? 24 : 32 }}>
                  <Tooltip title={description}>
                    <div>{categoryIcon && renderIcon(categoryIcon.icon, color || "")}</div>
                  </Tooltip>
                </ListItemAvatar>
              </Stack>
              <ListItemText
                disableTypography
                primary={
                  <>
                    <Tooltip title={expenses.description === "" ? description : expenses.description}>
                      <Typography variant="body1">
                        {expenses.description === ""
                          ? description && description.length > charLimit
                            ? description.substring(0, charLimit)
                            : description
                          : expenses.description.length > charLimit
                          ? expenses.description.substring(0, charLimit)
                          : expenses.description}{" "}
                      </Typography>
                    </Tooltip>
                    <Typography variant="caption">{formatNumberWithoutCurrency(expenses.amount)}</Typography>
                  </>
                }
              />
              <ListItemSecondaryAction sx={{ mr: smScreen ? -2 : 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Stack direction="column" alignItems="flex-end">
                    <Typography variant="caption">{account}</Typography>
                    <Typography variant="caption">{TimestamptoDate(expenses.date, "MMM dd, yyyy")}</Typography>
                  </Stack>
                  <div style={{ position: "relative" }}>
                    {!selectAll && (
                      <IconButton aria-label="Actions" onClick={(event) => handleActionOpen(event, expenses)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ mx: 2 }} />
          </div>
        );
      },
    [filteredExpenses, categories, accountType, selectedExpenses, selectAll]
  );

  return (
    <>
      <Box
        sx={{
          px: { xs: 0, sm: 1, md: 2 },
          mx: { xs: 0, sm: 1, md: 2 },
          height: "auto",
        }}
      >
        <FixedSizeList
          height={TABLE_HEIGHT}
          itemCount={filteredExpenses.length}
          itemSize={FIXED_SIZE}
          style={{ listStyle: "none" }}
          width={"100%"}
        >
          {expensesList}
        </FixedSizeList>
      </Box>
      {ActionPopover}
    </>
  );
};

export default ExpenseListVirtualized;
