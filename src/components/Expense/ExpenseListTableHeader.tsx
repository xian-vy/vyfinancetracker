import { Add as AddIcon } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ThemeColor, getFilterTitle } from "../../Helper/utils";
import { FilterTimeframe } from "../../constants/timeframes";
import { iconSizeXS } from "../../constants/Sizes";
import { useCategoryList } from "../../hooks/categoryListHook";
import { useFilterHandlers } from "../../hooks/filterHook";
import CustomIconButton from "../CustomIconButton";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTitleAndIcon from "../Filter/FilterTitleAndIcon";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CheckIcon from "@mui/icons-material/Check";

interface ExpenseListActionProps {
  onformOpen: () => void;
  onfilterChange: (filterOption: FilterTimeframe, startDate: Date | undefined, endDate: Date | undefined) => void;
  onSearch: (searchItem: string) => void;
  onCategoryChange: (categoryDescription: string[]) => void;
  selectedCategory: string[];
  onSortChange: (sortBy: string) => void;
  currentSort: string;
}

const ExpenseListTableHeader: React.FC<ExpenseListActionProps> = ({
  onformOpen,
  onfilterChange,
  onSearch,
  onCategoryChange,
  selectedCategory,
  onSortChange,
  currentSort,
}) => {
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
    onSortChange(option);
    handleSortClose();
  };

  const { renderCategoryList, selectedCategory: selectedcategory, handleCategoryClick } = useCategoryList();
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    if (selectedcategory) {
      onCategoryChange(selectedcategory);
    }
  }, [selectedcategory]);

  useEffect(() => {
    onfilterChange(filterOption, startDate || undefined, endDate || undefined);
  }, [handleFilterOptionChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onSearch("");
  };
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <div>
      <Grid
        container
        justifyContent="flex-end"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        sx={{ pr: { xs: 0, sm: 1, md: 2 } }}
      >
        <Stack
          sx={{
            border: `1px solid ${isDarkMode ? "#333" : "#ccc"}`,
            borderRadius: 2,
            textAlign: "left",
            flexGrow: 1,
            minWidth: { xs: "100%", sm: 120, md: 230, lg: 300 },
            maxWidth: { md: 300, lg: 400 },
            pl: 0.5,
            ml: { xs: 0, sm: 1 },
          }}
        >
          <InputBase
            onChange={handleSearchChange}
            placeholder="Search by description"
            value={searchValue}
            startAdornment={<SearchOutlinedIcon sx={{ fontSize: iconSizeXS, mr: 0.5 }} />}
            endAdornment={
              searchValue && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
            style={{
              paddingLeft: 5,
            }}
          />
        </Stack>

        <Stack direction="row" sx={{ mt: { xs: 1, sm: 0 } }} alignItems="center" ml={{ xs: -1, sm: 0 }}>
          <CustomIconButton type="filter" onClick={handleSortClick}>
            <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
              Sort
            </Typography>

            <SwapVertIcon sx={{ fontSize: iconSizeXS }} />
          </CustomIconButton>
          <CustomIconButton type="filter" onClick={handleCategoryClick}>
            <Tooltip title={selectedCategory}>
              <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
                {selectedCategory.length > 1 ? `${selectedCategory[0]}...` : selectedCategory[0]}
              </Typography>
            </Tooltip>
            <ExpandMoreIcon fontSize="small" />
          </CustomIconButton>

          <FilterTitleAndIcon
            title=""
            timeframe={getFilterTitle(filterOption, startDate, endDate)}
            onfilterClick={handleFilterClick}
          />

          <CustomIconButton onClick={onformOpen} type="add">
            <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
              New
            </Typography>
            <AddIcon sx={{ fontSize: iconSizeXS }} />
          </CustomIconButton>
        </Stack>
      </Grid>
      {renderCategoryList()}

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
            <ListItemButton
              key={filterOption}
              onClick={() => handleSortOptionChange(filterOption)}
              // selected={filterOption === currentSort}
            >
              <ListItemText
                primary={filterOption}
                sx={{ color: filterOption === currentSort ? theme.palette.primary.main : "inherit" }}
              />
              {filterOption === currentSort && (
                <CheckIcon fontSize="inherit" style={{ color: theme.palette.primary.main }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </div>
  );
};

export default ExpenseListTableHeader;
