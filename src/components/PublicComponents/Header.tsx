import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, Button, Container, Dialog, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Media/logo.svg";
import androidIcon from "../../Media/platforms/android.png";
import iosIcon from "../../Media/platforms/apple.png";
import windowsIcon from "../../Media/platforms/windows.png";
import { SIGN_IN_PATH } from "../../constants/routes";
import useSnackbarHook from "../../hooks/snackbarHook";
interface ChoiceResult {
  outcome: "accepted" | "dismissed";
  platform: string;
}
const InstallTutorial = React.lazy(() => import("./InstallTutorial/InstallTutorial"));

const Header = ({ appInstalled }: { appInstalled: boolean }) => {
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
  const [currentIcon, setCurrentIcon] = useState(androidIcon);

  useEffect(() => {
    const icons = [androidIcon, iosIcon, windowsIcon];
    let currentIconIndex = 0;

    const interval = window.setInterval(() => {
      currentIconIndex = (currentIconIndex + 1) % icons.length;
      setCurrentIcon(icons[currentIconIndex]);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [androidIcon, iosIcon, windowsIcon]);
  return (
    <>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ pb: 1 }}>
        <Container disableGutters maxWidth="sm" component="main" sx={{ pb: 0.5, px: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="center">
            <img src={logo} alt="Logo" style={{ width: "30px", height: "30px" }} />
            <Typography component="h2" align="center" ml={0.5} sx={{ fontSize: "1.1rem" }}>
              Finance Tracker
            </Typography>
          </Stack>
          <Typography component="h3" align="center" sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
            Expense and income tracker, budget planner in one app
          </Typography>
        </Container>

        <Stack direction="row" mt={1} alignItems="center">
          <Box display="flex" justifyContent="center">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ textTransform: "capitalize", width: 100 }}
              onClick={handleStartClick}
            >
              Start Now
            </Button>
          </Box>

          <Typography mx={{ xs: 1, md: 1.5 }} variant="caption">
            Or
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ display: "flex", width: 100, alignItems: "center", textTransform: "capitalize" }}
              onClick={handleInstallClick}
            >
              Install
              <FileDownloadOutlinedIcon fontSize="small" sx={{ mx: 0.5 }} />
              <img
                src={currentIcon}
                alt={currentIcon}
                style={{ width: 16, height: 16, animation: "slideInOut 2s linear infinite" }}
              />
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
          sx: { borderRadius: 4 },
        }}
        maxWidth="xl"
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
