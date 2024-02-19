import CloseIcon from "@mui/icons-material/Close";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Divider, IconButton, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { ThemeColor } from "../../Helper/utils";
import { iconSizeSM, iconSizeXS } from "../../constants/Sizes";
import { RootState } from "../../redux/store";

interface Props {
  closeForm: () => void;
  loading: boolean;
}
const ThemeToggle = React.lazy(() => import("./ThemeToggle"));
const PowerSavingToggle = React.lazy(() => import("./PowerSavingToggle"));
const FontSizeToggle = React.lazy(() => import("./FontSizeToggle"));
const TimeframeToggle = React.lazy(() => import("./TimeframeToggle"));
const DeleteAccount = React.lazy(() => import("./DeleteAccount"));
const LinkAccount = React.lazy(() => import("./LinkAccount"));

const SettingsForm: React.FC<Props> = ({ closeForm, loading }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
        px={3}
        py={{ xs: 0.5, lg: 1 }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <div style={{ display: "flex", alignItems: "center" }}>
              <SettingsOutlinedIcon sx={{ color: ThemeColor(theme), mr: 1, fontSize: iconSizeXS }} />
              <Typography textAlign="left" variant="body1" sx={{ color: ThemeColor(theme) }}>
                Settings
              </Typography>
            </div>
            <IconButton onClick={() => closeForm()} sx={{ mr: -1 }}>
              <CloseIcon
                style={{
                  cursor: "pointer",
                  fontSize: iconSizeSM,
                }}
              />
            </IconButton>
          </Stack>

          <Divider sx={{ marginBottom: "10px" }} />
          {/* Timeframe Toggle ---------------------------------------------------------------------------*/}
          <Typography variant="caption" textAlign="center">
            Default Timeframe
          </Typography>
          <Stack direction="row" justifyContent="center" sx={{ mb: 1 }}>
            <React.Suspense fallback={<Skeleton variant="text" width={150} height={30} sx={{ borderRadius: 3 }} />}>
              <TimeframeToggle />
            </React.Suspense>
          </Stack>
          {/* Theme Toggle----------------------------------------------------------------------------------*/}
          <Typography variant="caption" textAlign="center">
            Theme
          </Typography>
          <Stack direction="row" justifyContent="center" mb={1}>
            <React.Suspense fallback={<Skeleton variant="text" width={150} height={30} sx={{ borderRadius: 3 }} />}>
              <ThemeToggle loading={loading} />
            </React.Suspense>
          </Stack>
          {/* Power Saving --------------------------------------------------------------------------------*/}
          <Typography variant="caption" textAlign="center">
            Power Saving
          </Typography>
          <Stack direction="row" justifyContent="center" mb={1}>
            <React.Suspense fallback={<Skeleton variant="text" width={150} height={30} sx={{ borderRadius: 3 }} />}>
              <PowerSavingToggle isDarkMode={isDarkMode} />
            </React.Suspense>
          </Stack>
          {/* Text Size ------------------------------------------------------------------------------------*/}
          <Typography variant="caption" textAlign="center">
            Text Size
          </Typography>
          <Stack direction="row" justifyContent="center">
            <React.Suspense fallback={<Skeleton variant="text" width={150} height={30} sx={{ borderRadius: 3 }} />}>
              <FontSizeToggle isDarkMode={isDarkMode} />
            </React.Suspense>
          </Stack>
        </Box>
        <div>
          {/* Link & Delete Account ----------------------------------------------------------------------*/}
          <Stack direction="column" justifyContent="center" alignItems="center" mb={1}>
            {user?.isAnonymous && (
              <React.Suspense fallback={<Skeleton variant="text" width={150} height={30} sx={{ borderRadius: 3 }} />}>
                <LinkAccount />
              </React.Suspense>
            )}
            <React.Suspense fallback={<Skeleton variant="text" width={150} height={30} sx={{ borderRadius: 3 }} />}>
              <DeleteAccount />
            </React.Suspense>
          </Stack>
        </div>
      </Box>
    </>
  );
};

export default SettingsForm;
