import {
  BackupOutlined,
  CachedOutlined,
  CategoryOutlined,
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
        sx={{ maxWidth: { xs: "90%", sm: "80%", md: "56%", lg: "50%", xl: "55%", margin: "auto" } }}
      >
        {featuresData.map((feature, index) => (
          <Box key={index}>
            <Grow
              in={index <= visibleIndex}
              style={{ transformOrigin: "0  0  0", border: `solid   1px #333`, padding: 2 }}
              timeout={200}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ m: { xs: 0.3, lg: 0.5 }, borderRadius: 4, px: 1 }}
              >
                <Typography sx={{ fontSize: { xs: "0.75rem", lg: "0.85rem" } }} mx={1}>
                  {feature.description}
                </Typography>
                <feature.IconComponent sx={{ fontSize: { xs: "14px", sm: "16px", lg: "20px" }, mr: 0.5 }} />
              </Stack>
            </Grow>
          </Box>
        ))}
      </Stack>
    </div>
  );
};

export default Features;
