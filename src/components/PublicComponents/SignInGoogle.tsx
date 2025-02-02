import GoogleIcon from "@mui/icons-material/Google";
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { signInWithGoogle } from "../../helper/AuthHelper";
import GenericDialog from "../Dialog/GenericDialog";
import { SIGNIN_NETWORK_ERROR_MESSAGE } from "../../constants/errors";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setIsSigningIn } from "../../redux/reducer/userAccountSlice";

const SignInGoogle = ({ hasAgreed, promptAgreementMsg }: { hasAgreed: boolean; promptAgreementMsg: () => void }) => {
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
      await signInWithGoogle();
    } catch (error: any) {
      dispatch(setIsSigningIn(false));
      if (error.message === SIGNIN_NETWORK_ERROR_MESSAGE) {
        setNetworkError(true);
      } else {
        console.error(error.message);
      }
    } finally {
      dispatch(setIsSigningIn(false));
    }
  };
  return (
    <>
      <Box display="flex" px={2} flexDirection="column" alignItems="center" justifyContent="center" width={{xs: 285, sm: 300}}>
        <Button
          variant="outlined"
          onClick={signIn}
          color="inherit"
          fullWidth
          size="large"
          disabled={isSigningIn}
          startIcon={<GoogleIcon style={{ fontSize: "18px",color :"#ccc" }} />}
          sx={{
            textTransform: "none",
            fontSize: { xs: "0.75rem", lg: "0.8rem" },
            border:  "solid 1px #2a2a2a" ,
            py:0.8,
            color:  "#ccc" ,
          }}
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
            <Typography variant="body1" mt={2}>
              Offline access is enabled in this app, but initial sign-in requires an internet connection.
            </Typography>
          </>
        }
      />
    </>
  );
};

export default SignInGoogle;
