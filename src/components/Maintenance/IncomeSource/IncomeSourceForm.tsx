// ExpenseForm
import AddIcon from "@mui/icons-material/Add";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { Backdrop, Box, Button, CircularProgress, IconButton, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { CirclePicker } from "react-color";
import { v4 as uuidv4 } from "uuid";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { getRandomColor } from "../../../firebase/defaultData";
import IncomeSourceIcons from "../../../media/IncomeSourceIcons";
import IncomeSourcesModel from "../../../models/IncomeSourcesModel";
import IconListComponent from "../IconListComponent";

interface Props {
  closeForm: () => void;
  onSave: (data: { newIncomeSource: string; msg: string }) => void;

  editIncomeSource: IncomeSourcesModel;
  isEditMode: boolean;
}

const IncomeSourceForm: React.FC<Props> = ({ closeForm, editIncomeSource, isEditMode, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const { incomeSource, addIncomeSource, updateIncomeSource } = useIncomeSourcesContext();

  const [color, setColor] = useState("#000000");
  const [newIncomeSource, setNewIncomeSource] = useState<IncomeSourcesModel>({
    id: uuidv4(),
    description: "",
    color: color,
    icon: "",
  });

  const descriptionRef = useRef<HTMLInputElement | null>(null);

  const handleColorChange = (newColor: { hex: string }) => {
    setColor(newColor.hex);
    setNewIncomeSource((prevState) => ({ ...prevState, color: newColor.hex }));
  };

  const { IconSelectComponent, loadIcons } = IconListComponent({
    icons: IncomeSourceIcons,
    selectedIcon: newIncomeSource.icon,
    onIconSelect: handleIconSelect,
    color: color,
  });

  function handleIconSelect(iconName: string) {
    setNewIncomeSource({ ...newIncomeSource, icon: iconName });
  }
  useEffect(() => {
    const fetchIncomeSource = async () => {
      try {
        if (isEditMode) {
          setNewIncomeSource((prevState) => {
            const updatedState = { ...prevState, ...editIncomeSource };
            handleIconSelect(editIncomeSource.icon);
            setColor(editIncomeSource.color); // Set color state here
            return updatedState;
          });
        } else {
          const randomColor = getRandomColor();
          setColor(randomColor);
          setNewIncomeSource((prevState) => ({ ...prevState, color: randomColor }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    // descriptionRef.current?.focus();

    fetchIncomeSource();
    loadIcons();
  }, []);

  const handleFormSubmit = async () => {
    if (newIncomeSource.description) {
      try {
        setIsLoading(true);

        const existing = incomeSource;

        const isDuplicate = existing.some((existingIncomeSource) => {
          return (
            existingIncomeSource.description === newIncomeSource.description &&
            existingIncomeSource.id !== newIncomeSource.id
          );
        });

        if (isDuplicate) {
          setDuplicateDetected(!duplicateDetected);

          return;
        } else {
          if (isEditMode) {
            updateIncomeSource(newIncomeSource);
          } else {
            addIncomeSource(newIncomeSource);
          }
        }
      } catch (error) {
        console.error("Error saving Income Source", error);
      } finally {
        setIsLoading(false);
      }
      onSave({ newIncomeSource: newIncomeSource.id, msg: isEditMode ? "Updated" : "Saved" });
    }
  };

  return (
    <>
      <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6"> Income Source Entry Form</Typography>
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
          inputRef={descriptionRef}
          required
          label="Description"
          value={newIncomeSource?.description}
          onChange={(e) => {
            if (e.target.value.length <= 35) {
              setNewIncomeSource({
                ...newIncomeSource,
                description: e.target.value,
              });
              setDuplicateDetected(false);
            }
          }}
          InputLabelProps={{ shrink: true }}
          error={duplicateDetected}
          helperText={duplicateDetected ? "Income Source exists." : ""}
          FormHelperTextProps={{ style: { marginLeft: 0 } }}
          disabled={newIncomeSource.description === "Uncategorized"}
        />
        {IconSelectComponent}
        <Box display="flex" justifyContent="center">
          <CirclePicker color={color} onChange={handleColorChange} />
        </Box>

        <Button
          variant="outlined"
          type="submit"
          color="inherit"
          endIcon={isEditMode ? <CheckOutlinedIcon /> : <AddIcon />}
          style={isEditMode ? { borderColor: newIncomeSource.color } : { borderColor: color }}
        >
          {isEditMode ? "UPDATE" : "CREATE"}
        </Button>
      </Stack>
    </>
  );
};

export default IncomeSourceForm;
