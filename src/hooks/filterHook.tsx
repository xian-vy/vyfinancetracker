import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FilterTimeframe } from "../constants/timeframes";
import { RootState } from "../redux/store";

export const useFilterHandlers = () => {
  const defaultTimeframe = useSelector((state: RootState) => state.timeframe.value);
  const [filterOption, setFilterOption] = useState<FilterTimeframe>(defaultTimeframe);

  useEffect(() => {
    setFilterOption(defaultTimeframe);
  }, [defaultTimeframe]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [customMonthOpen, setcustomMonthOpen] = useState(false);
  const [customYearOpen, setcustomYearOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleFilterOptionChange = (option: string) => {
    if (option === FilterTimeframe.CustomYear) {
      setcustomYearOpen(true);
    } else if (option === FilterTimeframe.CustomMonth) {
      setcustomMonthOpen(true);
    } else {
      setFilterOption(option as FilterTimeframe);
    }
    handleFilterClose();
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    setFilterOpen(!filterOpen);
  };

  const handleCloseForm = () => {
    setcustomYearOpen(false);
    setcustomMonthOpen(false);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterOpen(false);
  };

  const handleYearFilter = (month: Date, year: Date) => {
    setStartDate(month);
    setEndDate(year);
    setFilterOption(FilterTimeframe.CustomYear);
  };

  const handleMonthFilter = (month: Date, year: Date) => {
    setStartDate(month);
    setEndDate(year);
    setFilterOption(FilterTimeframe.CustomMonth);
    handleCloseForm();
  };

  return {
    filterOpen,
    filterOption,
    anchorEl,
    customMonthOpen,
    customYearOpen,
    startDate,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleFilterClose,
    handleYearFilter,
    handleMonthFilter,
    handleFilterClick,
  };
};
