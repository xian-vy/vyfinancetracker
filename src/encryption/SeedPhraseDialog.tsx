import { LockOutlined } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import useSnackbarHook from "../hooks/snackbarHook";
import ForgotSeedPhrase from "./ForgotSeedPhrase";
import SeedPhraseInfo from "./SeedPhraseInfo";

const SeedPhraseDialog = ({
  salt,
  open,
  onConfirmSeed,
  onDeleteAccount,
  seedPhrase,
  setSeedPhrase,
}: {
  salt: Uint8Array | null;
  open: boolean;
  onConfirmSeed: () => void;
  onDeleteAccount?: () => void;
  seedPhrase: string;
  setSeedPhrase: (phrase: string) => void;
}) => {
  const [openInfo, setOpenInfo] = useState(false);
  const [openForgotSeedPhrase, setOpenForgotSeedPhrase] = useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [seedPhraseWords, setSeedPhraseWords] = useState<string[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(salt ? false : true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase);
      setIsButtonDisabled(false);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      const trimmedData = clipboardData.trim();
      const words = trimmedData.split(" ");
      if (words.length === 12) {
        setSeedPhraseWords(words);
        setSeedPhrase(trimmedData);
        setIsButtonDisabled(false);
      } else {
        openSuccessSnackbar("Invalid Seed Phrase.", true);
      }
    } catch (err) {
      console.error("Failed to paste text: ", err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([seedPhrase], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "vy-finance-tracker-seed-phrase.txt";
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element); // Clean up
    setIsButtonDisabled(false);
  };
  return (
    <>
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, background: isDarkMode ? "#1e1e1e" : "#fff" },
        }}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0,  0,  0,  0.9)" },
          },
        }}
      >
        <DialogTitle>
          {!salt && (
            <Typography
              mr={1}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1rem",
              }}
              gutterBottom
            >
              Secret Recovery Phrase
              <HelpOutlineOutlinedIcon
                fontSize="small"
                sx={{ ml: 1, cursor: "pointer" }}
                onClick={() => setOpenInfo(true)}
              />
            </Typography>
          )}
          {salt ? (
            <>
              <Typography
                textAlign="center"
                sx={{ mb: 1, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1rem" }}
              >
                Seed Phrase Required
                <LockOutlined fontSize="small" sx={{ ml: 1 }} />
              </Typography>
              <Typography textAlign="center" mr={1} gutterBottom variant="body2">
                Paste your recovery Seed Phrase on the first input field
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" textAlign="center" mr={1} sx={{ color: "salmon" }}>
                This phrase is required for accessing your account data if you change device or if data storage is
                cleared.
              </Typography>
              <Typography variant="body2" textAlign="center" mr={1} sx={{ color: "salmon" }}>
                This is the only time you can backup this.
              </Typography>
            </>
          )}
        </DialogTitle>
        <DialogContent dividers={!salt} sx={{ p: 1, mx: salt ? 1 : 2 }}>
          {salt ? (
            <Grid container justifyContent="space-evenly" spacing={2}>
              {[...Array(12)].map((_, index) => (
                <Grid item key={index} px={0}>
                  <TextField
                    disabled={index !== 0}
                    autoFocus={index === 0}
                    size="small"
                    focused={index === 0}
                    value={seedPhraseWords[index] || ""}
                    onPaste={index === 0 ? handlePaste : undefined}
                    sx={{ width: 120 }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack p={1} direction="row" justifyContent="center" alignItems="center">
              <Typography variant="subtitle1" mr={1}>
                {seedPhrase}
              </Typography>
              <IconButton onClick={handleCopy} aria-label="copy seed phrase">
                <ContentCopyIcon />
              </IconButton>
              <IconButton onClick={handleDownload} aria-label="download seed phrase">
                <DownloadIcon />
              </IconButton>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", px: { xs: 0, sm: 1 } }}>
            {salt ? (
              <Button onClick={() => setOpenForgotSeedPhrase(true)}>I forgot my seed phrase</Button>
            ) : (
              <Typography></Typography>
            )}
            <Button
              disabled={isButtonDisabled || ((salt || false) && seedPhraseWords.length === 0)}
              onClick={() => {
                if (isButtonDisabled) {
                  openSuccessSnackbar("Please Backup the Seed Phrase", true);
                }
                setSeedPhraseWords([]);
                onConfirmSeed();
              }}
              color="primary"
            >
              {salt ? "Confirm" : "Backup Done"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <SeedPhraseInfo onClose={() => setOpenInfo(false)} openInfo={openInfo} />
      <ForgotSeedPhrase
        onClose={() => setOpenForgotSeedPhrase(false)}
        isDarkMode={isDarkMode}
        openForgotSeedPhrase={openForgotSeedPhrase}
        onDeleteAccount={onDeleteAccount}
      />
      {SnackbarComponent}
    </>
  );
};

export default SeedPhraseDialog;
