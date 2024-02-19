import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { CirclePicker } from "react-color";
import AccountsIcons from "../../../Media/AccountsIcons";
import { useAccountTypeContext } from "../../../contextAPI/AccountTypeContext";
import { getRandomColor } from "../../../firebase/defaultData";
import AccountTypeModel from "../../../models/AccountTypeModel";
import LoadingDialog from "../../Dialog/LoadingDialog";
import IconListComponent from "../IconListComponent";
import { v4 as uuidv4 } from "uuid";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

interface Props {
  closeForm: () => void;
  onSave: (data: { newAccount: string; msg: string }) => void;
  editAccountType: AccountTypeModel;
  isEditMode: boolean;
}

const AccountsForm: React.FC<Props> = ({ closeForm, editAccountType, isEditMode, onSave }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const { accountType, addAccountType, updateAccountType } = useAccountTypeContext();

  const [color, setColor] = useState("#000000");

  const [newAccountType, setNewAccountType] = useState<AccountTypeModel>({
    id: uuidv4(),
    description: "",
    color: color,
    icon: "",
  });

  const handleColorChange = (newColor: { hex: string }) => {
    setColor(newColor.hex);
    setNewAccountType((prevState) => ({ ...prevState, color: newColor.hex }));
  };

  const { IconSelectComponent, loadIcons } = IconListComponent({
    icons: AccountsIcons,
    selectedIcon: newAccountType.icon,
    onIconSelect: handleIconSelect,
    color: color,
  });

  function handleIconSelect(iconName: string) {
    setNewAccountType({ ...newAccountType, icon: iconName });
  }
  const descriptionRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (isEditMode) {
          setNewAccountType((prevState) => {
            const updatedState = { ...prevState, ...editAccountType };
            handleIconSelect(editAccountType.icon);
            setColor(editAccountType.color); // Set color state here
            return updatedState;
          });
        } else {
          const randomColor = getRandomColor();
          setColor(randomColor);
          setNewAccountType((prevState) => ({ ...prevState, color: randomColor }));
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
    if (newAccountType.description) {
      try {
        setIsLoading(true);

        const existing = accountType;

        const isDuplicate = existing.some((existingPtype) => {
          return existingPtype.description === newAccountType.description && existingPtype.id !== newAccountType.id;
        });

        if (isDuplicate) {
          setDuplicateDetected(!duplicateDetected);
          setOpen(true);
          return;
        } else {
          if (isEditMode) {
            updateAccountType(newAccountType);
          } else {
            addAccountType(newAccountType);
          }
        }
      } catch (error) {
        console.error("Error saving Account", error);
      } finally {
        setIsLoading(false);
      }
      onSave({ newAccount: newAccountType.id, msg: isEditMode ? "Updated" : "Saved" });
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6"> Account Entry Form</Typography>
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
          value={newAccountType.description}
          onChange={(e) => {
            if (e.target.value.length <= 35) {
              setNewAccountType({
                ...newAccountType,
                description: e.target.value,
              });
              setDuplicateDetected(false);
            }
          }}
          InputLabelProps={{ shrink: true }}
          error={duplicateDetected}
          helperText={duplicateDetected ? "Account Type exists." : ""}
          FormHelperTextProps={{ style: { marginLeft: 0 } }}
          disabled={newAccountType.description === "Uncategorized"}
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
          style={isEditMode ? { borderColor: newAccountType.color } : { borderColor: color }}
        >
          {isEditMode ? "UPDATE" : "CREATE"}
        </Button>
      </Stack>

      <LoadingDialog isLoading={isLoading} />
    </>
  );
};

export default AccountsForm;
