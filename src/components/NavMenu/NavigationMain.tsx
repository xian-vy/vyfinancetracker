import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Box, Dialog, DialogContent, Drawer, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BUDGET_PATH,
  DASHBOARD_PATH,
  DEBT_PATH,
  EXCHANGES_PATH,
  EXPENSE_PATH,
  INCOME_PATH,
  MAINTENANCE_PATH,
  REPORTS_PATH,
  SAVINGS_PATH,
} from "../../constants/routes";
import { drawerWidth, drawerWidthCollapse, iconSizeSM, iconSizeXS } from "../../constants/size";
import { useSliceFetchingStates } from "../../hooks/slicefetchingHook";
import { RootState } from "../../redux/store";
import SettingsForm from "../Settings/SettingsForm";
import BottomNav from "./BottomNav";
import DrawerNav from "./DrawerNav";
import { SwapVert } from "@mui/icons-material";
const About = React.lazy(() => import("../PublicComponents/About"));

const menuItems = [
  {
    key: "Dashboard",
    path: DASHBOARD_PATH,
    icon: <DashboardOutlinedIcon sx={{ fontSize: iconSizeSM}} />,
    text: "Dashboard",
  },
  {
    key: "Expenses",
    path: EXPENSE_PATH,
    icon: <ShoppingBagOutlinedIcon sx={{ fontSize: iconSizeSM }} />,
    text: "Expenses",
  },
  {
    key: "Budget",
    path: BUDGET_PATH,
    icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: iconSizeSM }} />,
    text: "Budget",
  },
  { key: "Income", path: INCOME_PATH, icon: <PaidOutlinedIcon sx={{ fontSize: iconSizeSM }} />, text: "Income" },
  {
    key: "Saving Goals",
    path: SAVINGS_PATH,
    icon: <SavingsOutlinedIcon sx={{ fontSize: iconSizeSM }} />,
    text: "Saving Goals",
  },
  {
    key: "Debt",
    path: DEBT_PATH,
    icon: <PriceChangeOutlinedIcon sx={{ fontSize: iconSizeSM }} />,
    text: "Debt",
  },
  {
    key: "Exchanges",
    path: EXCHANGES_PATH,
    icon: <SwapVert sx={{ fontSize: iconSizeSM }} />,
    text: "Exchanges",
  },
  {
    key: "Maintenance",
    path: MAINTENANCE_PATH,
    icon: <ListAltOutlinedIcon sx={{ fontSize: iconSizeSM }} />,
    text: "Categories",
  },
  { key: "Reports", path: REPORTS_PATH, icon: <PrintOutlinedIcon sx={{ fontSize: iconSizeSM }} />, text: "Reports" },
  { key: "Settings", path: "Settings", icon: <SettingsOutlinedIcon sx={{ fontSize: iconSizeSM }} />, text: "Settings" },
  // { key: "About", path: "About", icon: <InfoOutlinedIcon sx={{ fontSize: iconSizeXS }} />, text: "About" },
];

const NavigationMain = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isLgScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const isXSScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [drawerSize, setDrawerSize] = useState(isMdScreen && isLgScreen ? drawerWidthCollapse : drawerWidth);
  const [collapsedDrawer, setCollapsedDrawer] = useState(false);

  useEffect(() => {
    if (drawerSize === drawerWidthCollapse) {
      setCollapsedDrawer(true);
    } else {
      setCollapsedDrawer(false);
    }
  }, [drawerSize]);

  const handleDrawerCollapse = () => {
    setDrawerSize((prevDrawerSize) => (prevDrawerSize === drawerWidth ? drawerWidthCollapse : drawerWidth));
  };
  const handleDrawerToggle = () => {
    setDrawerOpen((prevMobileOpen) => !prevMobileOpen);
  };

  const handleSetting = () => {
    handleDrawerToggle();
    setSettingsOpen(true);
  };
  const { isLoading, timeoutError } = useSliceFetchingStates();

  useEffect(() => {
    if (timeoutError) {
      console.log("fetch timeout");
      window.location.href = DASHBOARD_PATH;
    }
  }, [timeoutError]);

  return (
    <div>
      <Box
        component="nav"
        sx={{
          width: { md: drawerSize },
          flexShrink: { md: 0 },
        }}
      >
        <BottomNav isXSScreen={isXSScreen} closeDrawer={handleDrawerToggle} theme={theme} menuItems={menuItems} />

        <DrawerNav
          collapsedDrawer={collapsedDrawer}
          drawerOpen={drawerOpen}
          drawerSize={drawerSize}
          handleAbout={() => setOpenAbout(true)}
          handleSetting={handleSetting}
          isLoading={isLoading}
          menuItems={menuItems}
          toggleDrawer={handleDrawerToggle}
          toggleDrawerCollapse={handleDrawerCollapse}
        />
      </Box>

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
          sx: { background: isDarkMode ? "#1e1e1e" : "#fff", width: 260 },
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

export default React.memo(NavigationMain);
