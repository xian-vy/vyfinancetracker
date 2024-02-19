import { Grid } from "@mui/material";
import React from "react";
import CategoryList from "./Category/CategoryList";
import IncomeSourceList from "./IncomeSource/IncomeSourceList";
import AccountsList from "./Accounts/AccountsList";

const MaintenancePage = () => {
  return (
    <div>
      <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }}>
        <Grid item xs={12}>
          <CategoryList />
        </Grid>
        <Grid item xs={12}>
          <IncomeSourceList />
        </Grid>
        <Grid item xs={12}>
          <AccountsList />
        </Grid>
      </Grid>
    </div>
  );
};

export default MaintenancePage;
