import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link as MUILink,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { drawerWidth, drawerWidthCollapse, iconSizeSM, iconSizeXS } from "../../constants/Sizes";
import {
  BUDGET_PATH,
  DASHBOARD_PATH,
  EXPENSE_PATH,
  INCOME_PATH,
  MAINTENANCE_PATH,
  REPORTS_PATH,
  SAVINGS_PATH,
} from "../../constants/routes";
import { useSliceFetchingStates } from "../../hooks/slicefetchingHook";
import { RootState } from "../../redux/store";
import SettingsForm from "../Settings/SettingsForm";
const TermsAndConditions = React.lazy(() => import("../legal/TermsAndConditions/TermsAndConditionsV1"));
const PrivacyPolicy = React.lazy(() => import("../legal/PrivacyPolicy/PrivacyPolicyV1"));
const About = React.lazy(() => import("../PublicComponents/About"));
const AccountIcon = React.lazy(() => import("./AccountIcon"));

const menuItems = [
  {
    key: "Dashboard",
    path: DASHBOARD_PATH,
    icon: <DashboardOutlinedIcon sx={{ fontSize: iconSizeXS }} />,
    text: "Dashboard",
  },
  {
    key: "Expenses",
    path: EXPENSE_PATH,
    icon: <ShoppingBagOutlinedIcon sx={{ fontSize: iconSizeXS }} />,
    text: "Expenses",
  },
  {
    key: "Budget",
    path: BUDGET_PATH,
    icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: iconSizeXS }} />,
    text: "Budget",
  },
  { key: "Income", path: INCOME_PATH, icon: <PaidOutlinedIcon sx={{ fontSize: iconSizeXS }} />, text: "Income" },
  {
    key: "Saving Goals",
    path: SAVINGS_PATH,
    icon: <SavingsOutlinedIcon sx={{ fontSize: iconSizeXS }} />,
    text: "Saving Goals",
  },
  {
    key: "Maintenance",
    path: MAINTENANCE_PATH,
    icon: <ListAltOutlinedIcon sx={{ fontSize: iconSizeXS }} />,
    text: "Categories",
  },
  { key: "Reports", path: REPORTS_PATH, icon: <PrintOutlinedIcon sx={{ fontSize: iconSizeXS }} />, text: "Reports" },
  { key: "Settings", path: "Settings", icon: <SettingsOutlinedIcon sx={{ fontSize: iconSizeXS }} />, text: "Settings" },
  { key: "About", path: "About", icon: <InfoOutlinedIcon sx={{ fontSize: iconSizeXS }} />, text: "About" },
];

