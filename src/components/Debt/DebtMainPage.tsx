import { Add, CloseOutlined } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { operation_types, txn_types } from '../../constants/collections';
import { ACTION_TYPES, DEBT_STATUS } from '../../constants/constants';
import { iconSizeXS } from '../../constants/size';
import { useTransactionLogsContext } from '../../contextAPI/TransactionLogsContext';
import { ThemeColor } from '../../helper/utils';
import DebtModel from '../../models/DebtModel';
import TransactionLogsModel from '../../models/TransactionLogsModel';
import { deleteDebtsAction, updateDebtsAction } from '../../redux/actions/debtAction';
import { RootState } from '../../redux/store';
import CustomIconButton from '../CustomIconButton';
import DeleteConfirmationDialog from '../Dialog/DeleteConfirmationDialog';
import FilterSavings from '../Filter/FilterSavings';
import DebtForm from './DebtForm';
import { DebtItems } from './DebtItems';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
const DebtMainPage = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
    const debtSlice : DebtModel[] = useSelector((state: RootState) => state.debt.debt);
    const [debtToEdit, setDebtToEdit] = useState<DebtModel | null>(null);
    const [filterOption, setFilterOption] = useState(DEBT_STATUS.InProgress);
    const [openForm, setOpenForm] = useState(false);
    const [deleteFormOpen, setDeleteFormOpen] = useState(false);
    const { saveLogs } = useTransactionLogsContext();
    const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
    

    const filteredDebts = debtSlice.filter((debt) => {
      return debt.status === filterOption;
    });
    const handleFilterChange = (filter: string) => {
        setFilterOption(filter as DEBT_STATUS);
      };

      const handleDeleteDebt = async () => {
         if (!debtToEdit) return;
        try {
          const log: TransactionLogsModel = {
            txn_id: "",
            txn_ref_id: debtToEdit.id,
            txn_type: txn_types.Savings,
            operation: operation_types.Delete,
            category_id: debtToEdit.id, //Debt id has no categories
            account_id: "",
            amount: debtToEdit.amount,
            lastModified: Timestamp.now(),
          };
    
          await saveLogs(log);
          await dispatch(deleteDebtsAction(debtToEdit.id));
        
        } catch (error) {
          console.log("Debt delete failed", error);
        } finally {
          setDeleteFormOpen(false);
          setDebtToEdit(null);
        }
      };


    const handleActionSelect = async (option: string, debt: DebtModel) => {
      setDebtToEdit(debt);
      if (option === ACTION_TYPES.Edit) {
        setOpenForm(true);
      } else if (option === ACTION_TYPES.Delete) {
        setDeleteFormOpen(true);
      } else if (option === ACTION_TYPES.MarkAsPaid) {
        await dispatch(updateDebtsAction({ ...debt, status: DEBT_STATUS.Complete }));
      }
    };
    
  const  handleCloseForm = () => {
      setOpenForm(false);
      setDebtToEdit(null);
    }
  return (
    <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }}>
    <Grid item xs={12} lg={12}>
        <Paper
        sx={{ py: 1, px: { xs: 0, sm: 1, md: 2 }, minHeight: 600, borderRadius: 2}}
        variant={isDarkMode ? "elevation" : "outlined"}
        
        >
            <Stack direction="column" mr={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">

                    <Stack direction="row" alignItems="center">
                          <WalletOutlinedIcon sx={{ color: ThemeColor(theme), fontSize: 16 }} />
                          <Typography ml={0.5} variant="h6"> Debts</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center">
                        <FilterSavings filter={filterOption} onFilterChange={handleFilterChange} />

                        <CustomIconButton onClick={() => setOpenForm(true)} type="add">
                        <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
                            New
                        </Typography>
                        <Add sx={{ fontSize: iconSizeXS }} />
                        </CustomIconButton>
                    </Stack>
                </Stack>
                
                <Grid container padding={1} spacing={2} paddingTop={4}>
                  <Stack direction="row" gap={0.5} justifyContent="center"  alignItems="center" width="100%">
                      <InfoOutlinedIcon sx={{ color: ThemeColor(theme), fontSize: 14 }} />
                      <Typography textAlign={"center"} variant='body1' >This feature is under development. Currently, you can create Basic debts for record purposes. No interest and payments will be made. </Typography>
                  </Stack>
                  {/** Savings Items Container------------------------------------------------------------------------*/}
                  {filteredDebts.map((debt) => (
                    <DebtItems key={debt.id} onActionSelect={handleActionSelect} debtsProp={debt} />
                  ))}
              </Grid>
            </Stack>
    </Paper>
    </Grid>

    <Dialog
        open={openForm}
        PaperProps={{
          sx: { borderRadius: 1, background: isDarkMode ? "#1e1e1e" : "#fff", width: 350 },
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
         <DialogTitle sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
           <Typography variant="body2">New Entry</Typography>
           <CloseOutlined  sx={{ cursor: "pointer",fontSize:16 }} onClick={handleCloseForm} />
         </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <DebtForm  debtProp={debtToEdit} handleCloseForm={handleCloseForm}/>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={() => setDeleteFormOpen(false)}
        onDelete={handleDeleteDebt}
        description={debtToEdit?.note || ""}
      />

    </Grid>
  )
}

export default DebtMainPage
