import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import CloseIcon from "@mui/icons-material/Close";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
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
          <Stack direction="row" justifyContent="flex-start" alignItems="center" my={1}>
            <Typography textAlign="center" mr={1} sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
              Click the install badge in the url to install app
            </Typography>
            <InstallDesktopIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </Stack>
          <InstallWindows />
        </>
      );

      break;
    case "Android":
      instruction = (
        <>
          <Stack direction="row" justifyContent="flex-start" alignItems="center" my={0.5}>
            <Typography textAlign="center" mr={1} sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
              Step 1 - tap the menu
            </Typography>
            <MoreVertOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center" mt={0.5} mb={2}>
            <Typography textAlign="center" mr={1} sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
              Step 2 - Install or Add to Homescreen
            </Typography>
            <InstallMobileIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </Stack>

          <InstallAndroid />
        </>
      );

      break;
    case "iOS":
      instruction = (
        <>
          <Stack direction="row" justifyContent="flex-start" alignItems="center" my={0.5}>
            <Typography textAlign="center" mr={1} sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
              Step 1 - tap the share icon
            </Typography>
            <IosShareOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center" mt={0.5} mb={2}>
            <Typography textAlign="center" mr={1} sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
              Step 2 - tap Add to Homescreen
            </Typography>
            <AddBoxOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
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
      <DialogTitle align="right" sx={{ pb: 0, pt: 1, background:  "#1e1e1e"  }}>
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
          px: { xs: 2, sm: 3 },
          py: 3,
          background:"#1e1e1e",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {instruction}
      </DialogContent>
    </>
  );
};

export default InstallTutorial;
