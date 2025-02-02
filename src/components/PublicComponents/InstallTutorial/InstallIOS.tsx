import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import { Box, Stack, Typography } from "@mui/material";
const InstallIOS = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        width: "100%",
        height: 500,
        bgcolor:  "#333" ,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} width="100%">
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <Stack
          direction="row"
          sx={{
            flexGrow: 1,
            height: 25,
            bgcolor: "#666",
            borderRadius: 3,
            alignItems: "center",
            px: 1.5,
          }}
        >
          <Typography variant="body1">vyfinancetracker.web.app/</Typography>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-around" alignItems="center" sx={{ width: "100%" }}>
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
        <IosShareOutlinedIcon />
        <Stack sx={{ width: 30, height: 25, bgcolor: "#666", borderRadius: 3 }}></Stack>
      </Stack>
    </Box>
  );
};

export default InstallIOS;
