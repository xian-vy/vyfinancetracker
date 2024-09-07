import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, Button, Container, Dialog, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SIGN_IN_PATH } from "../../constants/routes";
import useSnackbarHook from "../../hooks/snackbarHook";
import { RootState } from "../../redux/store";
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
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Container disableGutters maxWidth="sm" component="main" sx={{ pb: 0.5, px: 4 }}>
          <Typography
            component="h1"
            align="center"
            sx={{
              fontSize: { xs: "1.6rem", md: "1.8rem" },
              lineHeight: { xs: "2rem", md: "2rem" },
              fontWeight: 500,
              color: darktheme ? "#ccc" : "#333",
            }}
          >
            Vy Finance Tracker
          </Typography>
          <Typography
            component="h2"
            align="center"
            sx={{
              fontSize: "0.85rem",
              fontWeight: 400,
            }}
          >
            Expense, Budget, Income and Savings Tracker
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
                width: 130,

                fontSize: { xs: "0.7rem", lg: "0.75rem" },
                border: darktheme ? "solid 1px #2a2a2a" : "solid 1px #ccc",
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
                width: 130,
                alignItems: "center",

                textTransform: "capitalize",
                fontSize: { xs: "0.7rem", lg: "0.75rem" },
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
          sx: { borderRadius: 4, mx: 0 },
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
