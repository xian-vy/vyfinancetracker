import { Dialog, DialogContent, Divider, Stack, ThemeProvider, Typography, useMediaQuery } from "@mui/material";
import Link from "@mui/material/Link";
import React, { useState } from "react";
import { PRIVACY_POLICY, TERMS_OF_USE, TNCandPrivacyPolicyDialog } from "../../constants/routes";
import { darkTheme, lightTheme } from "../../Theme";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
const About = React.lazy(() => import("../PublicComponents/About"));

const Footer = () => {
  const [openAbout, setOpenAbout] = useState(false);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const systemThemeIsDark = useMediaQuery("(prefers-color-scheme: dark)");

  const [agreementDialog, setAgreementDialog] = React.useState<{ open: boolean; doc: string | null }>({
    open: false,
    doc: null,
  });
  return (
    <>
      <Stack
        direction="column"
        sx={{
          px: { xs: 4, md: 8, lg: 10 },
          width: "100%",
        }}
      >
        <Divider sx={{ mt: 1, mx: "auto", width: { xs: "96%", sm: "90%", md: "50%", xl: "55%" } }} />
        <Stack direction="row" justifyContent="center" mt={0.5}>
          <Link
            onClick={() => setAgreementDialog({ open: true, doc: PRIVACY_POLICY })}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: { xs: "0.7rem", lg: "0.75rem" },
            }}
          >
            Privacy Policy
          </Link>
          <Link
            ml={1.5}
            onClick={() => setAgreementDialog({ open: true, doc: TERMS_OF_USE })}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: { xs: "0.7rem", lg: "0.75rem" },
            }}
          >
            Terms of Use
          </Link>
          <Link
            ml={1.5}
            component="div"
            onClick={() => setOpenAbout(true)}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: { xs: "0.7rem", lg: "0.75rem" },
            }}
          >
            About
          </Link>
        </Stack>
        <Stack direction="row" justifyContent="center">
          <Typography textAlign="center" sx={{ fontSize: { xs: "0.6rem", lg: "0.65rem" } }}>
            {"Copyright © "}
            {"Vy Finance Tracker"} {new Date().getFullYear()}
            {"."}
          </Typography>
        </Stack>
      </Stack>
      <Dialog
        open={openAbout}
        onClose={() => setOpenAbout(false)}
        PaperProps={{
          sx: { borderRadius: 2, background: "#1e1e1e", height: 300, width: 250 },
        }}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0,  0,  0,  0.8)" },
          },
        }}
      >
        <DialogContent
          sx={{
            py: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <React.Suspense fallback={<div>Loading...</div>}>
            <About />
          </React.Suspense>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default Footer;
