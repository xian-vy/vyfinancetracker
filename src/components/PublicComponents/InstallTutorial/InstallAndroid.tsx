import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import HomeIcon from "@mui/icons-material/Home";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import StopIcon from "@mui/icons-material/Stop";
import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
const InstallAndroid = () => {
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        minWidth: 260,
        height: 500,
        bgcolor: darktheme ? "#333" : "#ddd",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} width="100%">
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack
          direction="row"
          sx={{
            flexGrow: 1,
            height: 25,
            bgcolor: darktheme ? "#666" : "#ccc",
            borderRadius: 3,
            alignItems: "center",
            px: 1.5,
          }}
        >
          <Typography variant="body1">vyfinancetracker.web.app/</Typography>
        </Stack>

        <MoreVertOutlinedIcon />
      </Stack>

      <Stack direction="row" justifyContent="space-around" alignItems="center" sx={{ width: "100%" }}>
        <StopIcon />
        <HomeIcon />
        <ArrowBackIos fontSize="small" />
      </Stack>
    </Box>
  );
};

export default InstallAndroid;
