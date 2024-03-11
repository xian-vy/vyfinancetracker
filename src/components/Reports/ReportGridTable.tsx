import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { txn_types } from "../../constants/collections";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { FilterAndGroupBudget } from "../../helper/BudgetHelper";
import { FilterAndGroupData } from "../../helper/GenericTransactionHelper";
import { generateSingleReport } from "../../helper/ReportHelper";
import { ThemeColor, formatNumberWithoutCurrency, getFilterTitle } from "../../helper/utils";
import { useFilterHandlers } from "../../hooks/filterHook";
import { RootState } from "../../redux/store";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterReports from "../Filter/FilterReports";

interface filteredData {
  date: string;
  totalAmount: number;
  category?: string;
}
const ReportGridTable = () => {
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
  const [type, setType] = useState(txn_types.Expenses);

  const handleTypeChange = (type: txn_types) => {
    setType(type);
  };
  const { categories } = useCategoryContext();
  const { incomeSource } = useIncomeSourcesContext();
  const theme = useTheme();
  const budget = useSelector((state: RootState) => state.budget.budgets);
  const expense = useSelector((state: RootState) => state.expenses.expenses);
  const income = useSelector((state: RootState) => state.income.income);
  const contributions = useSelector((state: RootState) => state.savingsContribution.contribution);
  const savings = useSelector((state: RootState) => state.savings.savings);

  const data: filteredData[] = useMemo(() => {
    if (type === txn_types.Expenses) {
      return FilterAndGroupData(filterOption, expense, categories, startDate || undefined, endDate || undefined, true);
    } else if (type === txn_types.Budget) {
      return FilterAndGroupBudget(filterOption, budget, categories, startDate || undefined, endDate || undefined, true);
    } else if (type === txn_types.Savings) {
      return FilterAndGroupData(
        filterOption,
        contributions,
        savings,
        startDate || undefined,
        endDate || undefined,
        true
      );
    } else if (type === txn_types.Income) {
      return FilterAndGroupData(filterOption, income, incomeSource, startDate || undefined, endDate || undefined, true);
    } else {
      return [];
    }
  }, [
    type,
    filterOption,
    expense,
    budget,
    income,
    categories,
    contributions,
    savings,
    incomeSource,
    startDate,
    endDate,
  ]);

  const { combinedDataWithTotal, columns } = useMemo(() => generateSingleReport(data, filterOption), [data]);

  const formattedDataForDisplay = useMemo(() => {
    return combinedDataWithTotal.map((row) => {
      const formattedRow: { [key: string]: any } = {};
      Object.keys(row).forEach((key) => {
        // Format only the numeric values, skip other values like 'category' or 'rowNumber'
        if (typeof row[key] === "number") {
          formattedRow[key] = formatNumberWithoutCurrency(row[key]);
        } else {
          formattedRow[key] = row[key];
        }
      });
      return formattedRow;
    });
  }, [combinedDataWithTotal]);

  const exportToExcel = async () => {
    if (formattedDataForDisplay.length === 0) {
      return;
    }
    // Dynamically import xlsx , reduce bundle size
    const xlsx = await import("xlsx/dist/xlsx.mini.min.js");
    const utils = xlsx.utils;
    const writeFile = xlsx.writeFile;

    const columnOrder = columns.map((column) => column.field);

    const ws = utils.json_to_sheet(formattedDataForDisplay, { header: columnOrder });

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Report");
    writeFile(wb, `${getFilterTitle(filterOption, startDate || null, endDate || null)}-${type}-Report.xlsx`);
  };

  return (
    <Box style={{ overflowX: "auto" }}>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <FilterReports
          title={getFilterTitle(filterOption, startDate, endDate)}
          onFilterChange={handleFilterOptionChange}
          onTypeChange={handleTypeChange}
          filterOption={filterOption}
        />
      </Container>
      <TableContainer sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
        <Table aria-label="simple table" size="small">
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>
                  <Typography variant="body1" noWrap>
                    {column.headerName}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(!data || !combinedDataWithTotal) && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Stack sx={{ height: "100%" }} direction="row" justifyContent="center" alignItems="center">
                    <CircularProgress size={20} />
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {formattedDataForDisplay.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    <Typography variant="body1">{row[column.field]}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" mt={1} alignItems="center" justifyContent="flex-end" m={2}>
        <FileDownloadOutlinedIcon sx={{ fontSize: "16px" }} />

        <Button
          component="span"
          color="inherit"
          onClick={exportToExcel}
          sx={{
            color: ThemeColor(theme),
            minWidth: { xs: 35, md: 48 },
            px: 0,
            textTransform: "none",
            fontSize: "12px",
          }}
        >
          Export
        </Button>
      </Stack>
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
    </Box>
  );
};

export default React.memo(ReportGridTable);
