import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Backdrop, CircularProgress, Typography } from "@mui/material";

const AccountActivityBackdrop = () => {
  const isDeleting = useSelector((state: RootState) => state.userAccount.isDeleting);
  const isSigningIn = useSelector((state: RootState) => state.userAccount.isSigningIn);

  return (
    <div>
      <Backdrop
        open={isDeleting || isSigningIn}
        sx={{ backgroundColor: "rgba(0,  0,  0,  0.9)", color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 999 }}
      >
        <CircularProgress color="inherit" size={30} />
        <Typography variant="body2" color="inherit" ml={2}>
          {isSigningIn ? "Signing In..." : isDeleting ? "Deleting account, Please Wait..." : ""}
        </Typography>
      </Backdrop>
    </div>
  );
};

export default AccountActivityBackdrop;
