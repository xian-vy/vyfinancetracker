import { Stack, Link, Dialog, DialogContent, DialogTitle, useTheme } from "@mui/material";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const TermsAndConditions = React.lazy(() => import("../legal/TermsAndConditions/TermsAndConditionsV1"));
const PrivacyPolicy = React.lazy(() => import("../legal/PrivacyPolicy/PrivacyPolicyV1"));

const PrivacyAndTerms = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTNC, setOpenTNC] = useState(false);
  return (
    <div>
      <Stack direction="row">
        <Link
          mx={0.5}
          onClick={() => {
            setOpenPrivacy(true);
            setOpenTNC(false);
          }}
          component="p"
          color="inherit"
          sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
        >
          Privacy
        </Link>
        <Link
          mx={0.5}
          onClick={() => {
            setOpenPrivacy(false);
            setOpenTNC(true);
          }}
          component="p"
          color="inherit"
          sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
        >
          Terms
        </Link>
      </Stack>

      <Dialog
        open={openPrivacy || openTNC}
        PaperProps={{
          sx: { background: isDarkMode ? "#1e1e1e" : "#fff" },
        }}
        maxWidth="md"
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle align="right">
          <CloseIcon
            onClick={() => {
              if (openPrivacy) setOpenPrivacy(false);
              if (openTNC) setOpenTNC(false);
            }}
            sx={{ cursor: "pointer" }}
          />
        </DialogTitle>
        <DialogContent>
          <React.Suspense fallback={<div>loading..</div>}>
            {openPrivacy && <PrivacyPolicy isPublic={false} />}
            {openTNC && <TermsAndConditions isPublic={false} />}
          </React.Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivacyAndTerms;
