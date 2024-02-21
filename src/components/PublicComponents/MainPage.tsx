import { Box, Stack } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
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
  const [isOverflowing, setIsOverflowing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const checkOverflow = () => {
      if (boxRef.current) {
        const element = boxRef.current;
        setIsOverflowing(element.scrollHeight > window.innerHeight);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);
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
      ref={boxRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: isOverflowing ? "auto" : "100vh",
      }}
      py={!isOverflowing ? 0 : { xs: 5, md: 4, lg: 6, xl: 8 }}
    >
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
  );
}
