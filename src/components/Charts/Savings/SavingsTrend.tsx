import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import { Container, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterAndGroupContributions, FilterAndGroupSavingsContribution } from "../../../helper/SavingsHelper";
import {
  ThemeColor,
  formatNumberWithoutCurrency,
  formatAmountForChart,
  getFilterTitle,
  hexToRGBA,
} from "../../../helper/utils";
import { TXN_TREND_CHART_HEIGHT, TXN_TREND_CHART_HEIGHT_LG, iconSizeXS } from "../../../constants/size";
import { txn_summary } from "../../../constants/collections";
import { yearFilters } from "../../../constants/timeframes";
import { getSavingsDetails, getSavingsIDByDescription } from "../../../firebase/utils";
import { useFilterHandlers } from "../../../hooks/filterHook";
import { RootState } from "../../../redux/store";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterIncomeSavingsTrend from "../../Filter/FilterIncomeSavingsTrend";
import { CHART_X_AXIS_STYLE, CHART_Y_AXIS_STYLE } from "../../../constants/style";

function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
}
const SavingsTrend = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers();

  const savings = useSelector((state: RootState) => state.savings.savings);
  const savingsContributions = useSelector((state: RootState) => state.savingsContribution.contribution);

  const filteredContributions = FilterAndGroupSavingsContribution(
    filterOption,
    savingsContributions,
    startDate || undefined,
    endDate || undefined,
    savings,
    true
  );

  const chartData = FilterAndGroupContributions(filteredContributions, savings, filterOption);
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const preferredFontSize = useSelector((state: RootState) => state.fontSize.size);
  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);

  const includeDateFilter = yearFilters.includes(filterOption);

  const totalAmount =
    chartData
      ?.flatMap((item) => item.SavingsItems)
      .reduce((acc: number, curr: { contributionTotal: number }) => acc + curr.contributionTotal, 0) || 0;

  return (
    <>
      <FilterIncomeSavingsTrend
        title="Savings"
        timeframe={formattedFilterOption}
        onFilterChange={handleFilterOptionChange}
        filterOption={filterOption}
        startDate={startDate}
        endDate={endDate}
        totalAmount={totalAmount}
        txnType={txn_summary.Savings}
      />

      <Container maxWidth={false} style={{ paddingLeft: 0, position: "relative" }}>
        <ResponsiveContainer width="100%" height={smScreen ? TXN_TREND_CHART_HEIGHT : TXN_TREND_CHART_HEIGHT_LG}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#333" : "#ccc"} vertical={false} />

            <YAxis
              stroke={ThemeColor(theme)}
              tickFormatter={(value) => formatAmountForChart(value)}
              style={CHART_Y_AXIS_STYLE(smScreen, preferredFontSize)}
              axisLine={false}
              tickLine={false}
              width={smScreen ? 30 : undefined}
            />

            <XAxis
              dataKey="date"
              stroke={ThemeColor(theme)}
              style={CHART_X_AXIS_STYLE(smScreen, preferredFontSize)}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  let formattedDate = label;
                  if (includeDateFilter) {
                    formattedDate = label + " " + formattedFilterOption;
                  }
                  return (
                    <Paper elevation={3} sx={{ padding: 2 }}>
                      <Typography color="text.primary" variant="h6" textAlign="left">{` ${formattedDate}`}</Typography>
                      {payload.map((item, index) => {
                        // Generate allSavingsItems for the current date
                        const allSavingsItems =
                          chartData.find((data) => data.date === label)?.SavingsItems.map((item) => item.description) ||
                          [];
                        // Ensure dataKey is a string and extract the savings item index
                        const matchResult = String(item.dataKey).match(/\[(\d+)\]/);
                        const savingsItemIndex = matchResult ? parseInt(matchResult[1]) : 0;

                        const savingsId = getSavingsIDByDescription(allSavingsItems[savingsItemIndex] || "", savings);

                        const { color, categoryIcon } = getSavingsDetails(savings, savingsId || "");

                        return (
                          <Stack direction="row" key={index} alignItems="center">
                            {renderIcon(categoryIcon?.icon || <DoNotDisturbAltIcon />, color || "")}
                            <Typography color="text.primary" textAlign="left" sx={{ ml: 0.5 }}>{`${
                              allSavingsItems[savingsItemIndex]
                            }: ${formatNumberWithoutCurrency(Number(item?.value))}`}</Typography>
                          </Stack>
                        );
                      })}
                    </Paper>
                  );
                }
                return null;
              }}
              cursor={{ fill: isDarkMode ? "#333" : "#ccc" }}
              isAnimationActive={powerSavingMode ? false : true}
            />
            {chartData
              .flatMap((item) => item.SavingsItems)
              .map((savingsItem, index) => (
                <Bar
                  key={index}
                  dataKey={`SavingsItems[${index}].contributionTotal`}
                  barSize={15}
                  maxBarSize={15}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={powerSavingMode ? false : true}
                >
                  {chartData.map((entry, entryIndex) => {
                    const color = entry.SavingsItems[index]?.color || "#ccc";
                    return (
                      <Cell
                        key={`cell-${entryIndex}`}
                        stroke={isDarkMode ? "#1e1e1e" : color}
                        fill={hexToRGBA(color)}
                      />
                    );
                  })}
                </Bar>
              ))}
          </BarChart>
        </ResponsiveContainer>

        <CustomMonthFilter isFormOpen={customMonthOpen} closeForm={handleCloseForm} onFormSubmit={handleMonthFilter} />
        <CustomYearFilter isFormOpen={customYearOpen} closeForm={handleCloseForm} onFormSubmit={handleYearFilter} />
      </Container>
    </>
  );
};

export default SavingsTrend;
