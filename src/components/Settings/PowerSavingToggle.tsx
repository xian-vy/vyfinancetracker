import { Button, Stack, useTheme } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPowerSavingMode } from "../../localstorage/powersavingsettings";
import { togglePowerSavingMode } from "../../redux/reducer/powerSavingSlice";
import { RootState } from "../../redux/store";

const PowerSavingToggle = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const togglePowerSaving = (newMode: boolean) => {
    if (newMode !== powerSavingMode) {
      setPowerSavingMode(newMode);
      dispatch(togglePowerSavingMode(newMode));
    }
  };
  return (
    <div>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: "inherit",
          borderRadius: 2,
          width: 150,
          height: 25,
          overflow: "hidden",
          border: isDarkMode ? `1px solid #333` : `1px solid #e6e6e6`,
          px: 1,
          py: 0.4,
        }}
      >
        <Button
          sx={{
            minWidth: "40%",
            height: "100%",
            border: `solid 1px ${!powerSavingMode ? theme.palette.primary.main : "inherit"}`,
            color: !powerSavingMode ? theme.palette.primary.main : "inherit",
            textTransform: "none",
            borderRadius: 2,
          }}
          onClick={() => togglePowerSaving(false)}
        >
          off
        </Button>

        <Button
          sx={{
            minWidth: "40%",
            height: "100%",
            border: `solid 1px ${powerSavingMode ? theme.palette.primary.main : "inherit"}`,
            color: powerSavingMode ? theme.palette.primary.main : "inherit",
            textTransform: "none",
            borderRadius: 2,
          }}
          onClick={() => togglePowerSaving(true)}
        >
          on
        </Button>
      </Stack>
    </div>
  );
};

export default PowerSavingToggle;
