import GoogleIcon from "@mui/icons-material/Google";
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { signInWithGoogle } from "../../Helper/AuthHelper";
import GenericDialog from "../Dialog/GenericDialog";

const SignInGoogle = ({ hasAgreed, promptAgreementMsg }: { hasAgreed: boolean; promptAgreementMsg: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const signIn = async () => {
    if (!hasAgreed) {
      promptAgreementMsg();
      return;
    }
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      if (error.message === "Network request failed") {
        setNetworkError(true);
      } else {
        console.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Box display="flex" px={2} flexDirection="column" alignItems="center" justifyContent="center" width={250}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={signIn}
          fullWidth
          disabled={loading}
          startIcon={<GoogleIcon style={{ fontSize: "20px" }} />}
          sx={{ textTransform: "none" }}
        >
          Continue with Google
        </Button>
      </Box>

      <GenericDialog
        open={networkError}
        handleClose={() => setNetworkError(false)}
        title="Network required"
        content={
          <>
            <Typography variant="body1">
              Offline access is enabled in this app, but initial sign-in requires an internet connection.
            </Typography>
          </>
        }
      />
    </>
  );
};

export default SignInGoogle;
