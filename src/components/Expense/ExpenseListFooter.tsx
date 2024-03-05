import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Button, Divider, Grid, Hidden, Stack, TablePagination, useMediaQuery, useTheme } from "@mui/material";
import { FilterTimeframe } from "../../constants/timeframes";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { generateExpenseList } from "../../helper/ReportHelper";
import { ThemeColor, getFilterTitle } from "../../helper/utils";
import ExpenseModel from "../../models/ExpenseModel";
import ExpenseFileUpload from "./ExpenseFileUpload";
import React from "react";

interface Props {
  filteredAndSortedExpenses: ExpenseModel[];
  filteredExpenses: ExpenseModel[];
  selectedTimeframe: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  page: number;
  rowsPerPage: number;
}
const ExpenseListFooter = ({
  filteredAndSortedExpenses,
  filteredExpenses,
  selectedTimeframe,
  startDate,
  endDate,
  handleChangePage,
  handleChangeRowsPerPage,
  page,
  rowsPerPage,
}: Props) => {
  const { categories } = useCategoryContext();
  const { accountType } = useAccountTypeContext();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const exportExpenses = () => {
    generateExpenseList(
      filteredExpenses,
      categories,
      accountType,
      getFilterTitle(selectedTimeframe, startDate || null, endDate || null)
    );
  };

  return (
    <div>
      <Grid
        container
        direction="row"
        alignContent="center"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Stack direction="row" alignItems="center" height="100%">
          <ExpenseFileUpload />
          <Divider orientation="vertical" sx={{ height: 12, border: `solid 1px #666`, mx: 1.5 }} />
          <FileDownloadOutlinedIcon sx={{ fontSize: "16px" }} onClick={exportExpenses} />

          <Stack direction="row">
            <Hidden smDown>
              <Button
                component="span"
                color="inherit"
                onClick={exportExpenses}
                sx={{
                  color: ThemeColor(theme),
                  minWidth: { xs: 35, md: 40 },
                  textTransform: "none",
                  fontSize: "12px",
                }}
              >
                Export
              </Button>
            </Hidden>
          </Stack>
        </Stack>
        <TablePagination
          component="div"
          count={filteredAndSortedExpenses.length}
          page={filteredAndSortedExpenses.length <= 0 ? 0 : page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isSmallScreen ? "" : "Rows per Page:"}
          rowsPerPageOptions={[10, 50, 100, 300]}
        />
      </Grid>
    </div>
  );
};

export default React.memo(ExpenseListFooter);
