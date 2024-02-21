import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { signInAnonymous } from "../../helper/AuthHelper";
import { ReactComponent as Incognito } from "../../media/incognito.svg";
import GenericDialog from "../Dialog/GenericDialog";
import { SIGNIN_NETWORK_ERROR_MESSAGE } from "../../constants/errors";
import { useDispatch, useSelector } from "react-redux";
import { setIsSigningIn } from "../../redux/reducer/userAccountSlice";
import { RootState } from "../../redux/store";

const SignInAnonymous = ({ hasAgreed, promptAgreementMsg }: { hasAgreed: boolean; promptAgreementMsg: () => void }) => {
  const [networkError, setNetworkError] = useState(false);
  const dispatch = useDispatch();
  const isSigningIn = useSelector((state: RootState) => state.userAccount.isSigningIn);

  const signIn = async () => {
    if (!hasAgreed) {
      promptAgreementMsg();

      return;
    }
    try {
      dispatch(setIsSigningIn(true));

      await signInAnonymous();
    } catch (error: any) {
      if (error.message === SIGNIN_NETWORK_ERROR_MESSAGE) {
        setNetworkError(true);
      } else {
        console.error(error.message);
      }
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
          disabled={isSigningIn}
          startIcon={<Incognito fill="#ccc" style={{ width: "22px", height: "22px" }} />}
          sx={{ textTransform: "none", fontSize: "0.75rem" }}
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
            <Typography variant="body1" mt={2}>
              Offline access is enabled in this app, but initial sign-in requires an internet connection.
            </Typography>
          </>
        }
      />
    </>
  );
};

export default SignInAnonymous;
