import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Divider, Stack, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FEATURES } from '../../constants/constants';
import { PRIVACY_POLICY, TERMS_OF_USE, TNCandPrivacyPolicyDialog } from "../../constants/routes";
import logo from "../../media/vylogonew.png";
import { RootState } from "../../redux/store";
const AboutComponent = React.lazy(() => import("../PublicComponents/About"));

const Footer = () => {
  const [openAbout, setOpenAbout] = useState(false);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

  const [agreementDialog, setAgreementDialog] = React.useState<{ open: boolean; doc: string | null }>({
    open: false,
    doc: null,
  });

  const About = () => {
    return (
      <Stack direction="column" alignItems="start" justifyContent="start" gap={1}>
        <Typography   sx={{color:  '#ccc' , fontSize:{xs:"1rem",md:"1.2rem"},fontWeight:"600"}}>
          About
        </Typography>
          <Link
            onClick={() => setAgreementDialog({ open: true, doc: PRIVACY_POLICY })}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: {xs:"0.75rem",md:"0.85rem"},
              color:  '#ccc' ,
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
              fontSize: {xs:"0.75rem",md:"0.85rem"},
              color:  '#ccc' ,
              textDecoration: "none",
            }}
          >
            Terms of Use
          </Link>
          <Link
            component="div"
            onClick={() => setOpenAbout(true)}
            sx={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              fontSize: {xs:"0.75rem",md:"0.85rem"},
              color:  '#ccc' ,
              textDecoration: "none",
            }}
          >
            About
        </Link>
    </Stack>
    )
  }

  const Socials = () => {
    return (
      <Stack direction="column" alignItems="start" justifyContent="center" gap={1}>
         <Typography   sx={{color:  '#ccc' , fontSize:{xs:"1rem",md:"1.2rem"},fontWeight:"600"}}>
          Socials
        </Typography>

          <Link
            href="https://www.linkedin.com/in/xianvyy/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              WebkitTapHighlightColor: "transparent",
              fontSize: {xs:"0.75rem",md:"0.85rem"},
              color:  '#ccc' ,
              textDecoration: "none",
              ":hover":  {
                textDecoration: "underline",
              }
            }}
          >
           Linkedin
          </Link>
          <Link
            href="https://www.facebook.com/xzyian.vy"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              WebkitTapHighlightColor: "transparent",
              fontSize: {xs:"0.75rem",md:"0.85rem"},
              color:  '#ccc' ,
              textDecoration: "none",
              ":hover":  {
                textDecoration: "underline",
              }
            }}
          >
           Facebook
          </Link>
          <Link
            href="https://github.com/xian-vy"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              WebkitTapHighlightColor: "transparent",
              fontSize: {xs:"0.75rem",md:"0.85rem"},
              color:  '#ccc' ,
              textDecoration: "none",
              ":hover":  {
                textDecoration: "underline",
              }
            }}
          >
           Github
          </Link>

    </Stack>
    )
  }

  const AppDetails = () => {
    return (
      <Stack direction="column" alignItems="start" justifyContent="start"  maxWidth={300}>
           <Stack direction="row" justifyContent="center" alignItems="center" gap={0.5} mb={1.2} >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: "28px",
                    height: "28px",

                  }}
                  />
                <Typography sx={{color:  '#ccc' , mt:0.1,fontSize:"1rem",fontWeight:"600"}}>
                   VYFINANCE
                </Typography>
            </Stack>
            <Typography  sx={{color:  '#ccc' ,  fontSize: {xs:"0.8rem", sm:"0.85rem"}}}>
                    Free personal finance tracker, available offline and on the web, for all platforms.
            </Typography>
      </Stack>
    )
  }

  const Features = () => {
    return (
      <Stack direction="column" alignItems="start" justifyContent="start" gap={1}>
         <Typography  sx={{color:  '#ccc' , fontSize:{xs:"1rem",md:"1.2rem"},fontWeight:"600"}}>
          Features
        </Typography>
        {
          FEATURES.map((item, index) => (
            <Typography
              variant='body2'
              key={index}
              sx={{
                WebkitTapHighlightColor: "transparent",
                fontSize: {xs:"0.75rem",md:"0.85rem"},
                color:  '#ccc' ,
                textDecoration: "none",
              }}
            >
              {item}
            </Typography>
          ))
        }

      </Stack>
    )
  }

  return (
    <>
      <Stack direction="column" width="100%" my={5}  sx={{px:{xs:0,sm:3}}}>
        <Divider sx={{ mt: 1, mx: "auto", width: "100%" }} />
        
        <Stack py={5}  gap={{xs:3,sm:6}} px={{xs:3}} direction={{xs:"column",md:"row"}} justifyContent="space-between" alignItems="start" width="100%" maxWidth="lg" mx="auto" mt={2}>
            <AppDetails />
            <Stack direction={{xs:"column",md:"row"}} alignItems="start" gap={{xs:3,sm:6,md:8,lg:10}}>
                <About />
                <Features />
                <Socials />
            </Stack>
        </Stack>



        <Typography textAlign="center" sx={{ fontSize: { xs: "0.65rem", lg: "0.7rem", xl: "0.75rem" } , mt:5, color:  '#ccc' }}>
            {"© Vy Finance Tracker"} {new Date().getFullYear()}
         </Typography>
        
      </Stack>
      <Dialog
        open={openAbout}
        onClose={() => setOpenAbout(false)}
        PaperProps={{ 
          sx: { borderRadius: 0, background: darktheme ? "#111" : "#fff", height: "auto", width: 250,border : darktheme ? "1px solid #222" : "1px solid #333" },
        }}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0,  0,  0,  0.8)" },
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "end" }}>
          <Close onClick={() => setOpenAbout(false)} sx={{ cursor: "pointer", fontSize:14 }} />
        </DialogTitle>
        <DialogContent
          sx={{
            py: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <React.Suspense fallback={<div>Loading...</div>}>
            <AboutComponent />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={agreementDialog.open} maxWidth="md" fullWidth 
        PaperProps={{ 
          sx: { borderRadius: 0,  },
        }}>
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
