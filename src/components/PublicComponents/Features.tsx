import {
  BackupOutlined,
  CachedOutlined,
  CategoryOutlined,
  DevicesOutlined,
  EnergySavingsLeafOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { Box, Grow, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const featuresData = [
  {
    description: "End to End Encryption",
    IconComponent: LockOutlined,
  },
  {
    description: "Backup and sync",
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
    IconComponent: DevicesOutlined,
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
        sx={{ px: { xs: 0, sm: 8, md: 24, lg: 34, xl: 64 } }}
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
                justifyContent="space-between"
                sx={{ m: { xs: 0.3, md: 0.5 }, borderRadius: 4, px: 1 }}
              >
                <Typography sx={{ fontSize: { xs: "0.75rem", md: "0.85rem" } }} mx={1}>
                  {feature.description}
                </Typography>
                <feature.IconComponent sx={{ fontSize: { xs: "14px", sm: "16px", md: "20px" }, mr: 0.5 }} />
              </Stack>
            </Grow>
          </Box>
        ))}
      </Stack>
    </div>
  );
};

export default Features;
