import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { signInAnonymous } from "../../Helper/AuthHelper";
import { ReactComponent as Incognito } from "../../Media/incognito.svg";
import GenericDialog from "../Dialog/GenericDialog";

const SignInAnonymous = ({ hasAgreed, promptAgreementMsg }: { hasAgreed: boolean; promptAgreementMsg: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const signIn = async () => {
    if (!hasAgreed) {
      promptAgreementMsg();
      return;
    }
    try {
      setLoading(true);
      await signInAnonymous();
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
          startIcon={<Incognito fill="#ccc" style={{ width: "22px", height: "22px" }} />}
          sx={{ textTransform: "none" }}
        >
          Continue Anonymously
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

export default SignInAnonymous;
