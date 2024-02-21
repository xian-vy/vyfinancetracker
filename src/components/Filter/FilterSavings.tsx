import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { List, ListItemButton, ListItemText, Popover, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { ThemeColor } from "../../helper/utils";
import CustomIconButton from "../CustomIconButton";
import { iconSize } from "../../constants/size";
import CheckIcon from "@mui/icons-material/Check";

interface Props {
  filter: string;
  onFilterChange: (filterOption: string) => void;
}

const FilterSavings = (props: Props) => {
  const theme = useTheme();

  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    setFilterOpen(!filterOpen);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterOpen(false);
  };

  const handleFilterOptionChange = (option: string) => {
    props.onFilterChange(option);
    handleFilterClose();
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <CustomIconButton onClick={handleFilterClick} type="filter" style={{ marginLeft: 2 }}>
          <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
            {props.filter}
          </Typography>
          <ExpandMoreIcon fontSize={iconSize} />
        </CustomIconButton>
      </div>
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
        sx={{
          "& .MuiPaper-root": {
            width: 150,
          },
        }}
      >
        <List>
          {["In Progress", "Completed"].map((filterOption) => (
            <ListItemButton key={filterOption} onClick={() => handleFilterOptionChange(filterOption)}>
              <ListItemText
                primary={filterOption}
                primaryTypographyProps={{
                  style: {
                    color: filterOption === props.filter ? theme.palette.primary.main : "inherit",
                  },
                }}
              />
              {filterOption === props.filter && (
                <CheckIcon fontSize="inherit" style={{ color: theme.palette.primary.main }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </div>
  );
};

export default FilterSavings;
