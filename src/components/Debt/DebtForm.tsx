import { Button, FormControl, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { operation_types, txn_types } from '../../constants/collections';
import { DEBT_STATUS } from '../../constants/constants';
import { useAccountTypeContext } from '../../contextAPI/AccountTypeContext';
import { useTransactionLogsContext } from '../../contextAPI/TransactionLogsContext';
import { currentDatetoDatePicker } from '../../helper/date';
import useSnackbarHook from '../../hooks/snackbarHook';
import AccountsIcons from '../../media/AccountsIcons';
import DebtModel from '../../models/DebtModel';
import TransactionLogsModel from '../../models/TransactionLogsModel';
import { adddebtAction, updateDebtsAction } from '../../redux/actions/debtAction';
import EntryFormCategoryDropdown from '../GenericComponents/EntryFormCategoryDropdown';
import EntryFormDatePicker from '../GenericComponents/EntryFormDatePicker';

interface EntryFormProps {
  handleCloseForm: () => void;
  debtProp: DebtModel | null
}
const EntryForm = ({handleCloseForm,debtProp} : EntryFormProps) => {
    const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
    const { saveLogs } = useTransactionLogsContext();
    const { accountType } = useAccountTypeContext();
    const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState<Date>(currentDatetoDatePicker);
    const [endDate, setEndDate] = useState<Date>(currentDatetoDatePicker);
    const [newDebt, setNewDebt] = useState<DebtModel>({
      id: "",
      entity: "",
      note: "",
      amount: 0,
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      status:DEBT_STATUS.InProgress,
      account_id :  accountType[0]?.id,
      isCreditor: true
    });

      useEffect(() => {
        if (debtProp) {
          setNewDebt(debtProp);
          setStartDate(new Date(debtProp.startDate.toDate()));
          setEndDate(new Date(debtProp.endDate.toDate()));
        } 
      }, [debtProp]);

      const handleSaveDebt = async (debt: DebtModel) => {
        handleCloseForm();
        
        try {
          setIsLoading(true);
    
          let debtId: string | undefined = "";
    
          if (debtProp) {
            await dispatch(updateDebtsAction(debt));
            debtId = debt.id;
           
          } else {
            const resultAction = await dispatch(adddebtAction(debt));
            if (adddebtAction.fulfilled.match(resultAction)) {
              debtId = resultAction.payload.id;
            }
          }
    
            const log: TransactionLogsModel = {
              txn_id: "",
              txn_ref_id: debtId,
              txn_type: txn_types.Debt,
              operation: debtProp ? operation_types.Update : operation_types.Create,
              category_id: debtId, //Debt id has no categories
              account_id: debt.account_id,
              amount: debt.amount,
              lastModified: Timestamp.now(),
            };
    
            await saveLogs(log);
          
        } catch (error) {
          console.log(`Error ${debtProp ? "Updating" : "Adding"}  Debt`, error);
        } finally {
          setNewDebt({ id: "", note: "",entity: "",account_id: "", amount: 0, startDate: Timestamp.now(), endDate: Timestamp.now(), status: DEBT_STATUS.InProgress, isCreditor: true });
          setIsLoading(false);
        }
        setTimeout(() => {
          openSuccessSnackbar(`Debt has been ${debtProp ? "Updated" : "Added"}`);
        }, 300);
      };

      const handleAccountsChange = (account_id: string) => {
        setNewDebt((prevDebt) => ({
          ...prevDebt,
          account_id,
        }));
      };

  return (
    <Stack direction="column" gap={2} px={1.5} py={2}>

      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mb={1}>  
          <Typography textAlign="center">You want to</Typography>
          <FormControl>
              <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="Creditor"
              name="radio-buttons-group"
              value={newDebt.isCreditor ? "Creditor" : "Debtor"}
              onChange={(e) => setNewDebt({ ...newDebt, isCreditor: !newDebt.isCreditor })}
              row
              sx={{display:"flex", justifyContent:"center"}}
              >
              <FormControlLabel  value="Creditor" control={<Radio size='small' />} label="Lend" />
              <FormControlLabel value="Debtor" control={<Radio size='small' />} label="Borrow" />
              </RadioGroup>
          </FormControl>
        </Stack>

        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <EntryFormDatePicker
            selectedDate={startDate}
            setSelectedDate={() => setStartDate}
            newData={newDebt}
            setNewData={setNewDebt}
            label="Start Date"
            datefield="startDate"
          />

          <EntryFormDatePicker
            selectedDate={endDate}
            setSelectedDate={() => setEndDate}
            newData={newDebt}
            setNewData={setNewDebt}
            label="Due Date"
            datefield="endDate"
          />
        </Stack>
        <TextField value={newDebt.entity} 
          onChange={(e) => {
            if (e.target.value.length <= 30) {
              setNewDebt({ ...newDebt, entity: e.target.value })
            }
          }
        } 
        size='small' variant='outlined' type="text" fullWidth label={newDebt.isCreditor ? "Borrower Name" : "Lender Name"} />
        <TextField  
          inputMode="numeric"
          inputProps={{ inputMode: "numeric" }}
          value={new Intl.NumberFormat("en-US").format(newDebt.amount)}
          onChange={(e) => {
            const value = e.target.value;
            const amount = parseFloat(value.replace(/,/g, ""));
            if (value.length <= 8) {
              setNewDebt({
                ...newDebt,
                amount: isNaN(amount) ? 0 : amount,
              });
            }
          }}  size='small' variant='outlined' type="text" fullWidth label='Amount' placeholder="Amount" />
      
       <EntryFormCategoryDropdown
          label="Account Type"
          category_id={newDebt.account_id || ""}
          categories={accountType}
          onChange={handleAccountsChange}
          icons={AccountsIcons}
          onAddNewCategory={handleCloseForm}
        />

        <TextField value={newDebt.note} 
          onChange={(e) => {
                if (e.target.value.length <= 40) {
                  setNewDebt({ ...newDebt, note: e.target.value })
                }
              }
            } 
           size='small' variant='outlined' type="text" fullWidth label='Notes' />

       {/* <Stack direction="column" >
          <Typography variant='body1' textAlign="center">
            You are the
            <b> { newDebt.isCreditor ? " LENDER  " : " BORROWER  "}  </b>  for
            <b>  {formatShortAmountWithCurrency(newDebt.amount, false, true)}</b>          
          </Typography>
          <Typography variant='body1' textAlign="center">
            <b>{toTitleCase(newDebt.entity)}</b> {newDebt.isCreditor ? "will pay you" : "will collect from you "} by <b>{newDebt.endDate.toDate().toDateString()}</b>
          </Typography>
      </Stack> */}
       <Button onClick={() => handleSaveDebt(newDebt)} disabled={isLoading || newDebt.amount <= 0 || newDebt.entity.length < 1} variant='outlined' size='large' color='inherit'  fullWidth>
        {debtProp ? "Update Debt" : " Create Debt "}</Button>
     {SnackbarComponent}
    </Stack>
  )
}

export default EntryForm
