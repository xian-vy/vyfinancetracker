import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const InstallWindows = () => {
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        minWidth: { md: 750, lg: 1000, xl: 1200 },
        height: 400,
        bgcolor: darktheme ? "#333" : "#ddd",
        borderRadius: 4,
        p: 2,
      }}
    >
      <Stack direction="row" justifyContent="flex-start" spacing={1}>
        <Stack sx={{ width: 160, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 160, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
      </Stack>
      <Stack direction="row" justifyContent="flex-start" spacing={1} width="100%" mt={1.5}>
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack
          direction="row"
          sx={{
            width: "100%",
            height: 25,
            bgcolor: darktheme ? "#666" : "#ccc",
            borderRadius: 3,
            justifyContent: "space-between",
            alignItems: "center",
            px: 1.5,
          }}
        >
          <Typography variant="body2">https://vyfinancetracker.web.app/</Typography>
          <InstallDesktopIcon fontSize="small" />
        </Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: darktheme ? "#666" : "#ccc", borderRadius: 3 }}></Stack>
      </Stack>
    </Box>
  );
};

export default InstallWindows;
