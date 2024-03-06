import { CircularProgress, Container, Grid } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { txn_types } from "../../constants/collections";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { getFilterTitle } from "../../helper/utils";
import { useFilterHandlers } from "../../hooks/filterHook";
import { RootState } from "../../redux/store";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTransactionLogs from "../Filter/FilterTransactionLogs";
import TransactionLogsListVirtualized from "./TransactionLogsListVirtualized";

export const TransactionLogs = () => {
  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    anchorEl,
    filterOpen,
    handleFilterClose,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers();

  const [type, setType] = useState("All");

  const handleTypeChange = (type: string) => {
    setType(type);
  };

  const [initialLoading, setInitialLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { logs, fetchLogsByTimeframe } = useTransactionLogsContext();

  useEffect(() => {
    const fetchLogs = async () => {
      if (user) {
        setInitialLoading(true);
        try {
          await fetchLogsByTimeframe(filterOption, startDate || undefined, endDate || undefined);
          setInitialLoading(false);
        } catch (error) {
          console.error("Error fetching logs by timeframe", error);
          setInitialLoading(false);
        }
      }
    };

    fetchLogs();
  }, [filterOption, user]);

  const filteredLogs = useMemo(() => {
    if (type === "All") {
      return logs;
    }
    const matchesType = (log: any) => {
      if (log.txn_type === type) {
        return true;
      }
      if (type === txn_types.Savings) {
        //Both savings/contributions is grouped as Savings in the Select option
        return log.txn_type === txn_types.Savings || log.txn_type === txn_types.SavingsContribution;
      }
      return false;
    };

    return logs.filter(matchesType);
  }, [logs, type, txn_types.Savings]);

  return (
    <>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <FilterTransactionLogs
          onFilterChange={handleFilterOptionChange}
          title={getFilterTitle(filterOption, startDate, endDate)}
          onTypeChange={handleTypeChange}
          totalLogs={filteredLogs.length}
          filterOption={filterOption}
        />
      </Container>
      <Container maxWidth={false} sx={{ px: 0, pb: 2 }}>
        <TransactionLogsListVirtualized logs={filteredLogs} selectedTimeframe={filterOption} />
        <Grid
          container
          style={{ height: "100%", visibility: initialLoading ? "visible" : "hidden" }}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size={20} />
        </Grid>
      </Container>
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

export default React.memo(TransactionLogs);
