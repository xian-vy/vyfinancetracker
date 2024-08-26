import { useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useBgColor = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  useLayoutEffect(() => {
    if (user) {
      if (darktheme) {
        document.body.style.backgroundColor = "#121212";
        document.body.style.color = "#333";
      } else {
        document.body.style.backgroundColor = "#f6f7f9";
        document.body.style.color = "#333";
      }
    }
  }, [darktheme, user]);
};
