import { Box, CircularProgress, Container, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { txn_types } from "../../constants/collections";
import { TXN_TREND_CHART_HEIGHT, TXN_TREND_CHART_HEIGHT_LG } from "../../constants/size";
import { CHART_X_AXIS_STYLE, CHART_Y_AXIS_STYLE } from "../../constants/style";
import { formatAmountForChart, hexToRGBA } from "../../helper/utils";
import { RootState } from "../../redux/store";
import TrendByCategoryTooltip from "./TrendByCategoryTooltip";

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
  type: txn_types.Income | txn_types.Expenses | txn_types.Budget | txn_types.Savings;
}) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const preferredFontSize = useSelector((state: RootState) => state.fontSize.size);

  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";
  const [loading, setLoading] = useState(false);
  const isStacked = useSelector((state: RootState) => state.trendChart.stacked);

  // Transform data to sort categories within each date when stacked
  const processedData = useMemo(() => {
    if (!filteredChartData || !isStacked) {
      return filteredChartData;
    }

    // For each date entry, sort categories by amount (largest first for bottom placement)
    return filteredChartData.map(dateEntry => ({
      ...dateEntry,
      categories: [...dateEntry.categories].sort((a, b) => b.total - a.total)
    }));
  }, [filteredChartData, isStacked]);

  // Get unique categories from the processed data to determine how many bars to render
  const uniqueCategories = useMemo(() => {
    if (!processedData) return [];
    
    const categorySet = new Set<string>();
    processedData.forEach(entry => {
      entry.categories.forEach((cat, index) => {
        if (cat.category) {
          categorySet.add(`${cat.category}-${index}`);
        }
      });
    });
    
    // Return indices for the maximum number of categories in any date
    const maxCategories = Math.max(...processedData.map(entry => entry.categories.length));
    return Array.from({ length: maxCategories }, (_, i) => i);
  }, [processedData]);

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
        {loading || !processedData ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
          </Box>
        ) : (
          <BarChart data={processedData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
              tickFormatter={(value) => formatAmountForChart(value)}
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
                      filteredChartData={processedData}
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

            {uniqueCategories.map((categoryIndex) => (
              <Bar
                isAnimationActive={powerSavingMode ? false : true}
                key={`category-${categoryIndex}`}
                dataKey={`categories[${categoryIndex}].total`}
                stackId={isStacked ? "categories" : undefined}
                barSize={isStacked ? smScreen ? 20 : 25 : 15}
                maxBarSize={isStacked ? smScreen ? 20 : 25 : 20}
                strokeWidth={isDarkMode ? 1 : 0.3}
                radius={isStacked ? undefined : [4, 4, 0, 0]}
              >
                {processedData.map((entry, entryIndex) => {
                  const color = entry.categories[categoryIndex]?.color || "#ccc";
                  return (
                    <Cell 
                      key={`cell-${entryIndex}-${categoryIndex}`} 
                      stroke={isDarkMode ? "#1e1e1e" : color} 
                      fill={hexToRGBA(color)} 
                    />
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