import { Grid, Skeleton } from "@mui/material";
import React from "react";

const GenericTableSkeleton = () => {
  return (
    <>
      <Grid container p={1} pl={3} pr={3} spacing={1.5}>
        {[...Array(15)].map((_, index) => (
          <Grid item xs={12} key={index} container justifyContent="space-between">
            <Grid item>
              <Skeleton variant="circular" height={26} width={26} sx={{ mr: 1 }} />
            </Grid>
            <Grid item xs>
              <Skeleton variant="text" width="100%" />
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Grid container justifyContent="space-between">
        <Grid item md={1}>
          <Skeleton variant="text" />
        </Grid>
        <Grid item container md={3} spacing={2}>
          <Grid item md={5}>
            <Skeleton variant="text" />
          </Grid>
          <Grid item md={7}>
            <Skeleton variant="text" />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default GenericTableSkeleton;
