import { Container, Grid, Paper, Skeleton } from "@mui/material";
import React from "react";

const GenericTableHeaderSkeleton = () => {
  return (
    <>
      <Grid container justifyContent="space-between">
        <Grid item md={2}>
          <Skeleton variant="text" />
        </Grid>
        <Grid item md={2}>
          <Skeleton variant="text" />
        </Grid>
      </Grid>
    </>
  );
};

export default GenericTableHeaderSkeleton;
