import { Add as AddIcon } from "@mui/icons-material";
import BalanceIcon from "@mui/icons-material/Balance";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Dialog, DialogContent, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ThemeColor, formatShortAmountWithCurrency } from "../../helper/utils";
import { iconSize, iconSizeXS } from "../../constants/size";
import { RootState } from "../../redux/store";
import CustomIconButton from "../CustomIconButton";

export default function BudgetListHeader({
  selectedTimeframe,
  openBudgetForm,
  handleFilterClick,
  totalBudget,
  totalExpense,
  filterDate,
}: {
  selectedTimeframe: string;
  openBudgetForm: () => void;
  handleFilterClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  totalBudget: number;
  totalExpense: number;
  filterDate: string;
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const percentageSpent = (expense: number, budget: number) => {
    if (isNaN(expense) || isNaN(budget) || budget <= 0) {
      return 0;
    }
    const calculatedPercentage = (expense / budget) * 100;
    // Cap the percentage at 100%
    return Math.min(calculatedPercentage, 100);
  };

  const totalRemaining = totalBudget - totalExpense;
  const formattedBudget = formatShortAmountWithCurrency(totalBudget, false, true);
  const formattedExpense = formatShortAmountWithCurrency(totalExpense, false, true);

  const formattedRemaining = formatShortAmountWithCurrency(totalRemaining, false, true);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pr: { xs: 0, sm: 1, md: 2 } }}>
      {/** Progress Bar---------- --------------------------------------------------------------*/}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ minWidth: { xs: 130, sm: 160 }, maxWidth: "auto", ml: { xs: 0, sm: 2 } }}
      >
        <Stack
          sx={{
            position: "relative",
            flexGrow: 1,
            mx: 0.5,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
          onClick={handleClick}
        >
          <LinearProgress
            variant="determinate"
            value={percentageSpent(totalExpense, totalBudget)}
            style={{
              height: 26,
              background: isDarkMode ? "#1e1e1e" : "#fff",
              borderRadius: "8px",
              border: `solid 1px ${isDarkMode ? "#333" : "#ccc"}`,
            }}
            sx={{
              "& .MuiLinearProgress-bar": {
                background: isDarkMode ? "#333" : "#eaeaea",
              },
            }}
          />

          <Stack
            direction="row"
            alignItems="center"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography
              sx={{
                color: totalExpense > totalBudget ? "salmon" : isDarkMode ? "#ccc" : "#333",
                fontWeight: "bold",
              }}
              variant="caption"
            >
              {formattedExpense}
            </Typography>
            <Typography mx={0.5}>{" / "}</Typography>

            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {formattedBudget}
            </Typography>
            <BalanceIcon sx={{ fontSize: iconSizeXS, ml: 1 }} />
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="center">
        <CustomIconButton onClick={handleFilterClick} type="filter">
          <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
            {selectedTimeframe}
          </Typography>
          <ExpandMoreIcon fontSize={iconSize} />
        </CustomIconButton>

        <CustomIconButton onClick={openBudgetForm} type="add" style={{ marginLeft: 1 }}>
          <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
            {"Add / Edit"}
          </Typography>
          <AddIcon sx={{ fontSize: iconSizeXS }} />
        </CustomIconButton>
      </Stack>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 2, margin: { xs: 0, sm: 1, md: 2 } },
          background: isDarkMode ? "#1e1e1e" : "#fff",
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 1, sm: 2 }, background: isDarkMode ? "#1e1e1e" : "#fff" }}>
          <Stack direction="column" p={1} sx={{ minWidth: 200 }}>
            <Typography textAlign="center" variant="body2" mb={2}>
              {filterDate} {" Budget"}
            </Typography>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Total Expenses</Typography>
              <Typography variant="body2">{formattedExpense}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Total Budget</Typography>
              <Typography variant="body2">{formattedBudget}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Total Remaining</Typography>
              <Typography variant="body2" sx={{ color: totalRemaining < 0 ? "salmon" : "inherit" }}>
                {formattedRemaining}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
