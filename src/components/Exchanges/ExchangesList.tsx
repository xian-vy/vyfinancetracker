import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Button, Stack, TablePagination, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useMemo, useRef } from "react";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { generateExpenseList, generateIncomeList } from "../../helper/ReportHelper";
import { ThemeColor } from "../../helper/utils";
import { useTablePagination } from "../../hooks/paginationHook";
import IncomeModel from "../../models/IncomeModel";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeListVirtualized from "./ExchangesListVirtualized";
import { SORT_TYPE } from "../../constants/constants";
import { useCategoryContext } from "../../contextAPI/CategoryContext";

interface Props {
  exchanges: Array<{
    id: string;
    amount: number;
    description: string;
    account_id: string;
    date: any;
    category_id: string;
    kind: "income" | "expense";
  }>;
  sortBy: SORT_TYPE;
  filterDate: string;
  onDeleteExchange: (item: any) => void;
}
const ExchangesList: React.FC<Props> = ({ exchanges, sortBy, filterDate, onDeleteExchange }) => {
  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { accountType } = useAccountTypeContext();
  const { incomeSource } = useIncomeSourcesContext();
  const { categories } = useCategoryContext();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = useTablePagination();

  const incomeRef = useRef(exchanges);
  // go to page 1 when filtering
  useEffect(() => {
    if (exchanges !== incomeRef.current) {
      handleChangePage(null, 0);
    }
    incomeRef.current = exchanges;
  }, [exchanges]);

  const sortedIncome = useMemo(() => {
    return [...exchanges].sort((a, b) => {
      if (sortBy === SORT_TYPE.date) {
        return b.date.toDate().getTime() - a.date.toDate().getTime();
      } else if (sortBy === SORT_TYPE.amount) {
        return b.amount - a.amount;
      }
      return 0;
    });
  }, [exchanges, sortBy]);

  const paginatedIncome = useMemo(
    () => sortedIncome.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedIncome, page, rowsPerPage]
  );

  const handleAction = (action: string, income: IncomeModel | ExpenseModel) => {
    if (action === "Delete") {
      onDeleteExchange(income);
    }
  };

  return (
    <>
      <IncomeListVirtualized
        accountType={accountType}
        incomeSource={incomeSource}
        paginatedIncome={paginatedIncome}
        onActionSelect={handleAction}
      />

      <Stack direction="row" justifyContent="space-between" height="100%">
        <Stack direction="row" alignItems="center" ml={1}>
          <FileDownloadOutlinedIcon sx={{ fontSize: "16px" }} />

          <Button
            component="span"
            color="inherit"
            onClick={() => {
              const incomes = sortedIncome.filter((x) => x.amount >= 0) as unknown as IncomeModel[];
              const expenses = sortedIncome
                .filter((x) => x.amount < 0)
                .map((e) => ({ ...e, amount: Math.abs(e.amount) })) as unknown as ExpenseModel[];
              if (incomes.length) generateIncomeList(incomes, incomeSource, accountType, filterDate);
              if (expenses.length) generateExpenseList(expenses, categories, accountType, filterDate);
            }}
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
        <TablePagination
          component="div"
          count={sortedIncome.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 50, 100, 300]}
          labelRowsPerPage={smScreen ? "" : "Rows per Page:"}
        />
      </Stack>
    </>
  );
};

export default React.memo(ExchangesList);
