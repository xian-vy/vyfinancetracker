import { Checkbox, Dialog, Divider, Link, Paper, Stack, ThemeProvider, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { useSelector } from "react-redux";
import { darkTheme, lightTheme } from "../../Theme";
import { PRIVACY_POLICY, TERMS_OF_USE, TNCandPrivacyPolicyDialog } from "../../constants/routes";
import useSnackbarHook from "../../hooks/snackbarHook";
import { RootState } from "../../redux/store";
import Footer from "./Footer";
import Navigation from "./Navigation";
import SignInAnonymous from "./SignInAnonymous";
import SignInGoogle from "./SignInGoogle";
import logo from "../../media/vylogonew.png";

export default function SignIn() {
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const systemThemeIsDark = useMediaQuery("(prefers-color-scheme: dark)");
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [agreementDialog, setAgreementDialog] = React.useState<{ open: boolean; doc: string | null }>({
    open: false,
    doc: null,
  });
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        position: "relative",
      }}
    >
      <Navigation />
      <Box  sx={{ borderRadius:2, my: {xs:15, xl:20},p:6,minHeight: {xs:"50vh", sm:"auto"}, width: {xs:"90%", sm:350}, flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center" }}>

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} width="100%"  mb={5}>
          <img
                src={logo}
                alt="Logo"
                style={{
                  width: "25px",
                  height: "25px",
                }}
                />
          <Typography component="h1" align="center" sx={{fontSize:"0.9rem",fontWeight:"600", color: darktheme ? "#ccc" : "#333"}} >
            SIGN IN
          </Typography>
       </Stack>

        <SignInGoogle
          hasAgreed={agreeToTerms}
          promptAgreementMsg={() => openSuccessSnackbar("You must agree to privacy and terms to continue.", true)}
        />

        <Divider sx={{ my: 2, width: "100%", fontSize: "0.7rem" }}>OR</Divider>

        <SignInAnonymous
          hasAgreed={agreeToTerms}
          promptAgreementMsg={() => openSuccessSnackbar("You must agree to privacy and terms to continue.", true)}
        />

        <Stack direction="column" alignItems="center" mt={5} width="100%">
          <Stack direction="row" alignItems="center">
            <Checkbox
              checked={agreeToTerms}
              onChange={(event) => setAgreeToTerms(event.target.checked)}
              color="primary"
              sx={{ height: 16, width: 25, ":hover": { bgcolor: "transparent" } }}
            />
            <Typography align="center" sx={{ fontSize: { xs: "0.65rem", lg: "0.7rem" } }}>
              I agree to the{" "}
              <Link
                onClick={() => setAgreementDialog({ open: true, doc: PRIVACY_POLICY })}
                underline="hover"
                sx={{ cursor: "pointer" ,color: "#d86c70", }}
              >
                Privacy Policy
              </Link>{" "}
              and
            </Typography>
          </Stack>
          <Typography align="center" sx={{ fontSize: { xs: "0.65rem", lg: "0.7rem" } }}>
            acknowledge being subject to its{" "}
            <Link
              onClick={() => setAgreementDialog({ open: true, doc: TERMS_OF_USE })}
              underline="hover"
              sx={{ cursor: "pointer", color: "#d86c70", }}
            >
              Terms of Use
            </Link>
            .
          </Typography>
        </Stack>
      </Box>
      <Footer />
      {SnackbarComponent}
      <ThemeProvider
        theme={darktheme === null ? (systemThemeIsDark ? darkTheme : lightTheme) : darktheme ? darkTheme : lightTheme}
      >
        <Dialog open={agreementDialog.open} maxWidth="md" fullWidth  
            PaperProps={{ 
              sx: { borderRadius: 0,  },
            }}
           slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0,  0,  0,  0.8)',
              },
            },
          }}>
          <React.Suspense fallback={<div>loading...</div>}>
            <TNCandPrivacyPolicyDialog
              selectedDoc={agreementDialog.doc}
              onClose={() => setAgreementDialog({ open: false, doc: PRIVACY_POLICY })}
            />
          </React.Suspense>
        </Dialog>
      </ThemeProvider>
    </div>
  );
}
