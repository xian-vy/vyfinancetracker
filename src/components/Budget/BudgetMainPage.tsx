import { Grid, Paper, useMediaQuery, useTheme } from "@mui/material";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import BudgetbyCategoryTrend from "../Charts/Budget/BudgetbyCategoryTrend";
import BudgetList from "./BudgetList";
import { FilterTimeframe } from "../../constants/timeframes";
import { TABLE_HEIGHT, TABLE_HEIGHT_XL } from "../../constants/size";

const BudgetMainPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const location = useLocation();
  const { openForm } = location.state || {};
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(FilterTimeframe.Year);
  const xlScreen = useMediaQuery(theme.breakpoints.up("xl"));

  const handleDateFilterChange = (selectedTimeframe: FilterTimeframe, startDate?: Date, endDate?: Date) => {
    if (startDate && endDate) {
      setStartDate(startDate);
      setEndDate(endDate);
    }
    setSelectedTimeframe(selectedTimeframe);
  };

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
          sx={{ borderRadius: 2 }}
          variant={isDarkMode ? "elevation" : "outlined"}
        >
          <BudgetbyCategoryTrend title="Budget" onDateFilterChange={handleDateFilterChange} />
        </Paper>
      </Grid>
      <Grid item xs={12} lg={12}>
        <Paper sx={{ borderRadius: 2, minHeight: { xs: 500, md : 360, lg:400, xl:565} }} variant={isDarkMode ? "elevation" : "outlined"}>
          <BudgetList
            URLopenForm={openForm}
            startDate={startDate}
            endDate={endDate}
            selectedTimeframe={selectedTimeframe}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default React.memo(BudgetMainPage);
