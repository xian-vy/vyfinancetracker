import { getAccountsDetails } from "../../firebase/utils";
import AccountTypeModel from "../../models/AccountTypeModel";
import DebtModel from "../../models/DebtModel";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeModel from "../../models/IncomeModel";
import SavingGoalsContributionModel from "../../models/SavingGoalsContribution";

interface Transaction {
  account_id: string;
  amount: number;
}

function groupByAccountId(data: Transaction[]) {
  return data.reduce((acc: { [key: string]: Transaction[] }, item: Transaction) => {
    const accountId = item.account_id;
    if (!acc[accountId]) {
      acc[accountId] = [];
    }
    acc[accountId].push(item);
    return acc;
  }, {});
}
function getAllAccountIds(
  incomeData: IncomeModel[],
  expenseData: ExpenseModel[],
  contributionData: SavingGoalsContributionModel[],
  debtsData : DebtModel[]
) {
  const incomeAccountIds = new Set(incomeData.map((item) => item.account_id));
  const expenseAccountIds = new Set(expenseData.map((item) => item.account_id));
  const contributionAccountIds = new Set(contributionData.map((item) => item.account_id));
  const debtAccountIds = new Set(debtsData.map((item) => item.account_id));

  // Combine all account IDs
  return new Set([...incomeAccountIds, ...expenseAccountIds, ...contributionAccountIds, ...debtAccountIds]);
}
export function generateAccountsBalances(
  incomeData: IncomeModel[],
  expenseData: ExpenseModel[],
  contributionData: SavingGoalsContributionModel[],
  accounts: AccountTypeModel[],
  debtsData : DebtModel[]
) {
  const incomeDataByAccountId = groupByAccountId(incomeData);
  const expenseDataByAccountId = groupByAccountId(expenseData);
  const contributionDataByAccountId = groupByAccountId(contributionData);
  const debtsDataByAccountId = groupByAccountId(debtsData);
  const allAccountIds = getAllAccountIds(incomeData, expenseData, contributionData, debtsData);

  // Compute balance for each account type
  interface AccountBalance {
    balance: number;
    income: number;
    expense: number;
    savings: number;
    debts : number
  }
  const balanceByAccountId: { [key: string]: AccountBalance } = {};
  for (const accountId of allAccountIds) {
    const income = incomeDataByAccountId[accountId as string]?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const expense = expenseDataByAccountId[accountId as string]?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const savings = contributionDataByAccountId[accountId as string]?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const debts =  debtsDataByAccountId[accountId as string]?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const netDebt = Math.abs(debts);
   
    balanceByAccountId[accountId] = {
      balance: income - expense - savings - netDebt,
      income,
      expense,
      savings,
      debts : netDebt
    };
  }

  // Get account details for each account type
  interface AccountTypeBalance {
    balance: number;
    income: number;
    expense: number;
    savings: number;
    debts : number
    color: string;
    icon: string;
  }
  const balanceByAccountType: { [key: string]: AccountTypeBalance } = {};
  for (const accountId in balanceByAccountId) {
    const { data } = getAccountsDetails(accounts, accountId);
    if (data?.description) {
      balanceByAccountType[data.description] = {
        balance: balanceByAccountId[accountId as string].balance,
        income: balanceByAccountId[accountId as string].income,
        expense: balanceByAccountId[accountId as string].expense,
        savings: balanceByAccountId[accountId as string].savings,
        debts : balanceByAccountId[accountId as string].debts,
        color: data.color,
        icon: data.icon, //pass only the string, web worker cant handle jsx element
      };
    }
  }
  return balanceByAccountType;
}
