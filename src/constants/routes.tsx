import React from "react";

export const EXPENSE_PATH = "/expenses";
export const BUDGET_PATH = "/budgets";
export const INCOME_PATH = "/income";
export const SAVINGS_PATH = "/savings";
export const MAINTENANCE_PATH = "/maintenance";
export const REPORTS_PATH = "/reports";
export const DASHBOARD_PATH = "/dashboard";
export const TIMEOUT_PATH = "/timeout";
export const HOME = "/";
export const SIGN_IN_PATH = "/signin";
export const SIGN_UP_PATH = "/signup";
export const TERMS_OF_USE = "/terms-of-use";
export const PRIVACY_POLICY = "/privacy-policy";
export const DEBT_PATH = "/debt";
export const EXCHANGES_PATH = '/exchanges'

const ExpenseMainPage = React.lazy(() => import("../components/Expense/ExpenseMainPage"));
const BudgetMainPage = React.lazy(() => import("../components/Budget/BudgetMainPage"));
const IncomeMainPage = React.lazy(() => import("../components/Income/IncomeMainPage"));
const MaintenancePage = React.lazy(() => import("../components/Maintenance/MaintenancePage"));
const SavingsMainPage = React.lazy(() => import("../components/Savings/SavingsMainPage"));
const ReportMainPage = React.lazy(() => import("../components/Reports/ReportMainPage"));
const Dashboard = React.lazy(() => import("../components/Dashboard/Dashboard"));
const MainPage = React.lazy(() => import("../components/PublicComponents/MainPage"));
const TimeoutPage = React.lazy(() => import("../components/LoadingTimeoutPage"));
const SignIn = React.lazy(() => import("../components/PublicComponents/SignIn"));
// const SignUp = React.lazy(() => import("../components/Login/SignUp"));
const TermsAndConditions = React.lazy(() => import("../components/legal/TermsAndConditions/TermsAndConditionsV1"));
const PrivacyPolicy = React.lazy(() => import("../components/legal/PrivacyPolicy/PrivacyPolicyV1"));
export const TNCandPrivacyPolicyDialog = React.lazy(() => import("../components/legal/TNCandPrivacyPolicyDialog"));
const DebtMainPage = React.lazy(() => import("../components/Debt/DebtMainPage"));
const ExchangesMainPage = React.lazy(() => import("../components/Exchanges/ExchangesMainPage"));

export const routes = [
  {
    path: HOME,
    element: <MainPage />,
    isPublic: true,
  },
  {
    path: SIGN_IN_PATH,
    element: <SignIn />,
    isPublic: true,
  },
  {
    path: DASHBOARD_PATH,
    element: <Dashboard />,
    exact: true,
    isPrivate: true,
  },
  {
    path: EXPENSE_PATH + "/:id?",
    element: <ExpenseMainPage />,
    isPrivate: true,
  },
  {
    path: BUDGET_PATH + "/:id?",
    element: <BudgetMainPage />,
    isPrivate: true,
  },
  {
    path: INCOME_PATH + "/:id?",
    element: <IncomeMainPage />,
    isPrivate: true,
  },
  {
    path: MAINTENANCE_PATH,
    element: <MaintenancePage />,
    isPrivate: true,
  },
  {
    path: SAVINGS_PATH + "/:id?",
    element: <SavingsMainPage />,
    isPrivate: true,
  },
  {
    path: REPORTS_PATH,
    element: <ReportMainPage />,
    isPrivate: true,
  },
  {
    path: TERMS_OF_USE,
    element: <TermsAndConditions />,
  },
  {
    path: PRIVACY_POLICY,
    element: <PrivacyPolicy />,
  },
  {
    path: TIMEOUT_PATH,
    element: <TimeoutPage />,
  },
  {
    path: DEBT_PATH,
    element: <DebtMainPage />,
    isPrivate: true,
  },
  {
    path : EXCHANGES_PATH,
    element: <ExchangesMainPage />,
    isPrivate : true,
  }
];
