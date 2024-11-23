import { Add as AddIcon } from "@mui/icons-material";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { Backdrop, CircularProgress, Dialog, DialogContent, Grid, Paper, Typography, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ACTION_TYPES } from "../../../constants/constants";
import { FORM_WIDTH, iconSizeXS } from "../../../constants/size";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { ThemeColor } from "../../../helper/utils";
import { useActionPopover } from "../../../hooks/actionHook";
import useSnackbarHook from "../../../hooks/snackbarHook";
import CategoryIcons from "../../../media/CategoryIcons";
import CategoryModel from "../../../models/CategoryModel";
import { updatebudgetAction } from "../../../redux/actions/budgetAction";
import { updateMultpleExpensesAction } from "../../../redux/actions/expenseAction";
import { RootState } from "../../../redux/store";
import CustomIconButton from "../../CustomIconButton";
import DeleteConfirmationDialog from "../../Dialog/DeleteConfirmationDialog";
import EntryFormSkeleton from "../../Skeleton/EntryFormSkeleton";
import GenericListItem from "../GenericListItem";
import { BudgetModel } from "../../../models/BudgetModel";
import ExpenseModel from "../../../models/ExpenseModel";
const CategoryForm = React.lazy(() => import("./CategoryForm"));
const CategoryList = () => {
  const { categories, deleteCategory } = useCategoryContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const budgets : BudgetModel[] = useSelector((state: RootState) => state.budget.budgets);
  const expenses : ExpenseModel[] = useSelector((state: RootState) => state.expenses.expenses);
  const [isLoading, setIsLoading] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryModel>({} as CategoryModel);

  const handleDeleteCategory = useCallback(async () => {
    try {
      setIsLoading(true);

      // Find the "Uncategorized" category
      const uncategorized = categories.find((category) => {
        return category.description === "Uncategorized";
      });
      const uncategorizedId = uncategorized ? uncategorized.id : "";

      const budgetUpdatePromises = budgets.flatMap((budgetItem) => {
        let uncategorizedBudgetItem = budgetItem.budgets.find(
          (budgetItem) => budgetItem.category_id === uncategorizedId
        );

        //Uncategorized already exists, remove the budget instead then
        //add the amount from removed budget the amount of existing Uncategorized amount
        if (uncategorizedBudgetItem) {
          const toBeDeletedBudgetItemIndex = budgetItem.budgets.findIndex(
            (item) => item.category_id === editCategory.id
          );

          // If to-be-deleted category exists in the budget, remove it and update the amount
          if (toBeDeletedBudgetItemIndex !== -1) {
            const toBeDeletedBudgetItem = budgetItem.budgets[toBeDeletedBudgetItemIndex];
            // Create a new object for the uncategorized budget item with the updated amount
            const updatedUncategorizedBudgetItem = {
              ...uncategorizedBudgetItem,
              amount: uncategorizedBudgetItem.amount + toBeDeletedBudgetItem.amount,
            };
            // Replace the old uncategorized budget item with the updated one
            const updatedBudgetItems = budgetItem.budgets.map((item) =>
              item.category_id === uncategorizedId ? updatedUncategorizedBudgetItem : item
            );
            // Remove the to-be-deleted budget item
            updatedBudgetItems.splice(toBeDeletedBudgetItemIndex, 1);

            return dispatch(
              updatebudgetAction({ ...budgetItem, budgets: updatedBudgetItems, lastModified: Timestamp.now() })
            );
          }
        } else {
          // Just update the category to "Uncategorized" if Uncategorized doesnt exist in budget batch
          const updatedBudgetItems = budgetItem.budgets.map((item) => {
            if (item.category_id === editCategory.id) {
              return { ...item, category_id: uncategorizedId };
            }
            return item;
          });

          const hasUpdates = updatedBudgetItems.some((item) => item.category_id === uncategorizedId);
          if (hasUpdates) {
            return dispatch(
              updatebudgetAction({ ...budgetItem, budgets: updatedBudgetItems, lastModified: Timestamp.now() })
            );
          }
        }
        return [];
      });

      await Promise.all(budgetUpdatePromises);

      const expensesWithSameCategory = expenses.filter((expense) => {
        return expense.category_id === editCategory.id;
      });

      await dispatch(
        updateMultpleExpensesAction({
          expenseData: expensesWithSameCategory,
          categoryId: uncategorizedId,
          accountId: null,
        })
      );

      deleteCategory(editCategory.id);

      openSuccessSnackbar(`Category has been deleted`);
    } catch (error) {
      console.error("Delete category failed", error);
    } finally {
      setDeleteFormOpen(false);
      setIsLoading(false);
    }
  }, [categories, budgets, expenses, editCategory, deleteCategory]);

  const handleAction = async (option: string, category: CategoryModel) => {
    setEditCategory(category);

    if (option === ACTION_TYPES.Edit) {
      setEditMode(true);
      setFormOpen(true);
    } else if (option === ACTION_TYPES.Delete) {
      setDeleteFormOpen(true);
    }
    handleActionClose();
  };

  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [ACTION_TYPES.Edit, ACTION_TYPES.Delete],
    handleAction,
    disabledCondition: (action: string, category: CategoryModel) =>
      action === ACTION_TYPES.Delete &&
      (category.description === "Uncategorized" || category.description === "Swap Account"),
  });

  const handleAddCategory = () => {
    setEditMode(false);
    setFormOpen(true);
  };

  const handleSave = (data: { newCategory: string; msg: string }) => {
    setFormOpen(false);
    openSuccessSnackbar(`Category has been ${data.msg}`);
  };
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <div>
      <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper
        sx={{ borderRadius: 2, padding: 2, display: "flex", flexDirection: "column", minHeight:200 }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <Grid container p={1} spacing={1} justifyContent="space-between" alignItems="center">
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <CategoryOutlinedIcon sx={{ fontSize: iconSizeXS }} />
            <Typography variant="h6" align="left" ml={0.5}>
              Expense & Budget Categories
            </Typography>
          </div>

          <CustomIconButton onClick={handleAddCategory} type="add" style={{ marginLeft: 2 }}>
            <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
              New
            </Typography>
            <AddIcon sx={{ fontSize: iconSizeXS }} />
          </CustomIconButton>
        </Grid>

        <GenericListItem items={categories} onActionSelect={handleActionOpen} icons={CategoryIcons} />
      </Paper>

      <Dialog
        open={isFormOpen}
        PaperProps={{
          sx: { borderRadius: 1, width: FORM_WIDTH },
        }}
      >
        <DialogContent sx={{ px: 2, py: 1, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}>
          <React.Suspense fallback={<EntryFormSkeleton items={4} />}>
            <CategoryForm
              categoryContext={categories}
              closeForm={() => setFormOpen(false)}
              editCategory={editCategory}
              isEditMode={editMode}
              onSave={handleSave}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>
      {SnackbarComponent}
      {ActionPopover}
      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={() => setDeleteFormOpen(false)}
        onDelete={handleDeleteCategory}
        description={editCategory?.description || " "}
      />
    </div>
  );
};

export default CategoryList;
