import { Box, CircularProgress, ThemeProvider, useMediaQuery } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { darkTheme, lightTheme } from "./Theme";
import ConnectionStatus from "./components/ConnectionStatus";
import AccountActivityBackdrop from "./components/AccountActivityBackdrop";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingLogo from "./components/LoadingLogo";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import PublicRoute from "./components/PublicRoute";
import { DASHBOARD_PATH, routes } from "./constants/routes";
import { useAuthState } from "./hooks/authStateHook";
import { useBgColor } from "./hooks/bgColorHook";
import { setIsDeleting, setSuccessDeleteMessage } from "./redux/reducer/userAccountSlice";
import { RootState } from "./redux/store";
const SeedPhraseMain = React.lazy(() => import("./encryption/SeedPhraseMain"));

function getFallbackComponent(path: string) {
  // switch (path) {
  //   case DASHBOARD_PATH:
  //     return <DashboardSkeleton />;

  //   default:
      return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress size={15} />
        </Box>
      );
  // }
}

function App() {
  const dispatch = useDispatch();
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const systemThemeIsDark = useMediaQuery("(prefers-color-scheme: dark)");

  //custom hook to prevent flash of incorrect bgColor when reloading,like white screen on dark mode
  useBgColor();

  //auth and initial data setup
  const { isauthenticating, loadingState, openSeedPhrase, setOpenSeedPhrase } = useAuthState();

  if (isauthenticating) {
    console.log("Authenticating");
    return <LoadingLogo loadingLabel={loadingState} />;
  }

  return (
    <div className="App">
      <ConnectionStatus />
      <AccountActivityBackdrop />
      <Router>
        <ErrorBoundary>
          <Routes>
            {routes.map((route) => {
              const RouteElement = (
                <React.Suspense fallback={getFallbackComponent(route.path)}>{route.element}</React.Suspense>
              );

              if (route.isPrivate) {
                return (
                  <Route key={route.path} path={route.path} element={<ProtectedRoute />}>
                    <Route index element={RouteElement} />
                  </Route>
                );
              } else if (route.isPublic) {
                return <Route key={route.path} path={route.path} element={<PublicRoute>{RouteElement}</PublicRoute>} />;
              } else {
                return <Route key={route.path} path={route.path} element={RouteElement} />;
              }
            })}
          </Routes>
        </ErrorBoundary>
      </Router>
      <ThemeProvider
        theme={darktheme === null ? (systemThemeIsDark ? darkTheme : lightTheme) : darktheme ? darkTheme : lightTheme}
      >
        <React.Suspense
          fallback={
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
              Loading...
            </Box>
          }
        >
          <SeedPhraseMain
            onKeyStored={() => {
              setOpenSeedPhrase({ open: false, hasSalt: null });
              window.location.href = DASHBOARD_PATH;
            }}
            onDeleteAccount={() => {
              setOpenSeedPhrase({ open: false, hasSalt: null });
              dispatch(setSuccessDeleteMessage("Account has been deleted successfully."));
              dispatch(setIsDeleting(false));
            }}
            open={openSeedPhrase.open}
            salt={openSeedPhrase.hasSalt}
          />
        </React.Suspense>
      </ThemeProvider>
    </div>
  );
}

export default React.memo(App);
