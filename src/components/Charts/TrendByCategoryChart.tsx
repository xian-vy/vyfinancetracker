import { Box, CircularProgress, Container, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatShortAmountWithCurrency, hexToRGBA } from "../../helper/utils";
import { TXN_TREND_CHART_HEIGHT, TXN_TREND_CHART_HEIGHT_LG } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import { RootState } from "../../redux/store";
import TrendByCategoryTooltip from "./TrendByCategoryTooltip";
import { CHART_X_AXIS_STYLE, CHART_Y_AXIS_STYLE } from "../../constants/style";
interface filteredChartData {
  date: string;
  categories: {
    category: string | undefined;
    total: number;
    color: string;
  }[];
}
const TrendByCategoryChart = ({
  filteredChartData,
  allCategories,
  formattedFilterOption,
  type,
  includeDateFilter,
}: {
  filteredChartData: filteredChartData[] | undefined;
  allCategories: (string | undefined)[];
  formattedFilterOption: string;
  includeDateFilter: boolean;
  type: txn_types.Income | txn_types.Expenses | txn_types.Budget;
}) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const preferredFontSize = useSelector((state: RootState) => state.fontSize.size);

  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filteredChartData) {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [formattedFilterOption]);

  return (
    <Container maxWidth={false} style={{ paddingLeft: 0, position: "relative" }}>
      <ResponsiveContainer width="100%" height={smScreen ? TXN_TREND_CHART_HEIGHT : TXN_TREND_CHART_HEIGHT_LG}>
        {loading || !filteredChartData ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
          </Box>
        ) : (
          <BarChart data={filteredChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#333" : "#e0e1e3 "} vertical={false} />

            <XAxis
              dataKey="date"
              stroke={isDarkMode ? "#ccc" : "#666"}
              style={CHART_X_AXIS_STYLE(smScreen, preferredFontSize)}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke={isDarkMode ? "#ccc" : "#666"}
              tickFormatter={(value) => formatShortAmountWithCurrency(value, false, true)}
              style={CHART_Y_AXIS_STYLE(smScreen, preferredFontSize)}
              axisLine={false}
              tickLine={false}
              width={smScreen ? 35 : undefined}
            />

            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  return (
                    <TrendByCategoryTooltip
                      payload={payload}
                      includeDateFilter={includeDateFilter}
                      type={type}
                      filteredChartData={filteredChartData}
                      formattedFilterOption={formattedFilterOption}
                    />
                  );
                }
                return null;
              }}
              cursor={{ fill: isDarkMode ? "#333" : "#ccc" }}
              wrapperStyle={{ zIndex: 9999 }}
              isAnimationActive={powerSavingMode ? false : true}
            />

            {allCategories.map((categoryData, index) => (
              <Bar
                isAnimationActive={powerSavingMode ? false : true}
                key={index}
                dataKey={`categories[${index}].total`}
                barSize={15}
                maxBarSize={20}
                radius={[4, 4, 0, 0]}
                strokeWidth={isDarkMode ? 1 : 0.3}
              >
                {filteredChartData.map((entry, entryIndex) => {
                  const color = entry.categories[index]?.color || "#ccc";
                  return (
                    <Cell key={`cell-${entryIndex}`} stroke={isDarkMode ? "#1e1e1e" : color} fill={hexToRGBA(color)} />
                  );
                })}
              </Bar>
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </Container>
  );
};

export default React.memo(TrendByCategoryChart);
