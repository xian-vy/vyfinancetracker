import CheckIcon from "@mui/icons-material/Check";
import {
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { FilterTimeframe } from "../../constants/timeframes";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface ReusableDrawerProps {
  filterOpen: boolean;
  anchorEl: HTMLElement | null;
  handleFilterClose: () => void;
  handleFilterOptionChange: (option: FilterTimeframe) => void;
  selectedTimeframe: FilterTimeframe;
}

const TimeframeDrawerPopOver: React.FC<ReusableDrawerProps> = ({
  filterOpen,
  anchorEl,
  handleFilterClose,
  handleFilterOptionChange,
  selectedTimeframe,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const FilterList = () => (
    <List>
      {Object.values(FilterTimeframe).map((timeframe) => (
        <ListItemButton
          key={timeframe}
          onClick={() => handleFilterOptionChange(timeframe)}
          selected={selectedTimeframe === timeframe}
        >
          <ListItemText
            primary={timeframe}
            sx={{ color: selectedTimeframe === timeframe ? theme.palette.primary.main : "inherit" }}
          />
          {selectedTimeframe === timeframe && (
            <CheckIcon fontSize="inherit" style={{ color: theme.palette.primary.main }} />
          )}
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <>
      {isSmallScreen ? (
        <Drawer
          open={filterOpen}
          onClose={handleFilterClose}
          anchor="bottom"
          sx={{
            "& .MuiDrawer-paper": {
              mx: 1,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              background: isDarkMode ? "#1e1e1e" : "#fff",
              pb: 1,
            },
          }}
          transitionDuration={powerSavingMode ? 0 : undefined}
        >
          <div
            style={{
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                height: "4px",
                width: "40px",
                borderRadius: "2px",
                backgroundColor: isDarkMode ? "#333" : "#999",
              }}
            />
          </div>
          <Typography textAlign="center" variant="body1">
            Filter by timeframe
          </Typography>
          <Divider sx={{ mx: 2, my: 0.5 }} />
          <FilterList />
          <Divider sx={{ mx: 2 }} />
          <Button onClick={handleFilterClose}>Close</Button>
        </Drawer>
      ) : (
        <Popover
          open={filterOpen}
          anchorEl={anchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: { style: { minWidth: 200 } },
          }}
          transitionDuration={powerSavingMode ? 0 : undefined}
        >
          <FilterList />
        </Popover>
      )}
    </>
  );
};

export default React.memo(TimeframeDrawerPopOver);
