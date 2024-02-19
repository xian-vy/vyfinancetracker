import React from "react";
import { FilterTimeframe } from "../../constants/timeframes";
import CustomMonthFilter from "./CustomMonthFilter";
import CustomYearFilter from "./CustomYearFilter";
import TimeframeDrawerPopOver from "./TimeframeDrawerPopOver";

interface FilterActionsComponentProps {
  filterOpen: boolean;
  anchorEl: HTMLElement | null;
  handleFilterClose: () => void;
  customMonthOpen: boolean;
  customYearOpen: boolean;
  handleFilterOptionChange: (option: string) => void;
  handleCloseForm: () => void;
  handleMonthFilter: (month: Date, year: Date) => void;
  handleYearFilter: (month: Date, year: Date) => void;
  selectedTimeframe: FilterTimeframe;
}

const FilterActionsComponent: React.FC<FilterActionsComponentProps> = ({
  filterOpen,
  anchorEl,
  handleFilterClose,
  customMonthOpen,
  customYearOpen,
  handleFilterOptionChange,
  handleCloseForm,
  handleMonthFilter,
  handleYearFilter,
  selectedTimeframe,
}) => {
  return (
    <>
      <TimeframeDrawerPopOver
        filterOpen={filterOpen}
        anchorEl={anchorEl}
        handleFilterClose={handleFilterClose}
        handleFilterOptionChange={handleFilterOptionChange}
        selectedTimeframe={selectedTimeframe}
      />

      <CustomMonthFilter isFormOpen={customMonthOpen} closeForm={handleCloseForm} onFormSubmit={handleMonthFilter} />
      <CustomYearFilter isFormOpen={customYearOpen} closeForm={handleCloseForm} onFormSubmit={handleYearFilter} />
    </>
  );
};

export default React.memo(FilterActionsComponent);
