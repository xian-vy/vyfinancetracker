import { Add as AddIcon } from "@mui/icons-material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Stack, Typography, useTheme } from "@mui/material";
import { useEffect } from "react";
import { iconSizeXS } from "../../constants/size";
import { FilterTimeframe } from "../../constants/timeframes";
import { ThemeColor, getFilterTitle } from "../../helper/utils";
import { useActionPopover } from "../../hooks/actionHook";
import { useFilterHandlers } from "../../hooks/filterHook";
import CustomIconButton from "../CustomIconButton";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTitleAndIcon from "../Filter/FilterTitleAndIcon";
import { SORT_TYPE } from "../../constants/constants";

interface Props {
  onfilterChange: (filterOption: FilterTimeframe, startDate: Date | undefined, endDate: Date | undefined) => void;
  onOpenForm: () => void;
  onSortChange: (sortBy: SORT_TYPE) => void;
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

  useEffect(() => {
    props.onfilterChange(filterOption, startDate || undefined, endDate || undefined);
  }, [handleFilterOptionChange]);

  const openBudgetForm = () => {
    props.onOpenForm();
  };

  const handleAction = (action: string, fodder: string) => {
    props.onSortChange(action as SORT_TYPE);
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [SORT_TYPE.date, SORT_TYPE.amount],
    handleAction,
  });

  return (
    <Stack direction="row" justifyContent="end" alignItems="center" sx={{ pr: { xs: 0, sm: 1, md: 2 } }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <CustomIconButton type="filter" onClick={(event) => handleActionOpen(event, "fodder")}>
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
      {ActionPopover}
    </Stack>
  );
};

export default IncomeTableHeader;
