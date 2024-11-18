import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { currentDatetoDatePicker } from '../../helper/date';
import DebtModel from '../../models/DebtModel';
import EntryFormDatePicker from '../GenericComponents/EntryFormDatePicker';

const EntryForm = () => {
    const [startDate, setStartDate] = useState<Date>(currentDatetoDatePicker);
    const [endDate, setEndDate] = useState<Date>(currentDatetoDatePicker);
    const [withInterest, setWithInterest] = useState(false);
    const [newDebt, setNewDebt] = useState<DebtModel>({
        id: "",
        name: "",
        description: "",
        amount: 0,
        startDate: Timestamp.now(),
        endDate: Timestamp.now(),
        status: "",
      });
  return (
    <Stack direction="column" spacing={2} padding={1}>
        <FormControl>
            <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="Creditor"
            name="radio-buttons-group"
            row
            >
            <FormControlLabel value="Creditor" control={<Radio size='small' />} label="Creditor/Lender" />
            <FormControlLabel value="Debtor" control={<Radio size='small' />} label="Debtor/Borrower" />
            </RadioGroup>
        </FormControl>

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
        
        <TextField size='small' variant='outlined' type="text" fullWidth label='Name' placeholder="Name" />
        <TextField size='small' variant='outlined' type="text" fullWidth label='Amount' placeholder="Amount" />
        <FormGroup>
             <FormControlLabel control={<Checkbox checked={withInterest} onChange={(e) => setWithInterest(e.target.checked)} />} label="With Interest" />
        </FormGroup>

       
       <Button variant='outlined'  fullWidth>Save</Button>

    </Stack>
  )
}

export default EntryForm
