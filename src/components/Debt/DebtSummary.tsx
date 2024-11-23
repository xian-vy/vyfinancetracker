import { Grid, Paper, Typography, useTheme } from '@mui/material'
import { FilterTimeframe } from '../../constants/timeframes'
import { calculateDebtByType } from '../../helper/DebtHelper'
import DebtModel from '../../models/DebtModel'

interface Props {
    debt : DebtModel[]
}
const DebtSummary = ({debt}: Props) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const {borrowedPaid, borrowedNotPaid, lendedPaid, lendedNotPaid} = calculateDebtByType(debt, FilterTimeframe.AllTime, undefined, undefined);

    const summary = [
        {
            title: "Borrowed/Unpaid",
            amount : borrowedNotPaid,
            sign : "+",
            color: "green"
        },
        {
            title: "Lended/Paid",
            amount : lendedPaid,
            sign : "+",
              color: "green"
        },
        {
            title: "Borrowed/Paid",
            amount : borrowedPaid,
            sign : "-",
            color: "salmon"
        },
        {
            title: "Lended/Unpaid",
            amount : lendedNotPaid,
            sign : "-",
              color: "salmon"
        },
    ]
  return (
     <Grid container spacing={2} padding={1} my={2}>
        {summary.map((item, index) => (
            <Grid  item xs={6} md={3} key={index}>
                <Paper  sx={{ borderRadius: 2, p: 4, display: "flex",flexDirection: "column", justifyContent: "center", alignItems: "center" , width: "100%"}}     variant={isDarkMode ? "elevation" : "outlined"}>
                    <Typography variant='body2' sx={{fontWeight:"bold",mb:2}}>
                        {item.title}
                    </Typography>
                    <Typography sx={{color: item.color}}>
                    {item.sign} {item.amount}
                    </Typography>
                </Paper>
            </Grid>
        ))}
     </Grid>
)
}

export default DebtSummary