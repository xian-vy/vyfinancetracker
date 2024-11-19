import { DEBT_STATUS } from "../constants/constants";
import DebtModel from "../models/DebtModel";



export const calculateDebtSumByDate = (data: DebtModel[], startDateProp: Date, endDateProp: Date)  => {
    const filteredData = data
  
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

    const total = (lendedPaid + borrowedNotPaid) - (lendedNotPaid + borrowedPaid);


    return  {total,borrowedPaid, borrowedNotPaid, lendedPaid, lendedNotPaid};
  }

export const generateDebtAmounts = (data: DebtModel[])   => {
  

    // make borrowedPaid/lendedNotPaid negative amount 
    
    const finalData = data.map((item) =>  {
        const borrowedPaid = item.isCreditor === false && item.status === DEBT_STATUS.Complete
        const lendedNotPaid = item.isCreditor === true && item.status === DEBT_STATUS.InProgress

        return {
            ...item,
            date : item.startDate,
            amount : borrowedPaid ||  lendedNotPaid ? -item.amount : item.amount,
        }

    })

    return finalData  

  }