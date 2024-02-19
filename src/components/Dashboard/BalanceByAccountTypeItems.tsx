import LocalMallIcon from "@mui/icons-material/LocalMall";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsIcon from "@mui/icons-material/Savings";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { formatShortAmountWithCurrency, hexToRGBA } from "../../Helper/utils";
import { iconSizeSM } from "../../constants/Sizes";
import { txn_types } from "../../constants/collections";
import { EXPENSES_THEME, INCOME_THEME, SAVINGS_THEME_DARK } from "../../constants/componentTheme";

interface AccountDetails {
  balance: number;
  income: number;
  expense: number;
  savings: number;
  color: string;
  icon: string;
}
interface Props {
  accountDetails: AccountDetails;
}
const BalanceByAccountTypeItems = ({ accountDetails }: Props) => {
  const breakdown = [
    {
      type: txn_types.Income,
      amount: accountDetails.income,
      color: INCOME_THEME,
      icon: <PaidIcon sx={{ fontSize: iconSizeSM, color: INCOME_THEME }} />,
    },
    {
      type: txn_types.Expenses,
      amount: accountDetails.expense,
      color: EXPENSES_THEME,
      icon: <LocalMallIcon sx={{ fontSize: iconSizeSM, color: EXPENSES_THEME }} />,
    },
    {
      type: txn_types.Savings,
      amount: accountDetails.savings,
      color: SAVINGS_THEME_DARK,
      icon: <SavingsIcon sx={{ fontSize: iconSizeSM, color: SAVINGS_THEME_DARK }} />,
    },
  ];

  const maxAmount = Math.max(accountDetails.income, accountDetails.expense, accountDetails.savings);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = React.useState(0);

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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Box ref={containerRef} overflow="hidden" sx={{ px: 1 }}>
      <Stack direction="column">
        {breakdown.map((item, index) => (
          <div key={index}>
            <Stack direction="column" justifyContent="flex-start" marginBottom={1}>
              <Stack direction="row" alignItems="center">
                {item.icon}
                <Stack direction="column">
                  <Typography variant="caption" ml={0.3} height={14}>
                    {item.type}
                  </Typography>

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
        ))}
      </Stack>
    </Box>
  );
};

export default React.memo(BalanceByAccountTypeItems);
