import { CssBaseline, ThemeProvider } from "@mui/material";
import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { darkTheme } from "../Theme";
import { DASHBOARD_PATH } from "../constants/routes";
import { RootState } from "../redux/store";
interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </>
  );
};

export default PublicRoute;
