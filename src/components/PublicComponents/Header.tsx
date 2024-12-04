import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, Button, Container, Dialog, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SIGN_IN_PATH } from "../../constants/routes";
import useSnackbarHook from "../../hooks/snackbarHook";
import logo from "../../media/vylogonew.png";
import { RootState } from "../../redux/store";
import Navigation from "./Navigation";

interface ChoiceResult {
  outcome: "accepted" | "dismissed";
  platform: string;
}
const InstallTutorial = React.lazy(() => import("./InstallTutorial/InstallTutorial"));

const Header = ({ appInstalled }: { appInstalled: boolean }) => {
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

  const navigate = useNavigate();
  const [openTutorial, setOpenTutorial] = useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const handleStartClick = () => {
    navigate(SIGN_IN_PATH);
  };
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const onAppInstalled = () => {
      setTimeout(() => {
        setDeferredPrompt(null);
        openSuccessSnackbar("App installation initiated.");
      }, 2000);
    };

    window.addEventListener("appinstalled", onAppInstalled);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeinstallprompt", setDeferredPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (appInstalled) {
      openSuccessSnackbar("The App is already installed", true);
      return;
    }
    if (deferredPrompt) {
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: ChoiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        setDeferredPrompt(null);
      });
    } else {
      setOpenTutorial(true);
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" width="100%">
       
        <Navigation />
     
        <Container disableGutters maxWidth="md" component="main" sx={{ pb: 0.5, px: 4, my: 2 }}>

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            my={{ xs: 2, sm: 3, md: 4 }}
            gap={1}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "28px",
                height: "28px",

              }}
              />
           <Typography
           variant="body2"
            component="h1"
            align="center"
            sx={{
              color: darktheme ? "#ccc" : "#444",
              fontWeight:600
            }}
          >
            VY FINANCE TRACKER
          </Typography>
          </Stack>
          <Typography
            component="h2"
            align="center"
            sx={{
              fontSize: { xs: "1.4rem", sm: "2rem", md: "2.5rem", xl: "3rem" },
              lineHeight: { xs: "1.5rem", sm: "2.1rem", md: "2.8rem", xl: "3.2rem"  },
              fontWeight: 600,
              color: darktheme ? "#ccc" : "#444",
              my: 1,
            }}
          >
            Manage finances   in one app,
          </Typography>
          <Typography
            component="h2"
            align="center"
            sx={{
              fontSize: { xs: "1.4rem", sm: "2rem", md: "2.5rem", xl: "3rem" },
              lineHeight: { xs: "1.5rem", sm: "2.1rem", md: "2.8rem", xl: "3.2rem"  },
              fontWeight: 600,
              color: darktheme ? "#ccc" : "#444",
              mt: 1,
              mb:1.5
            }}
          >
          for all devices
          </Typography>
          <Typography
            component="h3"
            align="center"
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              fontWeight: 400,
              color: darktheme ? "#bbb" : "#444",
              ml: 1,
            }}
          >
                Available offline and one the web
          </Typography>
        </Container>

        <Stack direction="row" mt={1} alignItems="center">
          <Box display="flex" justifyContent="center">
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              sx={{
                textTransform: "capitalize",
                width: { xs: 145, md: 160 },
                fontSize: { xs: "0.75rem", lg: "0.8rem" },
                border: darktheme ? "solid 1px #2a2a2a" : "solid 1px #ccc",
                py: 0.7,
              }}
              onClick={handleStartClick}
            >
              Start Now
            </Button>
          </Box>

          <Typography mx={{ xs: 1, md: 1.5 }} variant="caption">
            or
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              sx={{
                display: "flex",
                width: { xs: 145, md: 160 },
                alignItems: "center",
                py: 0.7,
                textTransform: "capitalize",
                fontSize: { xs: "0.75rem", lg: "0.8rem" },
                border: darktheme ? "solid 1px #2a2a2a" : "solid 1px #ccc",
              }}
              onClick={handleInstallClick}
            >
              Install
              <FileDownloadOutlinedIcon fontSize="small" sx={{ mx: 0.5 }} />
            </Button>
          </Box>
        </Stack>
      </Box>
      <Dialog
        open={openTutorial}
        onClose={() => {
          setOpenTutorial(false);
        }}
        PaperProps={{
          sx: { borderRadius: 2, mx: 2,width:"100%" },
        }}
        maxWidth="lg"
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0,  0,  0,  0.8)" },
          },
        }}
      >
        <React.Suspense fallback={<div>loading...</div>}>
          <InstallTutorial onDialogClose={() => setOpenTutorial(false)} />
        </React.Suspense>
      </Dialog>
      {SnackbarComponent}
    </>
  );
};

export default Header;
