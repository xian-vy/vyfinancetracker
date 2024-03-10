import { Box, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { formatShortAmountWithCurrency, hexToRGBA, useResponsiveCharLimit } from "../../helper/utils";
import { DASHBOARD_DIALOG } from "../../constants/size";
type groupedData = {
  category: string;
  amount: number;
  color: string;
  icon: React.ReactElement;
};

const TransactionOverviewBreakdown = ({ groupedData }: { groupedData: groupedData[] }) => {
  let aggregatedData = Object.values(groupedData).sort((a, b) => b.amount - a.amount);

  const maxAmount = Math.max(...aggregatedData.map((item) => item.amount));

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: "20px" } });
  }

  const [maxWidth, setMaxWidth] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateMaxWidth = () => {
      if (containerRef.current) {
        setMaxWidth(containerRef.current.offsetWidth * 0.65);
      }
    };

    window.addEventListener("resize", updateMaxWidth);

    // Initial update
    updateMaxWidth();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", updateMaxWidth);
    };
  }, []);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const charLimit = useResponsiveCharLimit();

  return (
    <>
      <Box ref={containerRef} width="100%" sx={{ height: "auto", minHeight: DASHBOARD_DIALOG, maxHeight: "auto" }}>
        <Box sx={{ px: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
          <Stack direction="column" alignItems="flex-start">
            {aggregatedData.map((item, index) => {
              return (
                <div key={index}>
                  <Stack direction="column" justifyContent="flex-start" marginBottom={0.5}>
                    <Stack direction="row" alignItems="center">
                      {/* Icon and Description ------------------------------------------------------------- */}
                      {item.icon && renderIcon(item.icon, isDarkMode ? item.color : item.color || "")}
                      <Stack direction="column">
                        <Typography variant="caption" ml={0.5} height={14}>
                          {item.category.length > charLimit
                            ? item.category.substring(0, charLimit) + ".."
                            : item.category}
                        </Typography>
                        {/* Amount and Progress ------------------------------------------------------------- */}
                        <Stack direction="row" alignItems="center" ml={0.5}>
                          <svg width={maxAmount === 0 ? "0" : `${(item.amount / maxAmount) * maxWidth}px`} height="10">
                            <rect
                              width="100%"
                              height="100%"
                              fill={hexToRGBA(item.color)}
                              stroke={isDarkMode ? "#1e1e1e" : item.color}
                              strokeWidth={isDarkMode ? 1 : 0.3}
                              rx={6}
                              ry={6}
                            />
                          </svg>
                          <Typography variant="caption" ml={0.5}>
                            {formatShortAmountWithCurrency(item.amount, false, true)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </div>
              );
            })}
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(TransactionOverviewBreakdown);
