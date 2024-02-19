import { Backdrop, Box, CircularProgress, CssBaseline, ThemeProvider, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { darkTheme, lightTheme, darkThemeLGfont, lightThemeLGfont } from "../Theme";
import { drawerWidth } from "../constants/Sizes";
import { HOME } from "../constants/routes";
import { RootState } from "../redux/store";
import NavMenu from "./NavMenu/NavMenu";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = HOME }) => {
  const deviceTheme = useMediaQuery("(prefers-color-scheme: dark)");
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const preferredFontSize = useSelector((state: RootState) => state.fontSize.size);
  const isDeleting = useSelector((state: RootState) => state.deleteAccount.isDeleting);

  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return (
    <ThemeProvider
      theme={
        preferredFontSize !== "md"
          ? darktheme === null
            ? deviceTheme
              ? darkTheme
              : lightTheme
            : darktheme
            ? darkTheme
            : lightTheme
          : darktheme === null
          ? deviceTheme
            ? darkThemeLGfont
            : lightThemeLGfont
          : darktheme
          ? darkThemeLGfont
          : lightThemeLGfont
      }
    >
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Backdrop open={isDeleting} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" size={30} />
          <Typography variant="body2" color="inherit" ml={2}>
            Deleting account...
          </Typography>
        </Backdrop>
        <CssBaseline />
        <NavMenu />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
            py: { xs: 2, sm: 3, md: 4 },
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
