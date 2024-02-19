import { Paper, Skeleton, Grid } from "@mui/material";
import React from "react";

const ExpensesSkeleton = () => {
  return (
    <Paper sx={{ height: "400px", p: 1 }}>
      <Skeleton animation="wave" variant="text" />

      <Grid container mt={2}>
        <Grid item md={6}>
          <Skeleton animation="wave" variant="text" />
        </Grid>
        <Grid item md={12}>
          <Skeleton animation="wave" variant="text" />
        </Grid>

        <Grid item md={4} mt={1}>
          <Skeleton animation="wave" variant="text" />
        </Grid>
        <Grid item md={10}>
          <Skeleton animation="wave" variant="text" />
        </Grid>

        <Grid item md={6} mt={1}>
          <Skeleton animation="wave" variant="text" />
        </Grid>
        <Grid item md={8}>
          <Skeleton animation="wave" variant="text" />
        </Grid>

        <Grid item md={6} mt={1}>
          <Skeleton animation="wave" variant="text" />
        </Grid>
        <Grid item md={7}>
          <Skeleton animation="wave" variant="text" />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExpensesSkeleton;
