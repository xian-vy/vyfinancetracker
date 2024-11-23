import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LineAxisOutlinedIcon from "@mui/icons-material/LineAxisOutlined";
import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { ThemeColor } from "../../helper/utils";
import { iconSize, iconSizeSM, iconSizeXS } from "../../constants/size";
import CustomIconButton from "../CustomIconButton";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
interface Props {
  title: string;
  timeframe: string;
  onfilterClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const FilterTitleAndIcon = (props: Props) => {
  const theme = useTheme();
  const systemFontSize = useSelector((state: RootState) => state.fontSize.size);

  let icon: React.ReactElement | null = null;
  if (props.title === "Account Balances") {
    icon = <AccountBalanceOutlinedIcon sx={{ mr: 0.5, fontSize: systemFontSize === "sm" ?   iconSizeXS : iconSizeSM }} />;
  } else if (props.title === "Overview") {
    icon = <QueryStatsOutlinedIcon sx={{ mr: 0.5, fontSize: systemFontSize === "sm" ?   iconSizeXS : iconSizeSM }} />;
  } else if (props.title.includes("Trends")) {
    icon = <LineAxisOutlinedIcon sx={{ mr: 0.5, fontSize: systemFontSize === "sm" ?   iconSizeXS : iconSizeSM }} />;
  }
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
          <Typography variant="body1">{props.title}</Typography>
        </div>

        <CustomIconButton onClick={props.onfilterClick} type="filter">
          <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
            {props.timeframe}
          </Typography>
          <ExpandMoreIcon fontSize={iconSize} />
        </CustomIconButton>
      </Box>
    </>
  );
};

export default React.memo(FilterTitleAndIcon);
