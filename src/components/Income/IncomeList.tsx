import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Button, Stack, TablePagination, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useMemo, useRef } from "react";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { generateIncomeList } from "../../helper/ReportHelper";
import { ThemeColor } from "../../helper/utils";
import { useTablePagination } from "../../hooks/paginationHook";
import IncomeModel from "../../models/IncomeModel";
import IncomeListVirtualized from "./IncomeListVirtualized";
import { SORT_TYPE } from "../../constants/constants";

interface Props {
  income: IncomeModel[];
  onEditIncome: (income: IncomeModel) => void;
  onDeleteIncome: (income: IncomeModel) => void;
  sortBy: SORT_TYPE;
  filterDate: string;
}
const IncomeList: React.FC<Props> = ({ income, onDeleteIncome, onEditIncome, sortBy, filterDate }) => {
  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { accountType } = useAccountTypeContext();
  const { incomeSource } = useIncomeSourcesContext();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = useTablePagination();

  const incomeRef = useRef(income);
  // go to page 1 when filtering
  useEffect(() => {
    if (income !== incomeRef.current) {
      handleChangePage(null, 0);
    }
    incomeRef.current = income;
  }, [income]);

  const sortedIncome = useMemo(() => {
    return [...income].sort((a, b) => {
      if (sortBy === SORT_TYPE.date) {
        return b.date.toDate().getTime() - a.date.toDate().getTime();
      } else if (sortBy === SORT_TYPE.amount) {
        return b.amount - a.amount;
      }
      return 0;
    });
  }, [income, sortBy]);

  const paginatedIncome = useMemo(
    () => sortedIncome.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedIncome, page, rowsPerPage]
  );

  const handleAction = (action: string, income: IncomeModel) => {
    if (action === "Edit") {
      onEditIncome(income);
    } else if (action === "Delete") {
      onDeleteIncome(income);
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
            onClick={() => generateIncomeList(sortedIncome, incomeSource, accountType, filterDate)}
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

export default React.memo(IncomeList);
