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
        <Header appInstalled={appInstalled} />

        <Stack direction="column" pb={4}>
          <FeaturesIMG />
          <Features />
        </Stack>

        <Stack direction="row" width="100%">
          <Footer />
        </Stack>

        {SnackbarComponent}
      </Box>
  );
}
