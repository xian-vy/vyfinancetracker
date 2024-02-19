import { Grid, Paper, useTheme } from "@mui/material";
import React, { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import BudgetbyCategoryTrend from "../Charts/Budget/BudgetbyCategoryTrend";
import BudgetList from "./BudgetList";

const BudgetMainPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const location = useLocation();
  const { openForm } = location.state || {};

  const gridContainerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollIntoView();
    }
  }, []);
  return (
    <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }} ref={gridContainerRef}>
      <Grid item xs={12} lg={12}>
        <Paper
          elevation={isDarkMode ? 1 : 0}
          style={{ padding: 0 }}
          sx={{ borderRadius: 4 }}
          variant={isDarkMode ? "elevation" : "outlined"}
        >
          <BudgetbyCategoryTrend title="Budget" type="Budget" />
        </Paper>
      </Grid>
      <Grid item xs={12} lg={12}>
        <Paper sx={{ borderRadius: 4, minHeight: 600 }} variant={isDarkMode ? "elevation" : "outlined"}>
          <BudgetList URLopenForm={openForm} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default React.memo(BudgetMainPage);
