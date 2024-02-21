import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp, collection, doc, writeBatch } from "firebase/firestore";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { v4 as uuidv4 } from "uuid";
import { TimestamptoDate } from "../../helper/date";
import { ThemeColor, formatNumberWithoutCurrency, hoverBgColor, useResponsiveCharLimit } from "../../helper/utils";
import AccountsIcons from "../../media/AccountsIcons";
import CategoryIcons from "../../media/CategoryIcons";
import { FIXED_SIZE, TABLE_HEIGHT, iconSizeXS } from "../../constants/size";
import { collections, operation_types, txn_types } from "../../constants/collections";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { db } from "../../firebase";
import { getUserDocRef } from "../../firebase/UsersService";
import { getCategoryAndAccountTypeDescription, getCategoryDetails, hasInternetConnection } from "../../firebase/utils";
import { useActionPopover } from "../../hooks/actionHook";
import useSnackbarHook from "../../hooks/snackbarHook";
import ExpenseModel from "../../models/ExpenseModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { deleteMultipleExpensesAction, updateMultpleExpensesAction } from "../../redux/actions/expenseAction";
import CustomIconButton from "../CustomIconButton";
import EntryFormCategoryDropdown from "../GenericComponents/EntryFormCategoryDropdown";
import { retrieveKeySecurely } from "../../encryption/keyhandling";
import { encryptAndConvertToBase64 } from "../../encryption/encryption";

type DialogState = {
  open: boolean;
  actionType: "update" | "delete" | null;
};

