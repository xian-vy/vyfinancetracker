import { Box, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { iconSize, iconSizeXS } from "../../constants/size";
import { ThemeColor } from "../../helper/utils";
import CustomIconButton from "../CustomIconButton";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SwapVert from "@mui/icons-material/SwapVert";
interface Props {
  onfilterClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSwapClick: () => void;
  timeframe: string;
}
const BalanceByAccountTypeHeader = (props: Props) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Stack direction="row" justifyContent="center" alignItems="center">
        <AccountBalanceOutlinedIcon sx={{ mr: 0.5, fontSize: iconSizeXS }} />
        <Typography variant="body1">Account Balances</Typography>
      </Stack>

      <Stack direction="row" justifyContent="center" alignItems="center">
        <CustomIconButton onClick={props.onSwapClick} type="filter">
          <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
            Swap
          </Typography>
          <SwapVert fontSize={iconSize} />
        </CustomIconButton>
        <CustomIconButton onClick={props.onfilterClick} type="filter">
          <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
            {props.timeframe}
          </Typography>
          <ExpandMoreIcon fontSize={iconSize} />
        </CustomIconButton>
      </Stack>
    </Box>
  );
};

export default BalanceByAccountTypeHeader;
