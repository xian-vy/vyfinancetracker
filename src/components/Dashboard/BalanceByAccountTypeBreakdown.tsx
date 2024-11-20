import LocalMallIcon from "@mui/icons-material/LocalMall";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsIcon from "@mui/icons-material/Savings";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { formatShortAmountWithCurrency, hexToRGBA } from "../../helper/utils";
import { iconSizeSM } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import { DEBT_THEME, EXPENSES_THEME, INCOME_THEME, SAVINGS_THEME_DARK } from "../../constants/componentTheme";
import PriceChangeIcon from '@mui/icons-material/PriceChange';

interface Props {
  networth: { expense: number; income: number; savings: number , debts : number};
}
const BalanceByAccountTypeBreakdown = ({ networth }: Props) => {
  const breakdown = [
    {
      type: txn_types.Income,
      amount: networth.income,
      color: INCOME_THEME,
      icon: <PaidIcon sx={{ fontSize: iconSizeSM, color: INCOME_THEME }} />,
    },
    {
      type: txn_types.Expenses,
      amount: networth.expense,
      color: EXPENSES_THEME,
      icon: <LocalMallIcon sx={{ fontSize: iconSizeSM, color: EXPENSES_THEME }} />,
    },
    {
      type: txn_types.Savings,
      amount: networth.savings,
      color: SAVINGS_THEME_DARK,
      icon: <SavingsIcon sx={{ fontSize: iconSizeSM, color: SAVINGS_THEME_DARK }} />,
    },
    {
      type: txn_types.Debt,
      amount: Math.abs(networth.debts),
      color: DEBT_THEME,
      icon: <PriceChangeIcon sx={{ fontSize: iconSizeSM, color: DEBT_THEME }} />,
    },
  ];

  const maxAmount = Math.max(networth.income, networth.expense, networth.savings, networth.debts);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = React.useState(0);

  React.useEffect(() => {
    const updateMaxWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxWidth = containerWidth - 70; 
        setMaxWidth(maxWidth);
      }
    };

    window.addEventListener("resize", updateMaxWidth);

    updateMaxWidth();

    return () => {
      window.removeEventListener("resize", updateMaxWidth);
    };
  }, []);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Box ref={containerRef} overflow="hidden" sx={{ px: 0, display: "flex", justifyContent: "flex-start" }}>
      <Stack direction="column">
        {breakdown.map((item, index) => (
          <div key={index}>
            <Stack direction="column" justifyContent="flex-start" marginBottom={1}>
              <Stack direction="row" alignItems="center" gap={0.5}>
                {item.icon}
                <Stack direction="column">
                  <Typography variant="caption" ml={0.3} height={15}>
                    {item.type}
                  </Typography>

                  <Stack direction="row" alignItems="center" height={15}>
                    <svg width={maxAmount === 0 ? "0" : `${(item.amount / maxAmount) * maxWidth}px`} height="10">
                      <rect
                        width="100%"
                        height="100%"
                        fill={hexToRGBA(item.color)}
                        stroke={isDarkMode ? "#1e1e1e" : item.color}
                        strokeWidth={isDarkMode ? 1 : 0.3}
                        rx={4}
                        ry={4}
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
        ))}
      </Stack>
    </Box>
  );
};

export default React.memo(BalanceByAccountTypeBreakdown);
