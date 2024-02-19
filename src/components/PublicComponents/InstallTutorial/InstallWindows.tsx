import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";

const InstallWindows = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        minWidth: { md: 750, lg: 1000, xl: 1200 },
        height: 400,
        bgcolor: "#333",
        borderRadius: 4,
        p: 2,
      }}
    >
      <Stack direction="row" justifyContent="flex-start" spacing={1}>
        <Stack sx={{ width: 160, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 160, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
      </Stack>
      <Stack direction="row" justifyContent="flex-start" spacing={1} width="100%" mt={1.5}>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack
          direction="row"
          sx={{
            width: "100%",
            height: 25,
            bgcolor: "#666",
            borderRadius: 3,
            justifyContent: "space-between",
            alignItems: "center",
            px: 1.5,
          }}
        >
          <Typography variant="body2">https://vyfinancetracker.web.app/</Typography>
          <InstallDesktopIcon fontSize="small" />
        </Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
      </Stack>
    </Box>
  );
};

export default InstallWindows;
