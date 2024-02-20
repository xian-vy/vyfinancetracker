import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Backdrop, CircularProgress, Typography } from "@mui/material";

const DeleteAccountBackdrop = () => {
  const isDeleting = useSelector((state: RootState) => state.deleteAccount.isDeleting);

  return (
    <div>
      <Backdrop
        open={isDeleting}
        sx={{ backgroundColor: "rgba(0,  0,  0,  0.9)", color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 999 }}
      >
        <CircularProgress color="inherit" size={30} />
        <Typography variant="body2" color="inherit" ml={2}>
          Deleting account...
        </Typography>
      </Backdrop>
    </div>
  );
};

export default DeleteAccountBackdrop;
