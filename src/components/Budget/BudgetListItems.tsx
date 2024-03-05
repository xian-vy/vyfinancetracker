import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import { Card, CircularProgress, Grid, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { formatShortAmountWithCurrency, hexToRGBA, useResponsiveCharLimit } from "../../helper/utils";
import { iconSizeSM } from "../../constants/size";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { getCategoryDetails } from "../../firebase/utils";

export function BudgetListItems({
  categoryId,
  totalExpenseAmount,
  totalBudgetAmount,
}: {
  categoryId: string;
  totalExpenseAmount: number;
  totalBudgetAmount: number;
}) {
  const { categories } = useCategoryContext();

  const { color, categoryIcon, description } = getCategoryDetails(categories, categoryId);

  const percentageSpent = (expense: number, budget: number) => {
    if (isNaN(expense) || isNaN(budget) || budget <= 0) {
      return 0;
    }
    const calculatedPercentage = (expense / budget) * 100;
    // Cap the percentage at 100%
    return Math.min(calculatedPercentage, 100);
  };

  const charLimit = useResponsiveCharLimit();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeSM } });
  }
  const remainingBalance = Math.round(totalBudgetAmount - totalExpenseAmount);
  return (
    <Grid item xs={12} sm={6} lg={4} xl={3}>
      <Card
        sx={{
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          px: 2,
          py: 2,
        }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        {/* icon, CATEGORY NAME ,Budget/Variance ------------------------------------------------------------*/}

        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row">
            {renderIcon(categoryIcon?.icon || <DoNotDisturbAltIcon />, color || "")}
            <Stack direction="column">
              <Typography align="left" variant="body1" pl={1}>
                {description && description.length > charLimit
                  ? description.substring(0, charLimit) + "."
                  : description}
              </Typography>
              <Typography align="left" variant="caption" pl={1}>
                Budget:{" "}
                <span style={{ fontSize: "0.75rem" }}>
                  {formatShortAmountWithCurrency(Math.round(totalBudgetAmount), false, true)}
                </span>
              </Typography>
              <Typography align="left" variant="caption" pl={1}>
                Remaining:{" "}
                <span style={{ fontSize: "0.75rem", color: remainingBalance < 0 ? "salmon" : "inherit" }}>
                  {formatShortAmountWithCurrency(remainingBalance, false, true)}
                </span>
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="column" alignItems="center" justifyContent="center" sx={{ position: "relative" }}>
            {/* PROGRESS BAR --------------------------------------------------------------------------*/}
            <CircularProgress
              size={80}
              variant="determinate"
              value={100}
              style={{
                color: isDarkMode ? "#333" : hexToRGBA(color || "#ccc"),
              }}
              thickness={6}
            />

            <CircularProgress
              thickness={6}
              size={80}
              variant="determinate"
              value={percentageSpent(totalExpenseAmount, totalBudgetAmount)}
              style={{
                color: isDarkMode ? hexToRGBA(color || "#ccc") : color || "#ccc",
                position: "absolute",
                stroke: color,
                strokeWidth: 2,
              }}
            />

            {/* Amount Spent-------------- -----------------------------------------------------------*/}

            <Stack direction="column" alignItems="center" position="absolute">
              <Typography variant="h6">{formatShortAmountWithCurrency(totalExpenseAmount, false, true)}</Typography>
              <Typography
                style={{
                  fontSize: "0.7rem",
                }}
                variant="subtitle2"
              >
                Spent
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );
}
