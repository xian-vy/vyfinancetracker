import { FormControl, MenuItem, Select, SelectChangeEvent, Typography, useTheme } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterTimeframe } from "../../constants/timeframes";
import { useFilterHandlers } from "../../hooks/filterHook";
import { saveTimeframetoLocalStorage } from "../../localstorage/timeframesettings";
import { setTimeframe } from "../../redux/reducer/timeframeSlice";
import { RootState } from "../../redux/store";
import CustomMonthFilter from "../Filter/CustomMonthFilter";
import CustomYearFilter from "../Filter/CustomYearFilter";

const TimeframeToggle = () => {
  const dispatch = useDispatch();
  const Timeframe = useSelector((state: RootState) => state.timeframe.value);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    handleCloseForm,
    handleYearFilter,
    handleFilterOptionChange,
    handleMonthFilter,
  } = useFilterHandlers();

  useEffect(() => {
    saveTimeframetoLocalStorage(filterOption);
    dispatch(setTimeframe(filterOption));
  }, [filterOption, dispatch]);
  return (
    <div>
      <FormControl>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={Timeframe}
          onChange={(event: SelectChangeEvent) => handleFilterOptionChange(event.target.value)}
          sx={{
            height: "27px",
            borderRadius: 2,
            width: 150,
            border: isDarkMode ? `1px solid #333` : `1px solid #e6e6e6`,
            boxShadow: "none",
            ".MuiOutlinedInput-notchedOutline": { border: 0 },
            "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              border: 0,
            },
            "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: 0,
            },
          }}
        >
          {Object.values(FilterTimeframe)
            .filter(
              (filterOption) =>
                filterOption !== FilterTimeframe.CustomMonth && filterOption !== FilterTimeframe.CustomYear
            )
            .map((filterOption) => (
              <MenuItem value={filterOption} key={filterOption}>
                <Typography variant="caption"> {filterOption}</Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <CustomMonthFilter isFormOpen={customMonthOpen} closeForm={handleCloseForm} onFormSubmit={handleMonthFilter} />

      <CustomYearFilter isFormOpen={customYearOpen} closeForm={handleCloseForm} onFormSubmit={handleYearFilter} />
    </div>
  );
};

export default TimeframeToggle;
