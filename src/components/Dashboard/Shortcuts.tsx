import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ShortcutOutlinedIcon from "@mui/icons-material/ShortcutOutlined";
import { Breadcrumbs, IconButton, Link, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";
import { iconSizeSM, iconSizeXS } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import Shortcutitems from "./Shortcutitems";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
const types = [txn_types.Expenses, txn_types.Savings, txn_types.Income];

const Shortcuts = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(txn_types.Expenses);
  const systemFontSize = useSelector((state: RootState) => state.fontSize.size);

  const theme = useTheme();

  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Stack direction="row" justifyContent="center" flexWrap="wrap" px={{ xs: 0, sm: 2 }}>
        <Stack direction="row" alignItems="center" flexGrow={1}>
          <Stack direction="row" alignItems="center">
            <ShortcutOutlinedIcon sx={{ fontSize: systemFontSize === "sm" ? iconSizeXS : iconSizeSM }} />
            <Typography variant="body1" sx={{ ml: 0.5 }}>
              Shortcuts
            </Typography>
          </Stack>
          <IconButton onClick={() => setDialogOpen(true)}>
            <AddCircleOutlineIcon sx={{ fontSize: iconSizeXS }} />
          </IconButton>
        </Stack>

        <Stack direction="row">
          <Breadcrumbs aria-label="breadcrumb" sx={{ margin: "auto" }}>
            {types.map((type, index) => (
              <Link
                color="inherit"
                component="p"
                variant={smScreen ? "caption" : "body1"}
                sx={{
                  cursor: "pointer",
                  textDecoration: type === selectedType ? "underline" : "none",
                  color: type === selectedType ? theme.palette.primary.main : "inherit",
                  WebkitTapHighlightColor: "transparent",
                }}
                key={index}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Link>
            ))}
          </Breadcrumbs>
        </Stack>
      </Stack>
      <Shortcutitems type={selectedType} dialogOpen={dialogOpen} onDialogClose={() => setDialogOpen(false)} />
    </>
  );
};

export default React.memo(Shortcuts);
