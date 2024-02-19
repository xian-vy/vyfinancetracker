import { Paper, Skeleton, Stack } from "@mui/material";
import React from "react";

const paperStyle = {
  px: { xs: 1.5, md: 2 },
  py: { xs: 1.5, md: 2 },
  borderRadius: 3,
  mb: 1,
};
const SummarySkeleton = ({ isAccountBalance }: { isAccountBalance?: boolean }) => {
  return (
    <div style={{ height: "auto", padding: 15 }}>
      <Stack direction="row" justifyContent="space-between" mb={1}>
        <Skeleton animation="wave" variant="text" sx={{ height: 15, width: 80, ml: 1 }} />
        <Skeleton animation="wave" variant="text" sx={{ height: 15, width: 70, ml: 1 }} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ overflowX: "hidden" }}>
        {[...Array(5)].map((_, index) => (
          <Stack key={index}>
            <Paper sx={paperStyle}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center">
                  <Skeleton
                    animation="wave"
                    variant="circular"
                    sx={{ height: isAccountBalance ? 24 : 32, width: isAccountBalance ? 24 : 32 }}
                  />
                  <Skeleton animation="wave" variant="text" sx={{ height: 15, width: 70, ml: 1 }} />
                </Stack>
                <Stack direction="row">
                  <Skeleton animation="wave" variant="text" sx={{ height: 15, width: 70, ml: 1 }} />
                </Stack>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={{ xs: 1, md: 2, lg: 3 }}>
                {!isAccountBalance && <Skeleton animation="wave" variant="text" sx={{ height: 15, width: 120 }} />}
                {isAccountBalance && <div></div>}
                <Skeleton animation="wave" variant="text" sx={{ height: 20, width: 20 }} />
              </Stack>
            </Paper>
          </Stack>
        ))}
      </Stack>
    </div>
  );
};

export default SummarySkeleton;
