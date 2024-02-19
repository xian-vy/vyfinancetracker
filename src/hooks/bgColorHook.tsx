import { useMediaQuery } from "@mui/material";
import { useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useBgColor = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const systemThemeIsDark = useMediaQuery("(prefers-color-scheme: dark)");
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  useLayoutEffect(() => {
    if (user) {
      // If the user has set a preference for dark mode, use it.
      // Otherwise, use the system's preferred color scheme.
      if (darktheme !== null) {
        document.body.style.backgroundColor = darktheme ? "#121212" : "#f6f7f9";
        document.body.style.color = darktheme ? "#ccc" : "#333";
      } else {
        // If the user hasn't set a preference, use the system's preferred color scheme.
        document.body.style.backgroundColor = systemThemeIsDark ? "#121212" : "#f6f7f9";
        document.body.style.color = systemThemeIsDark ? "#ccc" : "#333";
      }
    } else {
      //force dark mode on public routes
      document.body.style.backgroundColor = "#121212";
      document.body.style.color = "#ccc";
    }
  }, [darktheme, user, systemThemeIsDark]);
};
