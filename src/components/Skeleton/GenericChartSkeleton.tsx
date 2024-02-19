import { Grid, Paper, Skeleton } from "@mui/material";
import React from "react";

const GenericChartSkeleton = () => {
  return (
    <>
      <Paper sx={{ height: 300, p: 1, mt: 1 }}>
        <Grid container justifyContent="space-between">
          <Grid item md={3}>
            <Skeleton animation="wave" variant="text" />
          </Grid>
          <Grid item md={3}>
            <Skeleton animation="wave" variant="text" />
          </Grid>
        </Grid>
        <Skeleton animation="wave" variant="rectangular" height={250} />
      </Paper>
    </>
  );
};

export default GenericChartSkeleton;
