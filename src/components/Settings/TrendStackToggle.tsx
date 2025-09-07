import { Button, Stack } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setStackedTrendChart } from "../../redux/reducer/trendChartSlice";
import { setTrendChartStacked } from "../../localstorage/trendchartsettings";
import { RootState } from "../../redux/store";

const TrendStackToggle = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const dispatch = useDispatch();
  const isStacked = useSelector((state: RootState) => state.trendChart.stacked);

  const setMode = (newMode: boolean) => {
    if (newMode !== isStacked) {
      setTrendChartStacked(newMode);
      dispatch(setStackedTrendChart(newMode));
    }
  };

  return (
    <div>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: "inherit",
          borderRadius: 2,
          width: 150,
          height: 25,
          overflow: "hidden",
          border: isDarkMode ? `1px solid #333` : `1px solid #e6e6e6`,
          px: 1,
          py: 0.4,
        }}
      >
        <Button
          sx={{
            minWidth: "40%",
            height: "100%",
            border: `solid 1px ${!isStacked ? "#d86c70" : "inherit"}`,
            color: !isStacked ? "#d86c70" : "inherit",
            textTransform: "none",
            borderRadius: 2,
          }}
          onClick={() => setMode(false)}
        >
          group
        </Button>
        <Button
          sx={{
            minWidth: "40%",
            height: "100%",
            border: `solid 1px ${isStacked ? "#d86c70" : "inherit"}`,
            color: isStacked ? "#d86c70" : "inherit",
            textTransform: "none",
            borderRadius: 2,
          }}
          onClick={() => setMode(true)}
        >
          stack
        </Button>
      </Stack>
    </div>
  );
};

export default TrendStackToggle;


