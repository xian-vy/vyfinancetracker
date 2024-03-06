import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { signOutWithGoogle } from "../../helper/AuthHelper";
import incognito from "../../media/incognito.svg";
import { iconSizeXS } from "../../constants/size";
import { getPersistenceID } from "../../firebase/UsersService";
import { RootState } from "../../redux/store";
import GenericDialog from "../Dialog/GenericDialog";
import SignOutConfirmationDialog from "../Dialog/SignOutConfirmationDialog";
import PendingWrites from "./PendingWrites";
import TotalNetWorth from "./TotalNetWorth";

const AccountIcon = ({ isLoading, collapsedDrawer }: { isLoading: boolean; collapsedDrawer: boolean }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const user = useSelector((state: RootState) => state.auth.user);
  const persistenceID = useSelector((state: RootState) => state.auth.persistentId);

  const photoURL = user ? user.photoURL : null;
  const email = user?.isAnonymous ? "Anonymous User" : user ? user.email : "";
  const displayName = user ? user.displayName : "";
  const firstLetter = email ? email.charAt(0).toUpperCase() : "";
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [openSignOutDialog, setOpenSignOutDialog] = React.useState(false);
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);

  const handleSignOut = async () => {
    setAnchorEl(null);
    const pendingWritesCount = parseInt(localStorage.getItem("pendingWritesCount" + persistenceID) || "0", 10);
    if (pendingWritesCount > 0) {
      // await waitForPendingWrites(db);
      setOpenSignOutDialog(true);
    } else {
      //warn anonymous user signout
      if (user?.isAnonymous) {
        setOpenSignOutDialog(true);
        return;
      }
      const persistenceID = await getPersistenceID();
      signOutWithGoogle();
      Object.keys(localStorage).forEach((key) => {
        if (key.endsWith(persistenceID)) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  return (
    <div>
      <Box
        sx={{
          py: user?.isAnonymous ? 0.8 : 1.5,
          pl: collapsedDrawer ? 0.5 : 1.5,
          pr: 0.5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          src={photoURL || undefined}
          style={{
            backgroundColor: user?.isAnonymous ? "#333" : photoURL ? undefined : "#00897b",
            color: user?.isAnonymous ? "#fff" : "inherit",
            width: 30,
            height: 30,
            WebkitTapHighlightColor: "transparent",
            cursor: "pointer",
          }}
          onClick={(event) => handleClick(event)}
        >
          {user?.isAnonymous ? (
            <img src={incognito} alt="Anonymous Icon" style={{ width: "20px", height: "20px" }} />
          ) : !photoURL ? (
            firstLetter
          ) : null}
        </Avatar>

        {!collapsedDrawer && (
          <>
            <Box sx={{ display: "flex", flexDirection: "column", pl: 1, width: "75%" }}>
              {displayName && (
                <Typography
                  textAlign="left"
                  variant="h6"
                  sx={{
                    height: "1.1rem",
                  }}
                  noWrap
                >
                  {displayName}
                </Typography>
              )}
              <Typography
                textAlign="left"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  height: "1rem",
                  fontSize: "0.7rem",
                }}
              >
                {email}
              </Typography>
            </Box>
            <IconButton onClick={(event) => handleClick(event)} sx={{ px: collapsedDrawer ? 0.5 : 1 }}>
              <ArrowDropDownOutlinedIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      <TotalNetWorth collapsedDrawer={collapsedDrawer} />

      {!collapsedDrawer && !user?.isAnonymous && <Divider sx={{ mx: 2 }} />}

      {!collapsedDrawer && user?.isAnonymous && (
        <Paper
          variant="outlined"
          sx={{
            p: 1,
            mx: 1.5,
            borderRadius: 2,
            bgcolor: isDarkMode ? "#1e1e1e" : "#fff",
            borderColor: isDarkMode ? "#333" : "#ccc",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Typography sx={{ fontSize: "0.6rem" }}>
            To keep your data synced across devices,Link your account in Settings
          </Typography>
          <InfoOutlinedIcon
            onClick={() => setOpenInfoDialog(true)}
            sx={{
              ml: 0.5,
              fontSize: iconSizeXS,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              color: isDarkMode ? "#ccc" : "#666",
            }}
          />
        </Paper>
      )}

      {!collapsedDrawer &&
        (isLoading ? (
          <Stack direction="row" px={3} my={0.5} justifyContent="space-between">
            <Skeleton variant="text" sx={{ mr: 1, flexGrow: 1 }} />
            <Skeleton variant="circular" height={18} width={18} />
          </Stack>
        ) : (
          <PendingWrites />
        ))}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <List sx={{ minWidth: "140px" }}>
          <ListItemButton onClick={handleSignOut}>
            <ListItemIcon sx={{ minWidth: "30px" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </List>
      </Popover>

      <SignOutConfirmationDialog open={openSignOutDialog} onDialogClose={() => setOpenSignOutDialog(false)} />

      <GenericDialog
        open={openInfoDialog}
        handleClose={() => setOpenInfoDialog(false)}
        title="Anonymous Account"
        content={
          <>
            <Typography variant="body1" gutterBottom mt={2}>
              Your data is binded to the current device and current sign in session.
            </Typography>
            <Typography variant="body1" gutterBottom>
              When you sign out or in the event of an unexpected issue, your data will be lost.
            </Typography>
            <Typography variant="body1">
              We recommend linking account to sync/backup data automatically and to access your data across multiple
              devices.
            </Typography>
          </>
        }
      />
    </div>
  );
};

export default React.memo(AccountIcon);
