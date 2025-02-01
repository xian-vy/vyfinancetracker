import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
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
import { iconSizeXS } from "../../constants/size";
import { getPersistenceID } from "../../firebase/UsersService";
import { signOutWithGoogle } from "../../helper/AuthHelper";
import { RootState } from "../../redux/store";
import GenericDialog from "../Dialog/GenericDialog";
import SignOutConfirmationDialog from "../Dialog/SignOutConfirmationDialog";
import PendingWrites from "./PendingWrites";
import TotalNetWorth from "./TotalNetWorth";
import logo from "../../media/vylogonew.png";

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
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            width="100%"
            my={1}
            gap={1}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "28px",
                height: "28px",

              }}
              />
           <Typography
           variant="body2"
            component="h1"
            align="center"
            sx={{
              color: isDarkMode ? "#ccc" : "#333",
              fontWeight:600
            }}
          >
            VY FINANCE TRACKER
          </Typography>
          </Stack>
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
            backgroundColor: isDarkMode ? "#333" : "#eaeaea",
            color: user?.isAnonymous ? "#fff" : "inherit",
            width: 30,
            height: 30,
            WebkitTapHighlightColor: "transparent",
            cursor: "pointer",
          }}
          onClick={(event) => handleClick(event)}
        >
          {user?.isAnonymous ? (
            <PersonIcon sx={{ fontSize: 18, color: isDarkMode ? "#ccc" : "#666" }} />
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
                  height: "1.2rem",
                  fontSize: user?.isAnonymous ? "0.85rem" : "0.7rem",
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
          <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },px:1 }}>
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
            <Typography variant="body1" gutterBottom mt={2} textAlign="center">
              Your data is binded to the current device and current sign in session.
            </Typography>
            <Typography variant="body1" gutterBottom textAlign="center">
              When you sign out or in the event of an unexpected issue, your data will be lost.
            </Typography>
            <Typography variant="body1" textAlign="center">
              Link account in Settings to sync/backup data automatically and to access your data across multiple
              devices.
            </Typography>
          </>
        }
      />
    </div>
  );
};

export default React.memo(AccountIcon);
