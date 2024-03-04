import { Checkbox, Dialog, Divider, Link, Stack, ThemeProvider, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../media/logo.svg";
import { HOME, PRIVACY_POLICY, TERMS_OF_USE, TNCandPrivacyPolicyDialog } from "../../constants/routes";
import useSnackbarHook from "../../hooks/snackbarHook";
import SignInAnonymous from "./SignInAnonymous";
import SignInGoogle from "./SignInGoogle";
import { useSelector } from "react-redux";
import { darkTheme, lightTheme } from "../../Theme";
import { RootState } from "../../redux/store";

export default function SignIn() {
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
      }}
    >
      <Box sx={{ mt: 1, width: 280, py: 1, px: 4, flexDirection: "column", display: "flex", alignItems: "center" }}>
        <Stack direction="row" alignItems="center" justifyContent="center" mb={2}>
          <img
            src={logo}
            onClick={() => navigate(HOME)}
            alt="Logo"
            style={{ width: "24px", height: "24px", cursor: "pointer", padding: 0 }}
          />
          <Typography component="h1" align="center" ml={0.5} sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
            Sign In
          </Typography>
        </Stack>

        <SignInGoogle
          hasAgreed={agreeToTerms}
          promptAgreementMsg={() => openSuccessSnackbar("You must agree to privacy and terms to continue.", true)}
        />

        <Divider sx={{ my: 2, width: "86%", fontSize: "0.7rem" }}>Or</Divider>

        <SignInAnonymous
          hasAgreed={agreeToTerms}
          promptAgreementMsg={() => openSuccessSnackbar("You must agree to privacy and terms to continue.", true)}
        />

        <Stack direction="column" alignItems="center" mt={3}>
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
                sx={{ cursor: "pointer" }}
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
              sx={{ cursor: "pointer" }}
            >
              Terms of Use
            </Link>
            .
          </Typography>
        </Stack>
      </Box>
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
