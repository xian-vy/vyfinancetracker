import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { FormControl, MenuItem, Select, SelectChangeEvent, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { ThemeColor } from "../../helper/utils";
import { FilterTimeframe } from "../../constants/timeframes";
import { iconSize, iconSizeXS } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import CustomIconButton from "../CustomIconButton";
import TimeframeDrawerPopOver from "./TimeframeDrawerPopOver";

interface Props {
  title: string;
  onFilterChange: (filterOption: string) => void;
  onTypeChange: (type: txn_types) => void;
  filterOption: FilterTimeframe;
}

const FilterReports = (props: Props) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filterOption, setFilterOption] = useState<FilterTimeframe>(props.filterOption);

  const theme = useTheme();

  const [type, setType] = useState(txn_types.Expenses);

  const handleTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as txn_types;
    setType(type);
    props.onTypeChange(type);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    setFilterOpen(!filterOpen);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterOpen(false);
  };

  const handleFilterOptionChange = (option: FilterTimeframe) => {
    props.onFilterChange(option);
    setFilterOption(option);

    handleFilterClose();
  };
  return (
    <div>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        style={{
          width: "100%",
        }}
      >
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <PrintOutlinedIcon sx={{ fontSize: iconSizeXS }} />
          <Typography variant="h6" ml={0.5}>
            Reports
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" sx={{ justifyContent: { xs: "space-between", sm: "flex-end" } }}>
          <FormControl>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={type}
              label={type}
              onChange={handleTypeChange}
              sx={{
                boxShadow: "none",
                ".MuiOutlinedInput-notchedOutline": { border: 0 },
                "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  border: 0,
                },
                "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: 0,
                },
                ml: { xs: -1, sm: 0 },
              }}
            >
              <MenuItem value={txn_types.Expenses}>{txn_types.Expenses}</MenuItem>
              <MenuItem value={txn_types.Budget}>{txn_types.Budget}</MenuItem>
              <MenuItem value={txn_types.Income}>{txn_types.Income}</MenuItem>
              <MenuItem value={txn_types.Savings}>{txn_types.Savings}</MenuItem>
            </Select>
          </FormControl>

          <CustomIconButton onClick={handleFilterClick} type="filter">
            <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
              {props.title}
            </Typography>
            <ExpandMoreIcon fontSize={iconSize} />
          </CustomIconButton>
        </Stack>
      </Stack>

      <TimeframeDrawerPopOver
        filterOpen={filterOpen}
        anchorEl={anchorEl}
        handleFilterClose={handleFilterClose}
        selectedTimeframe={filterOption}
        handleFilterOptionChange={handleFilterOptionChange}
      />
    </div>
  );
};

export default FilterReports;
