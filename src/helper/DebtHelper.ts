import { DEBT_STATUS } from "../constants/constants";
import { FilterTimeframe } from "../constants/timeframes";
import DebtModel from "../models/DebtModel";
import { getStartAndEndDate } from "./date";



export const calculateDebtByType = (data: DebtModel[], timeframe: FilterTimeframe,
  dateStart?: Date,
  dateEnd?: Date,
)  => {
  const { startDate, endDate } = getStartAndEndDate(timeframe, dateStart, dateEnd);

  
  const filteredData = data.filter((data) => {
    const date = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1e6);
    return date >= startDate && date <= endDate;
  });

    //plus to balance
    const borrowedNotPaid = filteredData.reduce((total, item) => {
      if (item.isCreditor === false && item.status === DEBT_STATUS.InProgress) {
        return total + item.amount;
      }
      return total;
    }, 0);
  
    //minus to balance
    const borrowedPaid = filteredData.reduce((total, item) => {
      if (item.isCreditor === false && item.status === DEBT_STATUS.Complete) {
        return total + item.amount;
      }
      return total;
    }, 0);
  
       //plus to balance
    const lendedPaid = filteredData.reduce((total, item) => {
      if (item.isCreditor === true && item.status === DEBT_STATUS.Complete) {
        return total + item.amount;
      }
      return total;
    }, 0);
  
    //minus to balance
    const lendedNotPaid = filteredData.reduce((total, item) => {
      if (item.isCreditor === true && item.status === DEBT_STATUS.InProgress) {
        return total + item.amount;
      }
      return total;
    }, 0);

    //const total = (lendedPaid + borrowedNotPaid) - (lendedNotPaid + borrowedPaid);


    return  {borrowedPaid, borrowedNotPaid, lendedPaid, lendedNotPaid};
  }

export const generateDebtAmounts = (data: DebtModel[])   => {  
    const finalData = data.map((item) =>  {
        const borrowedPaid = item.isCreditor === false && item.status === DEBT_STATUS.Complete
        const lendedNotPaid = item.isCreditor === true && item.status === DEBT_STATUS.InProgress
        const lendedPaid = item.isCreditor === true && item.status === DEBT_STATUS.Complete
        const newAmount =  lendedPaid ||  borrowedPaid ? 0 : lendedNotPaid ? -item.amount : item.amount
        return {
            ...item,          
            amount :newAmount
        }
    })
    return finalData  
  }

  export const getDebtAmountColor = (isCreditor : boolean, isPaid : boolean) => {
     let color = "#A4504A";
     if (isCreditor && isPaid) {
      color = "#008000";
    } else if (isCreditor && !isPaid) {
      color = "#A4504A";
    } else if (!isCreditor && isPaid) {
      color = "#A4504A";
    } else if (!isCreditor && !isPaid) {
      color = "#008000";
    }
    return color
  }