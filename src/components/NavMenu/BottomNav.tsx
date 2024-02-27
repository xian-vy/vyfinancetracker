import { BottomNavigation, BottomNavigationAction, Theme, Typography } from "@mui/material";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

type MenuItemsType = {
  key: string;
  path: string;
  icon: JSX.Element;
  text: string;
};
type Props = {
  theme: Theme;
  menuItems: MenuItemsType[];
  isXSScreen: boolean;
  closeDrawer: () => void;
};

const BottomNav = ({ theme, menuItems, isXSScreen, closeDrawer }: Props) => {
  const location = useLocation();

  return (
    <div>
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
          onClick={closeDrawer}
          sx={{
            minWidth: 0,
            flexGrow: 1,
          }}
          disableRipple={true}
          disableTouchRipple={true}
        />
      </BottomNavigation>
    </div>
  );
};

export default React.memo(BottomNav);
