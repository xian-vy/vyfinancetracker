import { Button, Stack, useTheme } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setHideBalances } from "../../redux/reducer/userAccountSlice";
import { setLocalHideBalances } from "../../localstorage/hidebalancesettings";

const HideBalances = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const hideBalance = useSelector((state: RootState) => state.userAccount.hideBalances);

  const toggle = (newMode: boolean) => {
    if (newMode !== hideBalance) {
      setLocalHideBalances(newMode);
      dispatch(setHideBalances(newMode));
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
            border: `solid 1px ${!hideBalance ? theme.palette.primary.main : "inherit"}`,
            color: !hideBalance ? theme.palette.primary.main : "inherit",
            textTransform: "none",
            borderRadius: 2,
          }}
          onClick={() => toggle(false)}
        >
          off
        </Button>

        <Button
          sx={{
            minWidth: "40%",
            height: "100%",
            border: `solid 1px ${hideBalance ? theme.palette.primary.main : "inherit"}`,
            color: hideBalance ? theme.palette.primary.main : "inherit",
            textTransform: "none",
            borderRadius: 2,
            py: 0.3,
          }}
          onClick={() => toggle(true)}
        >
          on
        </Button>
      </Stack>
    </div>
  );
};

export default HideBalances;
