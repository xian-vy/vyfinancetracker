import React, { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  BackupOutlined,
  EnergySavingsLeafOutlined,
  CategoryOutlined,
  CheckOutlined,
  CloudSyncOutlined,
  CachedOutlined,
  DevicesOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { Grow } from "@mui/material";

const featuresData = [
  {
    description: "End to End Encryption",
    IconComponent: LockOutlined,
  },
  {
    description: "Cross Platform",
    IconComponent: DevicesOutlined,
  },
  {
    description: "Data backup and sync",
    IconComponent: BackupOutlined,
  },
  {
    description: "Power Saving Mode",
    IconComponent: EnergySavingsLeafOutlined,
  },

  {
    description: "Customizable colors and icons",
    IconComponent: CategoryOutlined,
  },
  {
    description: "Cache optimized for minimal data usage",
    IconComponent: CachedOutlined,
  },
  {
    description: "Available Offline and on the Web",
    IconComponent: CloudSyncOutlined,
  },
];

const Features = () => {
  const [visibleIndex, setVisibleIndex] = useState(-1);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (visibleIndex < featuresData.length - 1) {
      timerId = setTimeout(() => {
        setVisibleIndex((prevIndex) => prevIndex + 1);
      }, 200);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [visibleIndex]);
  return (
    <div>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="center"
        flexWrap="wrap"
        sx={{ px: { xs: 2, sm: 8, md: 24, lg: 34, xl: 64 } }}
      >
        {featuresData.map((feature, index) => (
          <Box key={index}>
            <Grow
              in={index <= visibleIndex}
              style={{ transformOrigin: "0  0  0", border: `solid   1px #333`, padding: 3 }}
              timeout={200}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ m: { xs: 0.3, md: 0.5 }, borderRadius: 4 }}
              >
                <CheckOutlined sx={{ fontSize: "12px", mr: 0.2 }} />
                <Typography sx={{ fontSize: { xs: "0.75rem", md: "0.85rem" } }} mr={1}>
                  {feature.description}
                </Typography>
                <feature.IconComponent sx={{ fontSize: { xs: "14px", sm: "16px", md: "20px" }, mr: 0.3 }} />
              </Stack>
            </Grow>
          </Box>
        ))}
      </Stack>
    </div>
  );
};

export default Features;
