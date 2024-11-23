import { Box, Stack, Typography, useTheme } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'
import { FilterTimeframe } from '../../constants/timeframes'
import { calculateDebtByType } from '../../helper/DebtHelper'
import { formatShortAmountWithCurrency, hexToRGBA } from '../../helper/utils'
import { RootState } from '../../redux/store'

interface Props {
 timeframe: FilterTimeframe,
  dateStart?: Date,
  dateEnd?: Date,
}
const DebtBreakdownByType = ({ timeframe, dateStart, dateEnd} : Props) => {

    const debt = useSelector((state: RootState) => state.debt.debt);

    const {borrowedNotPaid, lendedNotPaid} = calculateDebtByType(debt, timeframe, dateStart, dateEnd);
    const finalData = [
        {
             type: "Borrowed (Unpaid +)",
             amount : borrowedNotPaid,
             color : "#008000",
             sign : "+"
        },
        {
             type: "Lended (Unpaid -)",
             amount : lendedNotPaid,
             color : "#A4504A",
             sign : "-"
        },
        
    ]
    const maxAmount = Math.max( borrowedNotPaid, lendedNotPaid);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const [maxWidth, setMaxWidth] = React.useState(0);
  
    React.useEffect(() => {
      const updateMaxWidth = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const maxWidth = containerWidth - 70; 
          setMaxWidth(maxWidth);
        }
      };
  
      window.addEventListener("resize", updateMaxWidth);
  
      updateMaxWidth();
  
      return () => {
        window.removeEventListener("resize", updateMaxWidth);
      };
    }, []);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
  return (
    <Box ref={containerRef} overflow="hidden" sx={{ px: 0, display: "flex", justifyContent: "flex-start" }}>
    <Stack direction="column" gap={2}>
      {finalData.map((item, index) => (
          <Stack key={index} direction="column">
            <Typography variant="caption" ml={0.3} height={15}>
              {item.type}
            </Typography>

            <Stack direction="row" alignItems="center" height={15}>
              <svg width={maxAmount === 0 ? "0" : `${(item.amount / maxAmount) * maxWidth}px`} height="5">
                <rect
                  width="100%"
                  height="100%"
                  fill={hexToRGBA(item.color)}
                  stroke={isDarkMode ? "#1e1e1e" : item.color}
                  strokeWidth={isDarkMode ? 1 : 0.3}
                  rx={4}
                  ry={4}
                />
              </svg>
              <Typography variant="caption"  ml={0.5} >
                {formatShortAmountWithCurrency(item.amount, false, true)}
                </Typography>           
                <Typography variant="body1"  ml={0.2} sx={{color : item.color}}>
                {item.sign}
              </Typography>
            </Stack>
          </Stack>
      ))}
    </Stack>
  </Box>
  )
}

export default DebtBreakdownByType
