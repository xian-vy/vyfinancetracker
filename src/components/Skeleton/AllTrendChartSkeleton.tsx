import { Box, Grid, Skeleton } from "@mui/material";
import React from "react";

const AllTrendChartSkeleton = () => {
  return (
    <Box sx={{ height: "auto", p: 1, mt: 1 }}>
      <Grid display="flex" justifyContent="space-between" p={{ xs: 0, md: 1 }}>
        <Skeleton animation="wave" variant="text" width={80} />

        <Skeleton animation="wave" variant="text" width={60} />
      </Grid>
      <Skeleton animation="wave" variant="rectangular" height={400} sx={{ mx: { xs: 0, md: 3 }, borderRadius: 3 }} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <Skeleton animation="wave" variant="text" width={50} />
        <Skeleton animation="wave" variant="text" width={50} sx={{ ml: 1 }} />
        <Skeleton animation="wave" variant="text" width={50} sx={{ ml: 1 }} />
        <Skeleton animation="wave" variant="text" width={50} sx={{ ml: 1 }} />
        <Skeleton animation="wave" variant="text" width={50} sx={{ ml: 1 }} />
      </div>
    </Box>
  );
};

export default AllTrendChartSkeleton;
