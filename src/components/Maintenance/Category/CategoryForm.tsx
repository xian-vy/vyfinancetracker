// ExpenseForm.tsx
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { CirclePicker } from "react-color";
import CategoryIcons from "../../../media/CategoryIcons.tsx";
import { useCategoryContext } from "../../../contextAPI/CategoryContext.tsx";
import { getRandomColor } from "../../../firebase/defaultData.tsx";
import CategoryModel from "../../../models/CategoryModel";
import LoadingDialog from "../../Dialog/LoadingDialog";
import IconListComponent from "../IconListComponent.tsx";
import { v4 as uuidv4 } from "uuid";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

interface Props {
  closeForm: () => void;
  editCategory: CategoryModel;
  isEditMode: boolean;
  onSave: (data: { newCategory: string; msg: string }) => void;
  categoryContext: CategoryModel[];
}

const BudgetForm: React.FC<Props> = ({ closeForm, editCategory, isEditMode, categoryContext, onSave }) => {
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const [color, setColor] = useState("#000000");
  const { addCategory, updateCategory } = useCategoryContext();

  const [newCategory, setNewCategory] = useState<CategoryModel>({
    id: uuidv4(),
    description: "",
    color: color,
    icon: "",
  });

  const descriptionRef = useRef<HTMLInputElement | null>(null);

  const handleColorChange = (newColor: { hex: string }) => {
    setColor(newColor.hex);
    setNewCategory((prevState) => ({ ...prevState, color: newColor.hex }));
  };

  const { IconSelectComponent, loadIcons } = IconListComponent({
    icons: CategoryIcons,
    selectedIcon: newCategory.icon,
    onIconSelect: handleIconSelect,
    color: color,
  });

  function handleIconSelect(iconName: string) {
    setNewCategory({ ...newCategory, icon: iconName });
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (isEditMode) {
          setNewCategory((prevState) => {
            const updatedState = { ...prevState, ...editCategory };
            handleIconSelect(editCategory.icon);
            setColor(editCategory.color); // Set color state here
            return updatedState;
          });
        } else {
          const randomColor = getRandomColor();
          setColor(randomColor);
          setNewCategory((prevState) => ({ ...prevState, color: randomColor }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    //descriptionRef.current?.focus();

    fetchCategories();
    loadIcons();
  }, []);

  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);

      const existing = categoryContext;

      const isDuplicate = existing.some((existingCategory) => {
        return existingCategory.description === newCategory.description && existingCategory.id !== newCategory.id;
      });

      if (isDuplicate) {
        setIsLoading(false);
        setDuplicateDetected(!duplicateDetected);
        return;
      } else {
        if (isEditMode) {
          updateCategory(newCategory);
        } else {
          addCategory(newCategory);
        }
      }
    } catch (error) {
      console.error("Error saving Category", error);
    } finally {
      setIsLoading(false);
    }

    onSave({ newCategory: newCategory.id, msg: isEditMode ? "Updated" : "Saved" });
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6"> Category Entry Form</Typography>
        <IconButton onClick={() => closeForm()} sx={{ mr: -1.5 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack
        spacing={2}
        padding={1.5}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <TextField
          size="small"
          required
          inputRef={descriptionRef}
          label="Description"
          value={newCategory?.description}
          onChange={(e) => {
            if (e.target.value.length <= 35) {
              setNewCategory({
                ...newCategory,
                description: e.target.value,
              });
              setDuplicateDetected(false);
            }
          }}
          InputLabelProps={{ shrink: true }}
          error={duplicateDetected}
          helperText={duplicateDetected ? "Category exists." : ""}
          FormHelperTextProps={{ style: { marginLeft: 0 } }}
          disabled={newCategory.description === "Uncategorized"}
        />

        {IconSelectComponent}
        <Box display="flex" justifyContent="center">
          <CirclePicker color={color} onChange={handleColorChange} />
        </Box>
        <Button
          size="small"
          variant="outlined"
          type="submit"
          color="inherit"
          endIcon={isEditMode ? <CheckOutlinedIcon /> : <AddIcon />}
          style={isEditMode ? { borderColor: newCategory.color } : { borderColor: color }}
        >
          {isEditMode ? "UPDATE" : "CREATE"}
        </Button>
      </Stack>

      <LoadingDialog isLoading={isLoading} />
    </>
  );
};

export default BudgetForm;
