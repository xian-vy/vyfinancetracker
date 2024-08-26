import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { darkTheme, darkThemeLGfont, lightTheme, lightThemeLGfont } from "../Theme";
import { HOME } from "../constants/routes";
import { drawerWidth } from "../constants/size";
import { RootState } from "../redux/store";
import NavigationMain from "./NavMenu/NavigationMain";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = HOME }) => {
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const preferredFontSize = useSelector((state: RootState) => state.fontSize.size);

  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return (
    <ThemeProvider
      theme={
        preferredFontSize !== "md"
          ? darktheme
            ? darkTheme
            : lightTheme
          : darktheme
          ? darkThemeLGfont
          : lightThemeLGfont
      }
    >
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CssBaseline />
        <NavigationMain />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 1, sm: 2, xl: 4 },
            py: { xs: 2, sm: 2, xl: 4 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};
