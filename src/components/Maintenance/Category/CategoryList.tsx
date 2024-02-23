import { Add as AddIcon } from "@mui/icons-material";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Dialog, DialogContent, Grid, IconButton, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeColor } from "../../../helper/utils";
import CategoryIcons from "../../../media/CategoryIcons";
import { FORM_WIDTH, iconSizeXS } from "../../../constants/size";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { useActionPopover } from "../../../hooks/actionHook";
import useSnackbarHook from "../../../hooks/snackbarHook";
import CategoryModel from "../../../models/CategoryModel";
import { updatebudgetAction } from "../../../redux/actions/budgetAction";
import { updateMultpleExpensesAction } from "../../../redux/actions/expenseAction";
import { RootState } from "../../../redux/store";
import CustomIconButton from "../../CustomIconButton";
import DeleteConfirmationDialog from "../../Dialog/DeleteConfirmationDialog";
import LoadingDialog from "../../Dialog/LoadingDialog";
import EntryFormSkeleton from "../../Skeleton/EntryFormSkeleton";
const CategoryForm = React.lazy(() => import("./CategoryForm"));
const CategoryList = () => {
  const { categories, deleteCategory: delCategory } = useCategoryContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const budgets = useSelector((state: RootState) => state.budget.budgets);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const [isLoading, setIsLoading] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryModel>({} as CategoryModel);

  const handleDeleteCategory = async () => {
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

        //Uncategorized already exists, remove the budget with id == editCategory.id,
        //update the amount existing Uncategorized amount
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

      delCategory(editCategory.id);

      openSuccessSnackbar(`Category has been deleted`);
    } catch (error) {
      console.error("Delete category failed", error);
    } finally {
      setDeleteFormOpen(false);
      setIsLoading(false);
    }
  };

  const handleAction = async (option: string, category: CategoryModel) => {
    setEditCategory(category);

    if (option == "Edit") {
      setEditMode(true);
      setFormOpen(true);
    } else if (option == "Delete") {
      setDeleteFormOpen(true);
    }
    handleActionClose();
  };

  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: ["Edit", "Delete"],
    handleAction,
    disabledCondition: (action: string, category: CategoryModel) =>
      action === "Delete" && category.description === "Uncategorized",
  });

  const handleAddCategory = () => {
    setEditMode(false);
    setFormOpen(true);
  };

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: "18px" } });
  }

  const handleSave = (data: { newCategory: string; msg: string }) => {
    setFormOpen(false);
    openSuccessSnackbar(`Category has been ${data.msg}`);
  };
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      <Paper
        sx={{ borderRadius: 4, padding: 2, display: "flex", flexDirection: "column" }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <Grid container p={1} spacing={1} justifyContent="space-between" alignItems="center">
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <CategoryOutlinedIcon sx={{ fontSize: iconSizeXS }} />
            <Typography variant="body1" align="left" ml={0.5}>
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
        <div style={{ flexGrow: 1, overflow: "auto", paddingBottom: 1 }}>
          <Grid container p={{ xs: 0, md: 1 }} gap={1} justifyContent="left" alignItems="left" px={{ xs: 0, md: 2 }}>
            {categories.map((category) => {
              const iconObject = CategoryIcons.find((icon) => icon.name === category.icon);
              return (
                <Paper
                  key={category.id}
                  sx={{
                    pl: 1,
                    py: 0,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                  }}
                  variant="outlined"
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {iconObject && renderIcon(iconObject.icon, category.color)}
                    <Typography align="left" pl={1} variant={smScreen ? "caption" : "body1"}>
                      <span style={{ flex: 1 }}>{category.description}</span>
                    </Typography>
                  </div>

                  <IconButton
                    sx={{ ml: 1, py: { xs: 0.5, md: 1 } }}
                    onClick={(event) => handleActionOpen(event, category)}
                  >
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}
          </Grid>
        </div>
      </Paper>
      {ActionPopover}
      <Dialog
        open={isFormOpen}
        PaperProps={{
          sx: { borderRadius: 4, width: FORM_WIDTH },
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
      <LoadingDialog isLoading={isLoading} />

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={() => setDeleteFormOpen(false)}
        onDelete={handleDeleteCategory}
        description={editCategory?.description || " "}
        description2={""}
        date={""}
      />
    </div>
  );
};

export default CategoryList;
