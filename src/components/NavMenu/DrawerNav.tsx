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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PrivacyAndTerms from "./PrivacyAndTerms";
import { Link, useLocation } from "react-router-dom";

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

  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isXSScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const drawerStyles = React.useMemo(
    () => ({
      "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        height: { xs: "auto", sm: "96vh" },
        width: { xs: "96%", sm: drawerSize },
        py: { xs: 1.5, md: 1 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: isDarkMode ? "#1e1e1e" : "#fff",
        border: isDarkMode ? "none" : `solid 1px ${theme.palette.divider}`,
        px:1,
        position: "fixed",
        zIndex: 999,
        top: "2vh",
        left: "2vh",
        borderRadius: "10px",
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
              sx={{ width: "100%", py: 1.5, px: 1, display:"flex", justifyContent:"center"}}
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
          <List key={item.key} sx={{ mx: collapsedDrawer ? 1 : 3, height: "34px", pt: 0, mt: 0.5 }}>
            <ListItem disablePadding sx={{ minWidth: collapsedDrawer ? "25px" : "auto", }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  border:
                    location.pathname === item.path
                      ? isDarkMode
                        ? "1px solid #333"
                        : "1px solid #ccc"
                      : "solid 1px transparent",
                  py: 0.5,
                  borderRadius: 2,
                  px: collapsedDrawer ? 0.5 : 2,
                  width:"100%",
                  '& .MuiListItemIcon-root': {
                      display:"flex",flexDirection:"row",justifyContent:"center" 
                  }
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
                      minWidth: collapsedDrawer ? "28px" : "45px"
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
        transitionDuration={0}
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
