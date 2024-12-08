import { Divider, Link, Stack, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useRef, useState } from "react";
import { PRIVACY_POLICY, TERMS_OF_USE } from "../../constants/routes";
import ThemeToggle from "../Settings/ThemeToggle";
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicyV1";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditionsV1";
import { CloseOutlined } from "@mui/icons-material";
import logo from "../../media/vylogonew.png";

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
          <Stack direction="row" justifyContent="space-between" alignItems="center" my={1.5}>
              <Stack direction="row" justifyContent="center" alignItems="center" gap={0.5}  >
                    <img
                      src={logo}
                      alt="Logo"
                      style={{
                        width: "20px",
                        height: "20px",

                      }}
                      />
                    <Typography sx={{color: isDarkMode ? "#ccc" : "#333", mt:0.1,fontSize:"0.8rem",fontWeight:"600"}}>
                      VYFINANCE
                    </Typography>
                </Stack>
                <CloseOutlined onClick={onClose} sx={{ color: isDarkMode ? "#ccc" : "#333", cursor: "pointer", fontSize:16 }} />
          </Stack>

          <Stack direction="row" mt={1} justifyContent="center">
            <Typography variant="subtitle2" textAlign="center" gutterBottom>
             By continuing to use our app, you agree to our 
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
               and acknowledge being subject to its
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
      <Stack direction="row" justifyContent="end" alignItems="center" sx={{ mb: 5 }} />
    </React.Fragment>
  );
};

export default TNCandPrivacyPolicyDialog;
