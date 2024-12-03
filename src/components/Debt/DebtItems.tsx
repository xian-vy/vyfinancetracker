import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import {
  CardContent,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { useState } from "react";
import { ACTION_TYPES, DEBT_STATUS } from "../../constants/constants";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { TimestamptoDate } from "../../helper/date";
import { getDebtAmountColor } from "../../helper/DebtHelper";
import { formatShortAmountWithCurrency } from "../../helper/utils";
import { useActionPopover } from "../../hooks/actionHook";
import DebtModel from "../../models/DebtModel";

export function DebtItems({
  debtsProp,
  onActionSelect,
}: {
    debtsProp: DebtModel;
  onActionSelect: (action: string, debtsProp: DebtModel) => void;
}) {

  const [expandedSavingsId, setExpandedSavingsId] = useState<string | null>(null);
  const { accountType } = useAccountTypeContext();


  const handleExpandClick = (id: string) => {
    setExpandedSavingsId(expandedSavingsId === id ? null : id);
  };
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";



  const handleAction = (action: string, debt: DebtModel) => {
    onActionSelect(action, debt);
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [ACTION_TYPES.MarkAsPaid,ACTION_TYPES.Archive, ACTION_TYPES.Edit, ACTION_TYPES.Delete],
    handleAction,
      disabledCondition: (action: string, debt : DebtModel) =>
      action === ACTION_TYPES.Archive && debt.archived === true
  });


  const account = accountType.find((account) => account.id === debtsProp.account_id);

  return (
    <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={debtsProp.id}>
      {ActionPopover}
      <Paper
        sx={{
          borderRadius: 2,
        }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <Stack
          direction="column"
          sx={{
            px: 2,
            py: 1,
          }}
          spacing={0.5}
        >
          {/** Savings Name /More Icon -----------------------------------------------------------------*/}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
  
                <Typography align="left" variant="h6"  noWrap >
                   <span style={{ color:  getDebtAmountColor(debtsProp.isCreditor,debtsProp.status === DEBT_STATUS.Complete)}}>{formatShortAmountWithCurrency(debtsProp.amount, false, true)} </span>   {" "}
                   {account ? account.description : ""}            
                </Typography>    
                            
                <IconButton size="small" onClick={(event) => handleActionOpen(event, debtsProp)} sx={{ mr: -1 }}>
                <MoreHorizOutlinedIcon fontSize="small" />
                </IconButton>
          </Stack>
       
    

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{backgroundColor : debtsProp.isCreditor ? isDarkMode ? "#333" : "#eee" : "none"}}>
                <Typography variant="body1">Lender</Typography>
                <Typography ml={1} variant="body1">
                {debtsProp.isCreditor ? "(You)" : debtsProp.entity}
                </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{backgroundColor : !debtsProp.isCreditor ? isDarkMode ? "#333" : "#eee" : "none"}}>
                <Typography variant="body1">Borrower</Typography>
                <Typography ml={1} variant="body1">
                {debtsProp.isCreditor ? debtsProp.entity: "(You)" }
                </Typography>
          </Stack>


          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body1">Start Date</Typography>
            <Typography ml={1} variant="body1">
              {TimestamptoDate(debtsProp.date, "MMM dd, yyyy")}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body1">Due Date</Typography>
            <Typography ml={1} variant="body1">
              {TimestamptoDate(debtsProp.duedate, "MMM dd, yyyy")}
            </Typography>
          </Stack>

          {/** EXPAND MORE ----------------------------------------------------------------------------*/}
          <Stack direction="row" alignItems="center" justifyContent="end" width="100%">
         
            <IconButton
              onClick={() => handleExpandClick(debtsProp.id)}
              sx={{
                mr: -1,
              }}
            >
              <ExpandMoreIcon
                style={{
                  transform: expandedSavingsId === debtsProp.id ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s",
                }}
              />
            </IconButton>
          </Stack>
        </Stack>
        <Collapse in={expandedSavingsId === debtsProp.id}>
          <CardContent
            sx={{
              py: 1,
              px: 1,
            }}
          >
            {/** NOTE----------------------------------------------------------------------------*/}

            <Divider>
              <Typography variant="body1">Notes</Typography>
            </Divider>

            <Typography textAlign="left" variant="body1">
              {debtsProp.note}
            </Typography>
          </CardContent>
        </Collapse>
      </Paper>
    </Grid>
  );
}
