import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import AccountsIcons from "../../media/AccountsIcons";
import CategoryIcons from "../../media/CategoryIcons";
import ExpenseModel from "../../models/ExpenseModel";
import EntryFormCategoryDropdown from "../GenericComponents/EntryFormCategoryDropdown";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";

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
type Props = {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  selectedExpenses: ExpenseModel[];
  actionType: string | null;
  updateCategory: boolean;
  shouldUpdateCategory: () => void;
  updateAccount: boolean;
  shouldUpdateAccount: () => void;
  handleMultipleUpdateDelete: () => void;
  newCategoryId: string;
  setNewCategoryId: (newId: string) => void;
  newAccountId: string;
  setNewAccountId: (newId: string) => void;
};
const ExpenseListDialog = ({
  selectedExpenses,
  open,
  onClose,
  actionType,
  isLoading,
  updateCategory,
  shouldUpdateCategory,
  updateAccount,
  shouldUpdateAccount,
  handleMultipleUpdateDelete,
  newCategoryId,
  setNewCategoryId,
  newAccountId,
  setNewAccountId,
}: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { categories } = useCategoryContext();
  const { accountType } = useAccountTypeContext();

  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { borderRadius: 4, background: isDarkMode ? "#1e1e1e" : "#fff" },
        }}
        maxWidth="sm"
        fullWidth
        transitionDuration={0}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {"Items to " + actionType || "Update"} {"(" + selectedExpenses.length + ")"}
            </Typography>
            <IconButton onClick={onClose} sx={{ mr: -1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider sx={{ mx: 2 }} />
        <DialogContent sx={{ px: { xs: 1, md: 3 }, py: 0 }}>
          {/* List  --------------------------------------------------------------------------------------------------*/}
          <List
            sx={{
              maxHeight: 270,
              overflowY: "auto",
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
        </DialogContent>
        <Divider sx={{ mx: 2 }} />
        <DialogActions sx={{ display: "flex", flexDirection: "column" }}>
          <Stack direction="column" justifyContent="center" sx={{ width: "100%", px: { xs: 1, sm: 2 } }}>
            {actionType === "update" && (
              <>
                {/* Category  --------------------------------------------------------------------------------------------------*/}
                <Stack direction="row" justifyContent="space-between" alignItems="center" height={30}>
                  <Stack direction="row" alignItems="center">
                    <Checkbox edge="start" disableRipple onChange={shouldUpdateCategory} checked={updateCategory} />
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
                    <Checkbox edge="start" disableRipple onChange={shouldUpdateAccount} checked={updateAccount} />
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
          </Stack>
          <Stack direction="row" justifyContent="center" mt={1}>
            <Button
              disabled={
                selectedExpenses.length === 0 ||
                (actionType === "update" ? !updateAccount && !updateCategory : false) ||
                isLoading
              }
              variant="outlined"
              color={actionType === "delete" ? "error" : "info"}
              endIcon={
                isLoading ? (
                  <CircularProgress size={20} />
                ) : actionType === "delete" ? (
                  <ClearIcon fontSize="inherit" sx={{ color: theme.palette.error.main }} />
                ) : (
                  <CheckOutlinedIcon fontSize="inherit" />
                )
              }
              onClick={handleMultipleUpdateDelete}
              sx={{ width: 200 }}
            >
              {isLoading ? (actionType === "delete" ? "Deleting" : "Updating") : actionType || "UPDATE"}{" "}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(ExpenseListDialog);
