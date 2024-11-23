import { Button, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setLocalHideBalances } from "../../localstorage/hidebalancesettings";
import { setHideBalances } from "../../redux/reducer/userAccountSlice";
import { RootState } from "../../redux/store";

const HideBalances = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const dispatch = useDispatch();

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
            border: `solid 1px ${!hideBalance ? "#d86c70" : "inherit"}`,
            color: !hideBalance ? "#d86c70" : "inherit",
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
            border: `solid 1px ${hideBalance ? "#d86c70" : "inherit"}`,
            color: hideBalance ? "#d86c70" : "inherit",
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
