import LocalMallIcon from "@mui/icons-material/LocalMall";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsIcon from "@mui/icons-material/Savings";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { formatShortAmountWithCurrency, hexToRGBA } from "../../helper/utils";
import { iconSizeSM } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import { EXPENSES_THEME, INCOME_THEME, SAVINGS_THEME_DARK } from "../../constants/componentTheme";

const BalanceBreakdown = ({
  networth,
}: {
  networth: { expenseSum: number; incomeSum: number; contributionSum: number };
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const data = [
    {
      type: txn_types.Income,
      amount: networth.incomeSum,
      color: INCOME_THEME,
      icon: <PaidIcon sx={{ fontSize: iconSizeSM, color: INCOME_THEME }} />,
    },
    {
      type: txn_types.Expenses,
      amount: networth.expenseSum,
      color: EXPENSES_THEME,
      icon: <LocalMallIcon sx={{ fontSize: iconSizeSM, color: EXPENSES_THEME }} />,
    },
    {
      type: txn_types.SavingsContribution,
      amount: networth.contributionSum,
      color: SAVINGS_THEME_DARK,
      icon: <SavingsIcon sx={{ fontSize: iconSizeSM, color: SAVINGS_THEME_DARK }} />,
    },
  ];

  const maxAmount = Math.max(networth.incomeSum, networth.expenseSum, networth.contributionSum);

  const [maxWidth, setMaxWidth] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateMaxWidth = () => {
      if (containerRef.current) {
        setMaxWidth(containerRef.current.offsetWidth * 0.7);
      }
    };

    window.addEventListener("resize", updateMaxWidth);

    updateMaxWidth();

    return () => {
      window.removeEventListener("resize", updateMaxWidth);
    };
  }, []);

  return (
    <>
      <Box ref={containerRef} overflow="hidden" sx={{ px: 1 }}>
        <Stack direction="column">
          {data.map((item, index) => {
            return (
              <div key={index}>
                <Stack direction="column" justifyContent="flex-start" marginBottom={1}>
                  {/* Icon and Description ------------------------------------------------------------- */}
                  <Stack direction="row" alignItems="center">
                    {item.icon}
                    <Stack direction="column">
                      <Typography variant="caption" ml={0.3} height={14}>
                        {item.type}
                      </Typography>

                      {/* Amount and Progress ------------------------------------------------------------- */}
                      <Stack direction="row" alignItems="center" height={12}>
                        <svg width={maxAmount === 0 ? "0" : `${(item.amount / maxAmount) * maxWidth}px`} height="8">
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
    </>
  );
};

export default BalanceBreakdown;
