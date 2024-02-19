import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "@mui/material";
import React from "react";
import { linkAnonymousAcccount } from "../../Helper/AuthHelper";
import useSnackbarHook from "../../hooks/snackbarHook";

const LinkAccount = () => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const handleLinkAnonymousAccount = async () => {
    const response = await linkAnonymousAcccount();

    if (response !== "Success") {
      openSuccessSnackbar(response, true);
    } else {
      openSuccessSnackbar("Account Linked Successfully.");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        color="primary"
        sx={{ textTransform: "none", height: "27px", borderRadius: 2, width: 150, my: 1 }}
        onClick={handleLinkAnonymousAccount}
        startIcon={<GoogleIcon style={{ fontSize: "14px", marginBottom: "2px" }} />}
      >
        Link Account
      </Button>
      {SnackbarComponent}
    </div>
  );
};

export default LinkAccount;
