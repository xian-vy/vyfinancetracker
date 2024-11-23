import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailIcon from '@mui/icons-material/Mail';
import YouTubeIcon from '@mui/icons-material/YouTube';import { Dialog, DialogContent, Divider, Stack, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { PRIVACY_POLICY, TERMS_OF_USE, TNCandPrivacyPolicyDialog } from "../../constants/routes";
import { RootState } from "../../redux/store";
import SimpleThemeToggle from "./SimpleThemeToggle";
import logo from "../../media/logo.svg";

const About = React.lazy(() => import("../PublicComponents/About"));

const Footer = () => {
  const [openAbout, setOpenAbout] = useState(false);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

  const [agreementDialog, setAgreementDialog] = React.useState<{ open: boolean; doc: string | null }>({
    open: false,
    doc: null,
  });

  const Privacy = () => {
    return (
      <Stack direction="column" alignItems="start" justifyContent="start" gap={1}>
        <Typography variant="h3" mb={1}>
          Privacy
        </Typography>
          <Link
            onClick={() => setAgreementDialog({ open: true, doc: PRIVACY_POLICY })}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: { xs: "0.7rem", lg: "0.75rem" },
              color: darktheme ? "#ccc" : "#000",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </Link>
          <Link     
            onClick={() => setAgreementDialog({ open: true, doc: TERMS_OF_USE })}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: { xs: "0.7rem", lg: "0.75rem" },
              color: darktheme ? "#ccc" : "#000",
              textDecoration: "none",
            }}
          >
            Terms of Use
          </Link>
         
    </Stack>
    )
  }

  const Socials = () => {
    return (
      <Stack direction="column" alignItems="start" justifyContent="center" gap={1}>
         <Typography variant="h3" mb={1}>
          Socials
        </Typography>
          <Stack direction="row" gap={1} alignContent="center" justifyContent="center">
              <FacebookIcon fontSize='small' sx={{ color: darktheme ? "#ccc" : "#333", cursor: "pointer" }} />
              <LinkedInIcon fontSize='small' sx={{ color: darktheme ? "#ccc" : "#333", cursor: "pointer" }} />
              <YouTubeIcon fontSize='small' sx={{ color: darktheme ? "#ccc" : "#333", cursor: "pointer" }} />
          </Stack>
          <Stack direction="row" alignContent="center" gap={1} sx={{height : 30}}>
                  Theme
                <SimpleThemeToggle />
          </Stack>
      </Stack>
    )
  }

  const AppDetails = () => {
    return (
      <Stack direction="column" alignItems="start" justifyContent="start" gap={1}>
        <Stack direction="column" alignItems="start" justifyContent="start" >
           <Stack direction="row" justifyContent="center" alignItems="center" gap={1} mb={2} >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: "22px",
                    height: "22px",

                  }}
                  />
                <Typography variant="h3" >
                    Vy Finance Tracker
                </Typography>
            </Stack>
            <Stack direction="row" gap={0.5} alignItems="center">
                <MailIcon sx={{ color: darktheme ? "#ccc" : "#333",fontSize:"16px"}} />
                vyfinanceapp@gmail.com
            </Stack>
        </Stack>
       
        <Link
            component="div"
            onClick={() => setOpenAbout(true)}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: { xs: "0.7rem", lg: "0.75rem" },
              color: darktheme ? "#ccc" : "#000",
              textDecoration: "none",
            }}
          >
            About
        </Link>
      </Stack>
    )
  }

  return (
    <>
      <Stack direction="column" width="100%" my={5}>
        <Divider sx={{ mt: 1, mx: "auto", width: "100%" }} />
        
        <Stack pt={5} px={{xs:3, sm:5}} gap={3} direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems="start" width="100%" maxWidth="lg" mx="auto" mt={2}>
            <AppDetails />
            <Stack direction={{xs:"column",sm:"row"}} alignItems="start" gap={{xs:3,sm:6}}>
                <Privacy />
                <Socials />
            </Stack>
        </Stack>

        <Stack direction="row" justifyContent="center" mt={5}>
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
