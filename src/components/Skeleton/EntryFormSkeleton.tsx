import { Skeleton, Stack } from "@mui/material";
import React from "react";

const EntryFormSkeleton = ({ items = 5 }: { items?: number }) => {
  return (
    <Stack direction="column" alignItems="center" sx={{ width: "100%" }} spacing={1.5} padding={1.5}>
      <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
        <Skeleton variant="text" width={120} />
        <Skeleton variant="circular" height={22} width={22} />
      </Stack>
      {[...Array(items)].map((_, index) => (
        <Skeleton variant="text" key={index} height={40} width="100%" />
      ))}
    </Stack>
  );
};

export default EntryFormSkeleton;
