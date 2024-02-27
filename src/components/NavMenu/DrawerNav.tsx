import {
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import { iconSizeSM } from "../../constants/size";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PrivacyAndTerms from "./PrivacyAndTerms";
import { Link, Location, useLocation } from "react-router-dom";

const AccountIcon = React.lazy(() => import("./AccountIcon"));
type MenuItemsType = {
  key: string;
  path: string;
  icon: JSX.Element;
  text: string;
};
type Props = {
  menuItems: MenuItemsType[];
  toggleDrawer: () => void;
  drawerSize: number;
  isLoading: boolean;
  collapsedDrawer: boolean;
  toggleDrawerCollapse: () => void;
  drawerOpen: boolean;
  handleSetting: () => void;
  handleAbout: () => void;
};

const DrawerNav = ({
  menuItems,
  toggleDrawer,
  drawerSize,
  isLoading,
  collapsedDrawer,
  toggleDrawerCollapse,
  drawerOpen,
  handleSetting,
  handleAbout,
}: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const location = useLocation();

  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isXSScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const drawerStyles = React.useMemo(
    () => ({
      "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        height: { xs: "auto", sm: "100vh" },
        width: { xs: "96%", sm: drawerSize },
        pb: { xs: 1.5, md: 0 },
        mx: { xs: "auto", md: 0 },
        borderTopLeftRadius: { xs: 10, sm: 0 },
        borderTopRightRadius: { xs: 10, sm: 0 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: isDarkMode ? "#1e1e1e" : "#fff",
        borderRight: isDarkMode ? "none" : `solid 1px ${theme.palette.divider}`,
      },
    }),
    [isMdScreen, isDarkMode, drawerSize]
  );

  const drawer = React.useMemo(
    () => (
      <div>
        <React.Suspense
          fallback={
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
              sx={{ width: "100%", py: 1.5, px: 1 }}
            >
              <Stack direction="row" alignItems="center">
                <Skeleton variant="circular" height={34} width={34} sx={{ mr: 1 }} />
                <Skeleton variant="text" height={16} width={120} />
              </Stack>
              <Skeleton variant="circular" height={16} width={16} />
            </Stack>
          }
        >
          <AccountIcon isLoading={isLoading} collapsedDrawer={collapsedDrawer} />
        </React.Suspense>
        {menuItems.map((item) => (
          <List key={item.key} sx={{ mx: collapsedDrawer ? 1 : 3, height: "26px", pt: 0, mt: 1 }}>
            <ListItem disablePadding sx={{ minWidth: collapsedDrawer ? "40px" : "auto" }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  backgroundColor: location.pathname === item.path ? (isDarkMode ? "#333" : "#eaeaea") : "",
                  py: 0.4,
                  borderRadius: 4,
                  display: "flex",
                  justifyContent: "center",
                  px: collapsedDrawer ? 0.5 : 2,
                }}
                disabled={isLoading}
                onClick={(event) => {
                  if (item.key === "Settings") {
                    event.preventDefault();
                    handleSetting();
                  } else if (item.key === "About") {
                    event.preventDefault();
                    handleAbout();
                  } else if (!isMdScreen) {
                    toggleDrawer();
                  }
                }}
              >
                {isLoading ? (
                  <Skeleton variant="circular" height={20} width={25} sx={{ mr: collapsedDrawer ? 0 : 1 }} />
                ) : (
                  <ListItemIcon
                    style={{
                      minWidth: collapsedDrawer ? "20px" : "35px",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                )}
                {isLoading && !collapsedDrawer ? (
                  <Skeleton variant="text" width="100%" />
                ) : (
                  !collapsedDrawer && <ListItemText primary={item.text} />
                )}
              </ListItemButton>
            </ListItem>
          </List>
        ))}
      </div>
    ),
    [isLoading, location, isDarkMode, collapsedDrawer]
  );
  return (
    <div>
      <Drawer
        variant={isMdScreen ? "permanent" : "temporary"}
        sx={drawerStyles}
        open={drawerOpen}
        onClose={toggleDrawer}
        anchor={isXSScreen ? "bottom" : "left"}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <div>{drawer}</div>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: "center", md: collapsedDrawer ? "center" : "space-between" }}
          mt={2}
          mb={1}
          px={2}
        >
          {/* Privacy TNC -----------------------------------------------------------------------*/}
          {!collapsedDrawer && <PrivacyAndTerms />}
          {/* Collapse Icons -----------------------------------------------------------------------*/}
          {isMdScreen && (
            <Stack direction="row">
              {collapsedDrawer ? (
                <IconButton onClick={toggleDrawerCollapse}>
                  <ArrowForwardIcon sx={{ fontSize: iconSizeSM }} />
                </IconButton>
              ) : (
                <IconButton onClick={toggleDrawerCollapse}>
                  <ArrowBackIcon sx={{ fontSize: iconSizeSM }} />
                </IconButton>
              )}
            </Stack>
          )}
        </Stack>
      </Drawer>
    </div>
  );
};

export default React.memo(DrawerNav);
