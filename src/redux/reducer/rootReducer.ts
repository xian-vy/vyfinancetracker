import { combineReducers } from "redux";
import expenseReducer from "./expenseSlice";
import budgetReducer from "./budgetSlice";
import filterReducer from "./filterReducer";
import incomeReducer from "./incomeSlice";
import timeframeSlice from "./timeframeSlice";
import themeSlice from "./themeSlice";
import authSlice from "./authSlice";
import userAccountSlice from "./userAccountSlice";
import pendingSyncSlice from "./pendingSyncSlice";
import powerSavingSlice from "./powerSavingSlice";
import fontSizeSlice from "./fontSizeSlice";

import { savingsReducer, savingsContributionReducer } from "./savingsSlice";

const rootReducer = combineReducers({
  expenses: expenseReducer,
  budget: budgetReducer,
  income: incomeReducer,
  filter: filterReducer,
  timeframe: timeframeSlice,
  savings: savingsReducer,
  savingsContribution: savingsContributionReducer,
  auth: authSlice,
  theme: themeSlice,
  userAccount: userAccountSlice,
  pendingSync: pendingSyncSlice,
  powerSaving: powerSavingSlice,
  fontSize: fontSizeSlice,
});

export default rootReducer;
