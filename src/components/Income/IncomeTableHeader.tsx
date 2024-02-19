import { Add as AddIcon } from "@mui/icons-material";
import { List, ListItemButton, ListItemText, Popover, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ThemeColor, getFilterTitle } from "../../Helper/utils";
import { FilterTimeframe } from "../../constants/timeframes";
import { iconSizeXS } from "../../constants/Sizes";
import { useFilterHandlers } from "../../hooks/filterHook";
import CustomIconButton from "../CustomIconButton";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTitleAndIcon from "../Filter/FilterTitleAndIcon";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CheckIcon from "@mui/icons-material/Check";

interface Props {
  onfilterChange: (filterOption: FilterTimeframe, startDate: Date | undefined, endDate: Date | undefined) => void;
  onOpenForm: () => void;
  onSortChange: (sortBy: string) => void;
  currentSort: string;
}
const IncomeTableHeader = (props: Props) => {
  const theme = useTheme();

  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    anchorEl,
    filterOpen,
    handleFilterClick,
    handleFilterClose,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers();

  const [sortOpen, setSortOpen] = useState(false);
  const [anchorSort, setAnchorSort] = useState<HTMLElement | null>(null);

  const handleSortClose = () => {
    setAnchorSort(null);
    setSortOpen(false);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorSort(event.currentTarget);
    setSortOpen(!filterOpen);
  };

  const handleSortOptionChange = (option: string) => {
    props.onSortChange(option);
    handleSortClose();
  };

  useEffect(() => {
    props.onfilterChange(filterOption, startDate || undefined, endDate || undefined);
  }, [handleFilterOptionChange]);

  const openBudgetForm = () => {
    props.onOpenForm();
  };

  return (
    <Stack direction="row" justifyContent="end" alignItems="center" sx={{ pr: { xs: 0, sm: 1, md: 2 } }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <CustomIconButton type="filter" onClick={handleSortClick}>
          <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
            Sort
          </Typography>

          <SwapVertIcon sx={{ fontSize: iconSizeXS }} />
        </CustomIconButton>
        <FilterTitleAndIcon
          title=""
          timeframe={getFilterTitle(filterOption, startDate, endDate)}
          onfilterClick={handleFilterClick}
        />

        <CustomIconButton onClick={openBudgetForm} type="add" style={{ marginLeft: 1 }}>
          <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
            New
          </Typography>
          <AddIcon sx={{ fontSize: iconSizeXS }} />
        </CustomIconButton>
      </div>

      <Popover
        open={sortOpen}
        anchorEl={anchorSort}
        onClose={handleSortClose}
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
            width: 140,
          },
        }}
      >
        <List>
          {["date", "amount"].map((filterOption) => (
            <ListItemButton key={filterOption} onClick={() => handleSortOptionChange(filterOption)}>
              <ListItemText
                primary={filterOption}
                sx={{ color: filterOption === props.currentSort ? theme.palette.primary.main : "inherit" }}
              />
              {filterOption === props.currentSort && (
                <CheckIcon fontSize="inherit" style={{ color: theme.palette.primary.main }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Popover>
      <FilterActionsComponent
        filterOpen={filterOpen}
        anchorEl={anchorEl}
        handleFilterClose={handleFilterClose}
        customMonthOpen={customMonthOpen}
        customYearOpen={customYearOpen}
        handleFilterOptionChange={handleFilterOptionChange}
        handleCloseForm={handleCloseForm}
        handleMonthFilter={handleMonthFilter}
        handleYearFilter={handleYearFilter}
        selectedTimeframe={filterOption}
      />
    </Stack>
  );
};

export default IncomeTableHeader;
