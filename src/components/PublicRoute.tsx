import { CssBaseline, ThemeProvider } from "@mui/material";
import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { darkTheme, lightTheme } from "../Theme";
import { DASHBOARD_PATH } from "../constants/routes";
import { RootState } from "../redux/store";
interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);

  if (user) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  return (
    <>
      <ThemeProvider theme={darktheme ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </>
  );
};

export default PublicRoute;
