import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { FormControl, MenuItem, Select, SelectChangeEvent, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { ThemeColor } from "../../helper/utils";
import { FilterTimeframe } from "../../constants/timeframes";
import { iconSize, iconSizeXS } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import CustomIconButton from "../CustomIconButton";
import GenericDialog from "../Dialog/GenericDialog";
import TimeframeDrawerPopOver from "./TimeframeDrawerPopOver";

interface Props {
  title: string;
  onFilterChange: (filterOption: string) => void;
  onTypeChange: (type: string) => void;
  totalLogs: number;
  filterOption: FilterTimeframe;
}

const FilterTransactionLogs = (props: Props) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filterOption, setFilterOption] = useState<FilterTimeframe>(props.filterOption);

  const theme = useTheme();
  const [info, setInfo] = useState(false);

  const [type, setType] = useState("All");

  const handleTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as string;
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
    setFilterOption(option);
    props.onFilterChange(option);
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
          <InfoOutlinedIcon sx={{ cursor: "pointer", fontSize: iconSizeXS }} onClick={() => setInfo(true)} />
          <Typography variant="h6" ml={0.5}>
            Recent Transactions {"(" + props.totalLogs + ")"}
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
              <MenuItem value={"All"}>All</MenuItem>
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
      <GenericDialog
        open={info}
        handleClose={() => setInfo(false)}
        title="Transaction will only be recorded"
        content={
          <>
            <Typography variant="body1" gutterBottom mt={2}>
              1 Upon creation and deletion of expense,income,budgets or savings.
            </Typography>
            <Typography variant="body1">
              2 A change in amount was made for expense,income,budgets or savings transaction.
            </Typography>
          </>
        }
      />
    </div>
  );
};

export default FilterTransactionLogs;
