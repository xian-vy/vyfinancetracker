import { Dialog, DialogContent, Divider, Stack, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { PRIVACY_POLICY, TERMS_OF_USE, TNCandPrivacyPolicyDialog } from "../../constants/routes";
import { RootState } from "../../redux/store";
const About = React.lazy(() => import("../PublicComponents/About"));

const Footer = () => {
  const [openAbout, setOpenAbout] = useState(false);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

  const [agreementDialog, setAgreementDialog] = React.useState<{ open: boolean; doc: string | null }>({
    open: false,
    doc: null,
  });
  return (
    <>
      <Stack direction="column" maxWidth="md" m="auto" width="100%" p={2}>
        <Divider sx={{ mt: 1, mx: "auto", width: "100%" }} />
        <Stack direction="row" justifyContent="center" mt={1}>
          <Link
            onClick={() => setAgreementDialog({ open: true, doc: PRIVACY_POLICY })}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: { xs: "0.7rem", lg: "0.75rem" },
              color: "#f08b8f",
              textDecoration: "none",
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
              color: "#f08b8f",
              textDecoration: "none",
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
              color: "#f08b8f",
              textDecoration: "none",
            }}
          >
            About
          </Link>
        </Stack>
        <Stack direction="row" justifyContent="center" mt={0.5}>
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
          sx: { borderRadius: 1, background: darktheme ? "#1e1e1e" : "#fff", height: "auto", width: 250 },
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

      <Dialog open={agreementDialog.open} maxWidth="md" fullWidth>
        <React.Suspense fallback={<div>loading...</div>}>
          <TNCandPrivacyPolicyDialog
            selectedDoc={agreementDialog.doc}
            onClose={() => setAgreementDialog({ open: false, doc: PRIVACY_POLICY })}
          />
        </React.Suspense>
      </Dialog>
    </>
  );
};

export default Footer;