interface Props {
  filteredExpenses: ExpenseModel[];
  onEditExpense: (expense: ExpenseModel) => void;
  onDeleteExpense: (expense: ExpenseModel) => void;
}
const selectStyle = {
  boxShadow: "none",
  ".MuiOutlinedInput-notchedOutline": { border: 0 },
  "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    border: 0,
  },
  "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: 0,
  },
};
const ExpenseList = (props: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const charLimit = useResponsiveCharLimit();
  const { categories, loading } = useCategoryContext();
  const { accountType, loading: accountLoading } = useAccountTypeContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [dialog, setDialog] = React.useState<DialogState>({ open: false, actionType: null });
  const [selectedExpenses, setSelectedExpenses] = React.useState<ExpenseModel[]>([]);
  const [newCategoryId, setNewCategoryId] = React.useState<string | null>(null);
  const [newAccountId, setNewAccountId] = React.useState<string | null>(null);
  const [updateCategory, setUpdateCategory] = React.useState(false);
  const [updateAccount, setUpdateAccount] = React.useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const [selectAll, setSelectAll] = React.useState(false);

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
  }

  const handleAction = (action: string, expense: ExpenseModel) => {
    if (action === "Edit") {
      props.onEditExpense(expense);
    } else if (action === "Delete") {
      props.onDeleteExpense(expense);
    }
    handleActionClose();
  };

  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: ["Edit", "Delete"],
    handleAction,
  });

  const handleSelectAllCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Select all expenses
      setSelectedExpenses(props.filteredExpenses);
    } else {
      // Clear selection
      setSelectedExpenses([]);
    }
  };

  const handleMultipleSelect = async () => {
    setIsLoading(true);
    const isConnected = await hasInternetConnection();

    if (!isConnected) {
      openSuccessSnackbar("This feature is not available offline.", true);
      setUpdateCategory(false);
      setUpdateAccount(false);
      setIsLoading(false);
      setDialog({ open: false, actionType: null });
      setSelectAll(false);
      setSelectedExpenses([]);
      return;
    }

    if (selectedExpenses.length > 300) {
      openSuccessSnackbar("Please limit to 300 expenses per modification", true);
      setIsLoading(false);
      return;
    }

    let operation = "";

    if (dialog.actionType === "update") {
      await dispatch(
        updateMultpleExpensesAction({
          expenseData: selectedExpenses,
          categoryId: updateCategory ? newCategoryId : null,
          accountId: updateAccount ? newAccountId : null,
        })
      );
      operation = "updated";
    } else if (dialog.actionType === "delete") {
      const resultAction = await dispatch(deleteMultipleExpensesAction(selectedExpenses));
      if (deleteMultipleExpensesAction.fulfilled.match(resultAction)) {
        const key = await retrieveKeySecurely();
        if (!key) {
          throw new Error("Missing encryption key.");
        }
        const now = Timestamp.now();
        const batch = writeBatch(db);
        const batchId = uuidv4();
        const userDocRef = await getUserDocRef();
        let logsToSave: TransactionLogsModel[] = [];

        selectedExpenses.map((expense) => {
          const log: TransactionLogsModel = {
            txn_id: uuidv4(),
            txn_ref_id: expense.id,
            txn_type: txn_types.Expenses,
            operation: operation_types.Delete,
            category_id: expense.category_id,
            account_id: expense.account_id,
            amount: expense.amount,
            lastModified: now,
          };
          logsToSave.push(log);
        });
        const logsDocRef = doc(collection(userDocRef, collections.Transaction_Logs), batchId);
        const encryptedLogsBase64 = await encryptAndConvertToBase64(logsToSave, key);
        batch.set(logsDocRef, { encryptedData: encryptedLogsBase64, lastModified: now, isMultiple: true });
        batch.commit();
        operation = "deleted";
      }
    }

    let timeout = 500;
    // //for ads ^^
    // if (selectedExpenses.length <= 50) {
    //   timeout = 500;
    // } else if (selectedExpenses.length > 50 && selectedExpenses.length < 100) {
    //   timeout = 1000;
    // } else if (selectedExpenses.length >= 100 && selectedExpenses.length < 200) {
    //   timeout = 2000;
    // } else {
    //   timeout = 3000;
    // }

    await new Promise((resolve) => setTimeout(resolve, timeout));
    setUpdateCategory(false);
    setUpdateAccount(false);
    setIsLoading(false);
    setDialog({ open: false, actionType: null });
    setSelectAll(false);
    setSelectedExpenses([]);
    openSuccessSnackbar("Expenses have been " + operation);
  };

  const handleCheckboxChange = React.useMemo(
    () => (value: ExpenseModel) => (event: React.MouseEvent) => {
      event.stopPropagation();
      const currentIndex = selectedExpenses.indexOf(value);
      const newChecked = [...selectedExpenses];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setSelectedExpenses(newChecked);
    },
    [selectedExpenses]
  );

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

  const expensesList = React.useMemo(
    () =>
      ({ index, style }: ListChildComponentProps) => {
        const expenses = props.filteredExpenses[index];

        const { color, categoryIcon, description } = getCategoryDetails(categories, expenses.category_id);

        const account = getCategoryAndAccountTypeDescription(expenses.account_id, accountType);
        return (
          <div key={index} style={style}>
            <ListItem
              sx={{
                "&:hover": {
                  backgroundColor: hoverBgColor(theme),
                  borderRadius: 3,
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
                    onClick={handleCheckboxChange(expenses)}
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
    [props.filteredExpenses, categories, accountType, selectedExpenses, selectAll]
  );

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: { xs: 0.5, sm: 2, md: 3 }, mx: { xs: 0, sm: 1, md: 2 }, mt: 1 }}
      >
        <Stack direction="row" alignItems="center" sx={{ pl: selectAll ? 0 : 0.5 }}>
          {props.filteredExpenses.length > 0 && (
            <>
              <Checkbox
                edge="start"
                disableRipple
                onChange={(e) => {
                  setSelectAll(!selectAll);
                  handleSelectAllCheckboxChange(e);
                }}
                checked={selectAll}
              />
              {!selectAll ? (
                <Typography variant="body1">Select All</Typography>
              ) : (
                <Typography variant="body1">{selectedExpenses.length} Selected</Typography>
              )}
            </>
          )}
        </Stack>
        <Stack direction="row">
          {selectAll && (
            <>
              <CustomIconButton
                type="filter"
                onClick={async () => {
                  const isConnected = await hasInternetConnection();
                  if (!isConnected) {
                    openSuccessSnackbar("This feature is not available offline.", true);
                    return;
                  }
                  setDialog({ open: true, actionType: "update" });
                }}
              >
                <Typography variant="caption" style={{ color: ThemeColor(theme) }} mx={0.5}>
                  Edit
                </Typography>

                <ModeEditOutlineOutlinedIcon sx={{ fontSize: "13px", mx: 0.5 }} />
              </CustomIconButton>

              <CustomIconButton
                type="filter"
                onClick={async () => {
                  const isConnected = await hasInternetConnection();
                  if (!isConnected) {
                    openSuccessSnackbar("This feature is not available offline.", true);
                    return;
                  }
                  setDialog({ open: true, actionType: "delete" });
                }}
              >
                <Typography variant="caption" style={{ color: ThemeColor(theme) }} mx={0.5}>
                  Delete
                </Typography>

                <ClearIcon sx={{ fontSize: "14px", mr: 0.5 }} />
              </CustomIconButton>
            </>
          )}
        </Stack>
      </Stack>
      <Box
        sx={{
          px: { xs: 0, sm: 1, md: 2 },
          mx: { xs: 0, sm: 1, md: 2 },
          height: "auto",
        }}
      >
        <FixedSizeList
          height={TABLE_HEIGHT}
          itemCount={props.filteredExpenses.length}
          itemSize={FIXED_SIZE}
          style={{ listStyle: "none" }}
          width={"100%"}
        >
          {expensesList}
        </FixedSizeList>
      </Box>
      {ActionPopover}
      <Dialog
        open={dialog.open}
        onClose={() => {
          setDialog({ open: false, actionType: null });
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
        maxWidth="md"
        fullWidth
        transitionDuration={0}
      >
        {/* Dialog  --------------------------------------------------------------------------------------------------*/}

        <DialogContent sx={{ px: { xs: 2, md: 3 }, py: 2, background: isDarkMode ? "#1e1e1e" : "inherit" }}>
          <Divider>
            <Typography variant="body2" textAlign="center">
              {"Items to " + dialog.actionType || "Update"} {"(" + selectedExpenses.length + ")"}
            </Typography>
          </Divider>
          {/* List  --------------------------------------------------------------------------------------------------*/}
          <List
            sx={{
              maxHeight: 270,
              overflowY: "auto",
              borderBottom: `1px solid ${theme.palette.divider}`,
              mb: 1,
              px: { xs: 1, md: 2 },
            }}
          >
            {selectedExpenses.map((item, index) => {
              return (
                <ListItemText key={item.id}>
                  <Typography variant="body2" sx={{}}>
                    {index + 1 + ") "} {item.description === "" ? "No description" : item.description}
                  </Typography>
                </ListItemText>
              );
            })}
          </List>
          {dialog.actionType === "update" && (
            <>
              {/* Category  --------------------------------------------------------------------------------------------------*/}
              <Stack direction="row" justifyContent="space-between" alignItems="center" height={30}>
                <Stack direction="row" alignItems="center">
                  <Checkbox
                    edge="start"
                    disableRipple
                    onChange={() => {
                      setUpdateCategory(!updateCategory);
                    }}
                    checked={updateCategory}
                  />
                  <Typography variant="body1">Change Category</Typography>
                </Stack>
                {updateCategory && (
                  <Box>
                    <EntryFormCategoryDropdown
                      label=""
                      category_id={newCategoryId || ""}
                      categories={categories}
                      onChange={setNewCategoryId}
                      icons={CategoryIcons}
                      onAddNewCategory={undefined}
                      sx={selectStyle}
                    />
                  </Box>
                )}
              </Stack>
              {/* Account  --------------------------------------------------------------------------------------------------*/}
              <Stack direction="row" justifyContent="space-between" alignItems="center" height={30}>
                <Stack direction="row" alignItems="center">
                  <Checkbox
                    edge="start"
                    disableRipple
                    onChange={() => {
                      setUpdateAccount(!updateAccount);
                    }}
                    checked={updateAccount}
                  />
                  <Typography variant="body1">Change Account</Typography>
                </Stack>
                {updateAccount && (
                  <Box>
                    <EntryFormCategoryDropdown
                      label=""
                      category_id={newAccountId || ""}
                      categories={accountType}
                      onChange={setNewAccountId}
                      icons={AccountsIcons}
                      onAddNewCategory={undefined}
                      sx={selectStyle}
                    />
                  </Box>
                )}
              </Stack>
            </>
          )}
          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button
              onClick={() => {
                setDialog({ open: false, actionType: null });
              }}
              sx={{ ml: -2, fontSize: "0.7rem" }}
              color="inherit"
            >
              Close
            </Button>
            <Button
              disabled={
                selectedExpenses.length === 0 ||
                (dialog.actionType === "update" ? !updateAccount && !updateCategory : false) ||
                isLoading
              }
              size="small"
              variant="outlined"
              color={dialog.actionType === "delete" ? "error" : "info"}
              endIcon={
                isLoading ? (
                  <CircularProgress size={20} />
                ) : dialog.actionType === "delete" ? (
                  <ClearIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                ) : (
                  <CheckOutlinedIcon fontSize="small" />
                )
              }
              onClick={handleMultipleSelect}
              sx={{ fontSize: "0.7rem" }}
            >
              {isLoading ? (dialog.actionType === "delete" ? "Deleting" : "Updating") : dialog.actionType || "UPDATE"}{" "}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {SnackbarComponent}
    </>
  );
};

export default React.memo(ExpenseList);
