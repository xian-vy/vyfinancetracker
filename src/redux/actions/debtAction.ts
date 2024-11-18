
import { createAsyncThunk } from "@reduxjs/toolkit";
import { addDebts, deleteDebts, getDebts, updateDebts } from "../../firebase/DebtService";
import DebtModel from "../../models/DebtModel";

export const fetchDebts= createAsyncThunk("Debts/fetchDebt", async () => {
  return getDebts();
});
export const adddebtAction = createAsyncThunk("Debts/addDebts", async (data: DebtModel) => {
  const id = await addDebts(data);
  data.id = id;
  return data;
});
export const updateDebtsAction = createAsyncThunk("Debts/updateDebts", async (data: DebtModel) => {
  updateDebts(data);
  return data;
});
export const deleteDebtsAction = createAsyncThunk("Debts/deleteDebts", async (Id: string) => {
  deleteDebts(Id);
  return Id;
});