const NavMenu = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isLgScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const isXSScreen = useMediaQuery(theme.breakpoints.down("sm"));
  // const isSMScreen = useMediaQuery(theme.breakpoints.down("md"));
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTNC, setOpenTNC] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [drawerSize, setDrawerSize] = useState(isMdScreen && isLgScreen ? drawerWidthCollapse : drawerWidth);
  const [collapsedDrawer, setCollapsedDrawer] = useState(false);
  // const [showBottomNav, setShowBottomNav] = useState(false);
  useEffect(() => {
    if (drawerSize === drawerWidthCollapse) {
      setCollapsedDrawer(true);
    } else {
      setCollapsedDrawer(false);
    }
  }, [drawerSize]);

  const handleDrawerResize = () => {
    setDrawerSize((prevDrawerSize) => (prevDrawerSize === drawerWidth ? drawerWidthCollapse : drawerWidth));
  };
  const handleDrawerToggle = () => {
    setMobileOpen((prevMobileOpen) => !prevMobileOpen);
  };

  const handleSetting = () => {
    setSettingsOpen((prevSettingsOpen) => {
      return true;
    });
  };
  const { isLoading, timeoutError } = useSliceFetchingStates();

  useEffect(() => {
    if (timeoutError) {
      console.log("fetch timeout");
      window.location.href = DASHBOARD_PATH;
    }
  }, [timeoutError]);

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
                    handleDrawerToggle();
                    handleSetting();
                  } else if (item.key === "About") {
                    event.preventDefault();
                    handleDrawerToggle();
                    setOpenAbout(true);
                  } else if (!isMdScreen) {
                    handleDrawerToggle();
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

  return (
    <div>
      {/* {isSMScreen && <ScrollDetector setShowBottomNav={setShowBottomNav} isSMscreen={isSMScreen} />} */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerSize },
          flexShrink: { md: 0 },
        }}
      >
        {/* <Slide direction="up" in={showBottomNav} mountOnEnter unmountOnExit> */}
        <BottomNavigation
          value={location.pathname}
          sx={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            display: { xs: "flex", md: "none" },
            borderTop: `solid 1px ${theme.palette.divider}`,
            zIndex: 999,
            p: 1,
            justifyContent: "center",
          }}
          showLabels
        >
          {menuItems.slice(0, isXSScreen ? 4 : 5).map((item) => (
            <BottomNavigationAction
              key={item.key}
              label={<Typography variant="caption">{item.text}</Typography>}
              value={item.path}
              icon={item.icon}
              component={Link}
              to={item.path}
              sx={{
                minWidth: 0,
                flexGrow: 1,
              }}
              disableRipple={true}
              disableTouchRipple={true}
            />
          ))}

          <BottomNavigationAction
            label={<Typography variant="caption">More</Typography>}
            icon={<MoreHorizIcon fontSize="small" />}
            onClick={handleDrawerToggle}
            sx={{
              minWidth: 0,
              flexGrow: 1,
            }}
            disableRipple={true}
            disableTouchRipple={true}
          />
        </BottomNavigation>
        {/* </Slide> */}
        <Drawer
          variant={isMdScreen ? "permanent" : "temporary"}
          sx={drawerStyles}
          open={mobileOpen}
          onClose={handleDrawerToggle}
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
            {!collapsedDrawer && (
              <Stack direction="row">
                <MUILink
                  mx={0.5}
                  onClick={() => {
                    setOpenPrivacy(true);
                    setOpenTNC(false);
                  }}
                  component="p"
                  color="inherit"
                  sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
                >
                  Privacy
                </MUILink>
                <MUILink
                  mx={0.5}
                  onClick={() => {
                    setOpenPrivacy(false);
                    setOpenTNC(true);
                  }}
                  component="p"
                  color="inherit"
                  sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
                >
                  Terms
                </MUILink>
              </Stack>
            )}
            {/* Collapse Icons -----------------------------------------------------------------------*/}
            {isMdScreen && (
              <Stack direction="row">
                {collapsedDrawer ? (
                  <IconButton onClick={handleDrawerResize}>
                    <ArrowForwardIcon sx={{ fontSize: iconSizeSM }} />
                  </IconButton>
                ) : (
                  <IconButton onClick={handleDrawerResize}>
                    <ArrowBackIcon sx={{ fontSize: iconSizeSM }} />
                  </IconButton>
                )}
              </Stack>
            )}
          </Stack>
        </Drawer>
      </Box>

      <Dialog
        open={openPrivacy || openTNC}
        PaperProps={{
          sx: { background: isDarkMode ? "#1e1e1e" : "#fff" },
        }}
        maxWidth="md"
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle align="right">
          <CloseIcon
            onClick={() => {
              if (openPrivacy) setOpenPrivacy(false);
              if (openTNC) setOpenTNC(false);
            }}
            sx={{ cursor: "pointer" }}
          />
        </DialogTitle>
        <DialogContent>
          <React.Suspense fallback={<div>loading..</div>}>
            {openPrivacy && <PrivacyPolicy isPublic={false} />}
            {openTNC && <TermsAndConditions isPublic={false} />}
          </React.Suspense>
        </DialogContent>
      </Dialog>

      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        PaperProps={{
          sx: { background: isDarkMode ? "#1e1e1e" : "#fff", width: 300 },
        }}
        sx={{ px: 2 }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <SettingsForm closeForm={() => setSettingsOpen(false)} loading={isLoading} />
      </Drawer>

      <Dialog
        open={openAbout}
        onClose={() => setOpenAbout(false)}
        PaperProps={{
          sx: { background: isDarkMode ? "#1e1e1e" : "#fff", maxWidth: 320 },
        }}
        maxWidth="xs"
        fullWidth
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogContent>
          <React.Suspense fallback={<div>loading..</div>}>
            <About isPrivate={true} />
          </React.Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(NavMenu);
