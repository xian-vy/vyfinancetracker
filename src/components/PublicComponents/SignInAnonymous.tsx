import PersonIcon from "@mui/icons-material/Person";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SIGNIN_NETWORK_ERROR_MESSAGE } from "../../constants/errors";
import { signInAnonymous } from "../../helper/AuthHelper";
import { setIsSigningIn } from "../../redux/reducer/userAccountSlice";
import { RootState } from "../../redux/store";
import GenericDialog from "../Dialog/GenericDialog";
const SignInAnonymous = ({ hasAgreed, promptAgreementMsg }: { hasAgreed: boolean; promptAgreementMsg: () => void }) => {
  const [networkError, setNetworkError] = useState(false);
  const dispatch = useDispatch();
  const isSigningIn = useSelector((state: RootState) => state.userAccount.isSigningIn);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

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
      <Box display="flex" px={2} flexDirection="column" alignItems="center" justifyContent="center" width={300}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={signIn}
          size="large"
          fullWidth
          disabled={isSigningIn}
          startIcon={<PersonIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: "none",
            fontSize: { xs: "0.7rem", lg: "0.75rem" },
            border: darktheme ? "solid 1px #2a2a2a" : "solid 1px #ccc",
          }}
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
