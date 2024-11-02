import { Checkbox, Dialog, Divider, Link, Stack, ThemeProvider, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { darkTheme, lightTheme } from "../../Theme";
import { HOME, PRIVACY_POLICY, TERMS_OF_USE, TNCandPrivacyPolicyDialog } from "../../constants/routes";
import useSnackbarHook from "../../hooks/snackbarHook";
import logo from "../../media/logo.svg";
import { RootState } from "../../redux/store";
import Footer from "./Footer";
import Navigation from "./Navigation";
import SignInAnonymous from "./SignInAnonymous";
import SignInGoogle from "./SignInGoogle";

export default function SignIn() {
  const theme = useTheme();
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const systemThemeIsDark = useMediaQuery("(prefers-color-scheme: dark)");
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const navigate = useNavigate();
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [agreementDialog, setAgreementDialog] = React.useState<{ open: boolean; doc: string | null }>({
    open: false,
    doc: null,
  });
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        position: "relative",
      }}
    >
      <Navigation />
      <Box sx={{ my: 20, width: 320, py: 1, px: 2, flexDirection: "column", display: "flex", alignItems: "center" }}>
        <Stack direction="row" alignItems="center" justifyContent="center" mb={2}>
          <img
            src={logo}
            onClick={() => navigate(HOME)}
            alt="Logo"
            style={{ width: "24px", height: "24px", cursor: "pointer", padding: 0 }}
          />

          <Typography component="h1" align="center" ml={0.8} variant="subtitle1" fontWeight={500}>
            Sign In
          </Typography>
        </Stack>

        <SignInGoogle
          hasAgreed={agreeToTerms}
          promptAgreementMsg={() => openSuccessSnackbar("You must agree to privacy and terms to continue.", true)}
        />

        <Divider sx={{ my: 1, width: "90%", fontSize: "0.7rem" }}>Or</Divider>

        <SignInAnonymous
          hasAgreed={agreeToTerms}
          promptAgreementMsg={() => openSuccessSnackbar("You must agree to privacy and terms to continue.", true)}
        />

        <Stack direction="column" alignItems="center" mt={3} width="100%">
          <Stack direction="row" alignItems="center">
            <Checkbox
              checked={agreeToTerms}
              onChange={(event) => setAgreeToTerms(event.target.checked)}
              color="primary"
              sx={{ height: 16, width: 25 }}
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
        <Dialog open={agreementDialog.open} maxWidth="md" fullWidth>
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
