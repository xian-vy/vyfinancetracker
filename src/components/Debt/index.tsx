import { Dialog, DialogContent, DialogTitle, Grid, Paper, Stack, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import FilterSavings from '../Filter/FilterSavings'
import CustomIconButton from '../CustomIconButton';
import { Add, CloseOutlined } from '@mui/icons-material';
import { FORM_WIDTH, iconSizeXS } from '../../constants/size';
import { ThemeColor } from '../../helper/utils';
import EntryForm from './EntryForm';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';

const DebtMainPage = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

    const [filterOption, setFilterOption] = useState("In Progress");
    const [openForm, setOpenForm] = useState(false);

    const handleFilterChange = (filter: string) => {
        setFilterOption(filter);
      };



  return (
    <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }}>
    <Grid item xs={12} lg={12}>
        <Paper
        sx={{ py: 1, px: { xs: 0, sm: 1, md: 2 }, minHeight: 600, borderRadius: 2}}
        variant={isDarkMode ? "elevation" : "outlined"}
        
        >
            <Stack direction="column" mr={1}>
                <Stack direction="row" justifyContent="end" alignItems="center">
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
                <Grid container padding={1} spacing={2} paddingTop={2}>
            
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
           <CloseOutlined  sx={{ cursor: "pointer",fontSize:16 }} onClick={() => setOpenForm(false)} />
         </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <EntryForm />
        </DialogContent>
      </Dialog>

    </Grid>
  )
}

export default DebtMainPage
