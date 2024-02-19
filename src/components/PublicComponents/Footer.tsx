import { Dialog, DialogContent, Divider, Stack, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { PRIVACY_POLICY, TERMS_OF_USE } from "../../constants/routes";
const About = React.lazy(() => import("../PublicComponents/About"));

const Footer = () => {
  const [openAbout, setOpenAbout] = useState(false);

  return (
    <>
      <Stack
        direction="column"
        sx={{
          mt: 1,
          px: { xs: 4, md: 8, lg: 10 },
          width: "100%",
        }}
      >
        <Divider sx={{ mt: 1, mx: { xs: 1, md: 10, lg: 30, xl: 60 } }} />
        <Stack direction="row" justifyContent="center" mt={1}>
          <Link
            variant="body1"
            component={RouterLink}
            to={PRIVACY_POLICY}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            Privacy Policy
          </Link>
          <Link
            variant="body1"
            ml={1.5}
            component={RouterLink}
            to={TERMS_OF_USE}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            Terms of Use
          </Link>
          <Link
            variant="body1"
            ml={1.5}
            component="div"
            onClick={() => setOpenAbout(true)}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            About
          </Link>
        </Stack>
        <Stack direction="row" justifyContent="center">
          <Typography variant="caption" textAlign="center">
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
    </>
  );
};

export default Footer;
