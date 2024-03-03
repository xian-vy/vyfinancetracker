import { Button, CircularProgress } from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

interface EntryFormButtonProps {
  canSave: boolean;
  isLoading: boolean;
  isEditMode?: boolean;
}

const EntryFormButton: React.FC<EntryFormButtonProps> = ({ canSave, isLoading, isEditMode }) => {
  return (
    <div>
      <Button
        size="medium"
        disabled={!canSave || isLoading}
        variant="outlined"
        type="submit"
        color={isEditMode ? "info" : "inherit"}
        endIcon={
          isLoading ? <CircularProgress size={20} color="inherit" /> : isEditMode ? <CheckOutlinedIcon /> : <AddIcon />
        }
        sx={{ width: "100%" }}
      >
        {isLoading ? (isEditMode ? "UPDATING.." : "SAVING..") : isEditMode ? "UPDATE" : "CREATE"}
      </Button>
    </div>
  );
};

export default EntryFormButton;
