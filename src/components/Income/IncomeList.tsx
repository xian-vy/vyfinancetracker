import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useRef } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { generateIncomeList } from "../../helper/ReportHelper";
import { TimestamptoDate } from "../../helper/date";
import { ThemeColor, formatNumberWithoutCurrency, hoverBgColor, useResponsiveCharLimit } from "../../helper/utils";
import { FIXED_SIZE, TABLE_HEIGHT, iconSizeSM, iconSizeXS } from "../../constants/size";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { getCategoryAndAccountTypeDescription, getIncomeSourceDetails } from "../../firebase/utils";
import { useActionPopover } from "../../hooks/actionHook";
import { useTablePagination } from "../../hooks/paginationHook";
import IncomeModel from "../../models/IncomeModel";

interface Props {
  income: IncomeModel[];
  onEditIncome: (income: IncomeModel) => void;
  onDeleteIncome: (income: IncomeModel) => void;
  sortBy: string;
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
      if (sortBy === "date") {
        return b.date.toDate().getTime() - a.date.toDate().getTime();
      } else if (sortBy === "amount") {
        return b.amount - a.amount;
      }
      return 0; // Default case if sortBy is not 'date' or 'amount'
    });
  }, [income, sortBy]);

  const paginatedIncome = useMemo(
    () => sortedIncome.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedIncome, page, rowsPerPage]
  );

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: smScreen ? iconSizeXS : iconSizeSM } });
  }

  const handleAction = (action: string, income: IncomeModel) => {
    if (action === "Edit") {
      onEditIncome(income);
    } else if (action === "Delete") {
      onDeleteIncome(income);
    }
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: ["Edit", "Delete"],
    handleAction,
  });
  const charLimit = useResponsiveCharLimit();

  const incomeList = React.useMemo(
    () =>
      ({ index, style }: ListChildComponentProps) => {
        const income = paginatedIncome[index];

        const { description, color, categoryIcon } = getIncomeSourceDetails(incomeSource, income.category_id);
        const account = getCategoryAndAccountTypeDescription(income.account_id, accountType) || "";
        return (
          <div key={index} style={style}>
            <ListItem
              sx={{
                "&:hover": {
                  backgroundColor: hoverBgColor(theme),
                  borderRadius: 3,
                },
                pl: smScreen ? 0.5 : 1,
                pr: smScreen ? 0 : 1,
                py: 0,
              }}
            >
              <ListItemAvatar sx={{ minWidth: smScreen ? 24 : 32 }}>
                <Tooltip title={description}>
                  <div>{categoryIcon && renderIcon(categoryIcon.icon, color || "")}</div>
                </Tooltip>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Tooltip title={income.description === "" ? description : income.description}>
                      <Typography variant="body1">
                        {income.description === ""
                          ? description && description.length > charLimit
                            ? description.substring(0, charLimit)
                            : description
                          : income.description.length > charLimit
                          ? income.description.substring(0, charLimit)
                          : income.description}{" "}
                      </Typography>
                    </Tooltip>

                    <Typography variant="caption">{formatNumberWithoutCurrency(income.amount)}</Typography>
                  </>
                }
              />

              <ListItemSecondaryAction sx={{ mr: smScreen ? -2 : 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Stack direction="column" alignItems="flex-end">
                    <Typography variant="caption">{account}</Typography>
                    <Typography variant="caption">{TimestamptoDate(income.date, "MMM dd, yyyy")}</Typography>
                  </Stack>
                  <IconButton aria-label="Actions" onClick={(event) => handleActionOpen(event, income)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ mx: 2 }} />
          </div>
        );
      },
    [paginatedIncome, incomeSource, accountType]
  );

  return (
    <>
      <Box
        sx={{
          px: { xs: 0, sm: 1, md: 2 },
          pt: 2,
          mx: { xs: 0, sm: 1, md: 2 },
          height: smScreen ? "auto" : TABLE_HEIGHT,
        }}
      >
        <FixedSizeList
          height={TABLE_HEIGHT}
          itemCount={paginatedIncome.length}
          itemSize={FIXED_SIZE}
          style={{ listStyle: "none" }}
          width="100%"
        >
          {incomeList}
        </FixedSizeList>
      </Box>
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
          rowsPerPageOptions={[10, 50, 100, 200]}
          labelRowsPerPage={smScreen ? "" : "Rows per Page:"}
        />
      </Stack>
      {ActionPopover}
    </>
  );
};

export default React.memo(IncomeList);
