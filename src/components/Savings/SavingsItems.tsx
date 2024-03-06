import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import {
  Box,
  CardContent,
  Collapse,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { TimestamptoDate } from "../../helper/date";
import { ThemeColor, formatShortAmountWithCurrency, hexToRGBA, toTitleCase } from "../../helper/utils";
import SavingsIcons from "../../media/SavingsIcons";
import SavingGoalsModel from "../../models/SavingGoalsModel";
import { iconSizeSM } from "../../constants/size";
import { useActionPopover } from "../../hooks/actionHook";
import { ACTION_TYPES } from "../../constants/constants";

export function SavingsItems({
  savings,
  onActionSelect,
}: {
  savings: SavingGoalsModel;
  onActionSelect: (action: string, savings: SavingGoalsModel) => void;
}) {
  const [expandedSavingsId, setExpandedSavingsId] = useState<string | null>(null);

  const percentageSpent = (expense: number, budget: number) => {
    if (isNaN(expense) || isNaN(budget) || budget <= 0) {
      return 0;
    }
    const calculatedPercentage = (expense / budget) * 100;
    // Cap the percentage at 100%
    return Math.min(calculatedPercentage, 100);
  };

  const handleExpandClick = (id: string) => {
    setExpandedSavingsId(expandedSavingsId === id ? null : id);
  };
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const iconObject = SavingsIcons.find((icon) => icon.name === savings.icon);
  const color = savings.color;

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeSM } });
  }

  const handleAction = (action: string, savings: SavingGoalsModel) => {
    onActionSelect(action, savings);
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [ACTION_TYPES.AddContribution, ACTION_TYPES.Edit, ACTION_TYPES.Delete],
    handleAction,
  });
  return (
    <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={savings.id}>
      {ActionPopover}
      <Paper
        sx={{
          borderRadius: 4,
        }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <Stack
          direction="column"
          sx={{
            px: 2,
            py: 1,
          }}
        >
          {/** Savings Name /More Icon -----------------------------------------------------------------*/}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack alignItems="center" direction="row" width="85%">
              {iconObject && renderIcon(iconObject.icon, savings.color)}
              <Tooltip title={savings.description}>
                <Typography align="left" variant="h6" ml={0.5} noWrap>
                  {toTitleCase(savings.description)}
                </Typography>
              </Tooltip>
            </Stack>

            <IconButton onClick={(event) => handleActionOpen(event, savings)} sx={{ mr: -1 }}>
              <MoreHorizOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack direction="row" alignItems="center">
            {/** Current/Goal Amount---------- --------------------------------------------------------------*/}
            <Stack direction="row">
              <Typography mr={0.5} variant="h6" sx={{ fontSize: "0.75rem" }}>
                {formatShortAmountWithCurrency(savings.currentAmount, false, true)}
              </Typography>
              /
              <Typography mx={0.5} variant="h6" sx={{ fontSize: "0.75rem" }}>
                {formatShortAmountWithCurrency(savings.targetAmount, false, true)}
              </Typography>
            </Stack>
            {/** Progress Bar---------- --------------------------------------------------------------*/}
            <Stack
              sx={{
                position: "relative",
                flexGrow: 1,
                mx: 0.5,
              }}
            >
              <Tooltip title={formatShortAmountWithCurrency(savings.currentAmount, false, true)}>
                <LinearProgress
                  variant="determinate"
                  value={percentageSpent(savings.currentAmount, savings.targetAmount)}
                  style={{
                    height: "14px",
                    background: isDarkMode ? "#333" : hexToRGBA(color),
                    borderRadius: "4px",
                  }}
                  sx={{
                    "& .MuiLinearProgress-bar": {
                      background: isDarkMode ? hexToRGBA(color) : color,
                    },
                  }}
                />
              </Tooltip>
              <Typography
                color="textSecondary"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "0.66rem",
                  color: ThemeColor(theme),
                }}
                variant="h6"
              >
                {percentageSpent(savings.currentAmount, savings.targetAmount).toFixed(2) + "%"}
              </Typography>
            </Stack>
          </Stack>

          {/** Start Date---------- -----------------------------------------------------------------*/}
          <Stack direction="row" alignItems="center" justifyContent="space-between" pr={1}>
            <Typography variant="body1">Start Date</Typography>
            <Typography ml={1} variant="body1">
              {TimestamptoDate(savings.startDate, "MMM dd, yyyy")}
            </Typography>
          </Stack>
          {/** Target Date---------- -----------------------------------------------------------------*/}
          <Stack direction="row" alignItems="center" justifyContent="space-between" pr={1}>
            <Typography variant="body1">Target Date</Typography>
            <Typography ml={1} variant="body1">
              {TimestamptoDate(savings.endDate, "MMM dd, yyyy")}
            </Typography>
          </Stack>

          {/** EXPAND MORE ----------------------------------------------------------------------------*/}
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <IconButton
              onClick={() => handleExpandClick(savings.id)}
              sx={{
                mr: -1,
              }}
            >
              <ExpandMoreIcon
                style={{
                  transform: expandedSavingsId === savings.id ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s",
                }}
              />
            </IconButton>
          </Stack>
        </Stack>
        <Collapse in={expandedSavingsId === savings.id}>
          <CardContent
            sx={{
              py: 1,
              px: 1,
            }}
          >
            {/** NOTE----------------------------------------------------------------------------*/}

            <Divider>
              <Typography variant="body1">Notes</Typography>
            </Divider>

            <Typography textAlign="left" variant="body1">
              {savings.notes}
            </Typography>
          </CardContent>
        </Collapse>
      </Paper>
    </Grid>
  );
}
