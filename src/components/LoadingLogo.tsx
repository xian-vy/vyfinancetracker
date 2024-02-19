import { Box, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import logoAnimate from "../Media/logoAnimate.svg";
import { RootState } from "../redux/store";

const LoadingLogo = ({ loadingLabel }: { loadingLabel: string }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        //no persistenceId means user is logged out, force dark mode/bg
        background: darkMode === true || darkMode === null ? "#121212" : "#f6f7f9",
        color: darkMode === true || darkMode === null ? "#ccc" : "#333",
        width: "100%",
      }}
    >
      <img src={logoAnimate} alt="Logo Animation" style={{ width: "40px", height: "40px", marginBottom: "10px" }} />
      <Typography variant="caption">{loadingLabel}</Typography>
    </Box>
  );
};

export default LoadingLogo;
