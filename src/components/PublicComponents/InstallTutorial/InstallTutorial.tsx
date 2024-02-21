import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import CloseIcon from "@mui/icons-material/Close";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import React from "react";
import { getOperatingSystem } from "../../../helper/utils";
import InstallAndroid from "./InstallAndroid";
import InstallIOS from "./InstallIOS";
import InstallWindows from "./InstallWindows";

const InstallTutorial = ({ onDialogClose }: { onDialogClose: () => void }) => {
  const platform = getOperatingSystem();

  let instruction: JSX.Element | null = null;

  switch (platform) {
    case "Windows":
    case "MacOS":
    case "Linux":
      instruction = (
        <>
          <Stack direction="row" justifyContent="center" alignItems="center" my={1}>
            <Typography variant="body2" mr={1}>
              Click the install badge in the url to install app
            </Typography>
            <InstallDesktopIcon />
          </Stack>
          <InstallWindows />
        </>
      );

      break;
    case "Android":
      instruction = (
        <>
          <Stack direction="row" justifyContent="center" alignItems="center" my={0.5}>
            <Typography variant="body2" textAlign="center" mr={1}>
              Step 1 - tap the menu
            </Typography>
            <MoreVertOutlinedIcon />
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center" my={0.5}>
            <Typography variant="body2" textAlign="center" mr={1}>
              Step 2 - Install or Add to Homescreen
            </Typography>
            <InstallMobileIcon />
          </Stack>

          <InstallAndroid />
        </>
      );

      break;
    case "iOS":
      instruction = (
        <>
          <Stack direction="row" justifyContent="center" alignItems="center" my={0.5}>
            <Typography variant="body2" textAlign="center" mr={1}>
              Step 1 - tap the share icon
            </Typography>
            <IosShareOutlinedIcon />
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center" my={0.5}>
            <Typography variant="body2" textAlign="center" mr={1}>
              Step 2 - choose Add to Homescreen
            </Typography>
            <AddBoxOutlinedIcon />
          </Stack>

          <InstallIOS />
        </>
      );
      break;
    default:
      break;
  }

  return (
    <>
      <DialogTitle align="right" sx={{ pb: 0, pt: 1, backgroundColor: "#1e1e1e" }}>
        <IconButton
          color="inherit"
          onClick={() => {
            onDialogClose();
          }}
          aria-label="close"
          sx={{ mr: -2 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "#1e1e1e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {instruction}
      </DialogContent>
    </>
  );
};

export default InstallTutorial;
