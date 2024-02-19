import { Grid, Paper, Skeleton } from "@mui/material";
import React from "react";

const ShortcutSkeleton = () => {
  return (
    <div style={{ height: "auto", padding: 15 }}>
      <Grid container justifyContent="space-between" mb={1}>
        <Grid item xs={1}>
          <Skeleton animation="wave" variant="text" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton animation="wave" variant="text" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {[...Array(3)].map((_, index) => (
          <Grid
            item
            xs={6}
            sm={4}
            md={3}
            lg={3}
            xl={1.5}
            key={index}
            sx={{ display: { xs: index > 1 ? "none" : "block", md: "block" } }}
          >
            <Paper sx={{ p: 1, borderRadius: 4 }}>
              <Grid container spacing={1} justifyContent="start" p={1} alignItems="center">
                <Skeleton variant="circular" width={20} height={20} sx={{ mr: 0.5 }} />

                <Skeleton animation="wave" variant="text" height={15} sx={{ flexGrow: 1 }} />
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ShortcutSkeleton;
