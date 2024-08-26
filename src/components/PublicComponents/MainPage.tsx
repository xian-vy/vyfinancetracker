import { Box, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useSnackbarHook from "../../hooks/snackbarHook";
import { setSuccessDeleteMessage } from "../../redux/reducer/userAccountSlice";
import { RootState } from "../../redux/store";
import Features from "./Features";
import FeaturesIMG from "./FeaturesIMG";
import Footer from "./Footer";
import Header from "./Header";
import SimpleThemeToggle from "./SimpleThemeToggle";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export default function MainPage() {
  const [appInstalled, setAppInstalled] = useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const dispatch = useDispatch();
  const accntDeleted = useSelector((state: RootState) => state.userAccount.deleteMessage);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

  useEffect(() => {
    if (window.navigator.standalone) {
      setAppInstalled(true);
      console.log("App is running in standalone mode. IOS");
    } else if (window.matchMedia("(display-mode: standalone)").matches) {
      setAppInstalled(true);
      console.log("App is running in standalone mode. ANDROID/DESKTOP CHROME");
    }
  }, []);

  useEffect(() => {
    if (accntDeleted) {
      openSuccessSnackbar(accntDeleted);
      dispatch(setSuccessDeleteMessage(undefined));
    }
  }, [accntDeleted]);

  return (
    <Stack
      sx={{
        background: `linear-gradient(to bottom, ${darktheme ? "#000" : "#e1e1e1"} 50%, transparent 50%)`,
        height: { xs: 600, sm: 700, lg: 800 },
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
        py={2}
      >
        <SimpleThemeToggle />
        <Stack direction="row" justifyContent="center">
          <Header appInstalled={appInstalled} />
        </Stack>
        <Stack direction="column">
          <FeaturesIMG />
          <Features />
        </Stack>

        <Stack direction="row" width="100%">
          <Footer />
        </Stack>

        {SnackbarComponent}
      </Box>
    </Stack>
  );
}
