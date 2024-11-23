import { Link, Stack, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useRef, useState } from "react";
import { PRIVACY_POLICY, TERMS_OF_USE } from "../../constants/routes";
import ThemeToggle from "../Settings/ThemeToggle";
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicyV1";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditionsV1";

const TNCandPrivacyPolicyDialog = ({ onClose, selectedDoc }: { onClose: () => void; selectedDoc: string | null }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [privacyPolicyAsContent, setPrivacyPolicyAsContent] = useState(selectedDoc === PRIVACY_POLICY);
  const [termsAndConditionsAsContent, setTermsAndConditionsAsContent] = useState(selectedDoc === TERMS_OF_USE);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };
  return (
    <React.Fragment>
      <DialogTitle sx={{ backgroundColor: isDarkMode ? "#1e1e1e" : "#fff", py: 1 }}>
        <Stack direction="column">
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: 1, ml: -1 }}>
            <ThemeToggle loading={false} />
          </Stack>

          <Stack direction="row" mt={1} justifyContent="center">
            <Typography variant="body1" textAlign="center" gutterBottom>
              <strong>By continuing to use our app, you agree to our </strong>
              <Link
                onClick={() => {
                  setPrivacyPolicyAsContent(true);
                  setTermsAndConditionsAsContent(false);
                  scrollToTop();
                }}
                sx={{ mx: 0.5, cursor: "pointer", WebkitTapHighlightColor: "transparent",color: "#d86c70",textDecoration: "none" }}
              >
                Privacy Policy
              </Link>
              <strong> and acknowledge being subject to its</strong>
              <Link
                onClick={() => {
                  setTermsAndConditionsAsContent(true);
                  setPrivacyPolicyAsContent(false);
                  scrollToTop();
                }}
                sx={{ mx: 0.5, cursor: "pointer", WebkitTapHighlightColor: "transparent",color: "#d86c70",textDecoration: "none"  }}
              >
                Terms of Use
              </Link>
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }} ref={contentRef}>
        {privacyPolicyAsContent && <PrivacyPolicy isPublic={false} />}
        {termsAndConditionsAsContent && <TermsAndConditions isPublic={false} />}
      </DialogContent>
      <Stack direction="column" sx={{ py: 1, px: { xs: 1, md: 2 }, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}>
        <Stack direction="row" justifyContent="flex-end">
          <Button color="inherit" onClick={onClose}>
            close
          </Button>
        </Stack>
      </Stack>
    </React.Fragment>
  );
};

export default TNCandPrivacyPolicyDialog;
