import { Button, Stack, useTheme } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFontSize } from "../../localstorage/fontsettings";
import { RootState } from "../../redux/store";
import { toggleFontSize } from "../../redux/reducer/fontSizeSlice";

const FontSizeToggle = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const fontSize = useSelector((state: RootState) => state.fontSize.size);

  const handleToggleFontSize = (newMode: string) => {
    if (newMode !== fontSize) {
      setFontSize(newMode);
      dispatch(toggleFontSize(newMode));
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
            border: `solid 1px ${fontSize === "sm" ? theme.palette.primary.main : "inherit"}`,
            color: fontSize === "sm" ? theme.palette.primary.main : "inherit",
            textTransform: "none",
            borderRadius: 2,
          }}
          onClick={() => handleToggleFontSize("sm")}
        >
          sm
        </Button>

        <Button
          sx={{
            minWidth: "40%",
            height: "100%",
            border: `solid 1px ${fontSize === "md" ? theme.palette.primary.main : "inherit"}`,
            color: fontSize === "md" ? theme.palette.primary.main : "inherit",
            textTransform: "none",
            borderRadius: 2,
          }}
          onClick={() => handleToggleFontSize("md")}
        >
          md
        </Button>
      </Stack>
    </div>
  );
};

export default FontSizeToggle;
