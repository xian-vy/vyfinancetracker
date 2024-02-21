import { Container } from "@mui/material";
import React from "react";
import { getFilterTitle } from "../../helper/utils";
import { useFilterHandlers } from "../../hooks/filterHook";
import AllTransactionsTrendChart from "../Charts/AllTransactionsTrendChart";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTitleAndIcon from "../Filter/FilterTitleAndIcon";

const AllTransactionsTrendChartContainer = () => {
  const {
    filterOption,
    customMonthOpen,
    filterOpen,
    anchorEl,
    customYearOpen,
    startDate,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleFilterClose,
    handleMonthFilter,
    handleFilterClick,
  } = useFilterHandlers();
  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);

  return (
    <>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <FilterTitleAndIcon timeframe={formattedFilterOption} title="Trends" onfilterClick={handleFilterClick} />
      </Container>
      <AllTransactionsTrendChart
        filterOption={filterOption}
        startDate={startDate}
        endDate={endDate}
        formattedFilterOption={formattedFilterOption}
      />

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
    </>
  );
};

export default React.memo(AllTransactionsTrendChartContainer);
