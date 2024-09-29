import { Box, Paper, useTheme } from "@mui/material";
import React from "react";
import ReportGridTable from "./ReportGridTable";
import TransactionLogs from "./TransactionLogs";
const ReportMainPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box pb={{ xs: 10, md: 5 }}>
      <Paper
        sx={{ borderRadius: 2, mb: { xs: 1, sm: 1.5, lg: 2 }, p: { xs: 1, sm: 0 } }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <TransactionLogs />
      </Paper>

      <Paper
        sx={{ borderRadius: 2, mb: { xs: 1, sm: 1.5, lg: 2 }, p: { xs: 1, sm: 0 } }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <ReportGridTable />
      </Paper>
    </Box>
  );
};

export default React.memo(ReportMainPage);
