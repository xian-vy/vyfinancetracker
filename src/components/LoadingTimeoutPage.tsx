import { Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import { DASHBOARD_PATH } from "../constants/routes";

const LoadingTimeoutPage = () => {
  return (
    <Stack direction="column" justifyContent="center" alignItems="center" height="100vh">
      <Typography variant="body2">The loading took too long that expected, please</Typography>
      <Button onClick={() => (window.location.href = DASHBOARD_PATH)}>Try Again</Button>
    </Stack>
  );
};

export default LoadingTimeoutPage;
