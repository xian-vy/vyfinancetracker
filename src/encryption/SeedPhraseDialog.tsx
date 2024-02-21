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
import React, { useEffect, useState } from "react";
import useSnackbarHook from "../hooks/snackbarHook";
import ForgotSeedPhrase from "./ForgotSeedPhrase";
import SeedPhraseInfo from "./SeedPhraseInfo";
import { generateSeedPhrase } from "./keyhandling";

const SeedPhraseDialog = ({
  salt,
  open,
  onConfirmSeed,
  onDeleteAccount,
}: {
  salt: Uint8Array | null;
  open: boolean;
  onConfirmSeed: (phrase: string) => void;
  onDeleteAccount?: () => void;
}) => {
  const [openInfo, setOpenInfo] = useState(false);
  const [openForgotSeedPhrase, setOpenForgotSeedPhrase] = useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [seedPhraseWords, setSeedPhraseWords] = useState<string[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(salt ? false : true);
  const [newSeedPhrase, setNewSeedPhrase] = useState<string>("");

  useEffect(() => {
    if (!salt) {
      const phrase = generateSeedPhrase();
      setNewSeedPhrase(phrase);
    }
  }, [salt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newSeedPhrase);
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
        setNewSeedPhrase(trimmedData);
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
    const file = new Blob([newSeedPhrase], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "vy-finance-tracker-seed-phrase.txt";
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element); // Clean up
    setIsButtonDisabled(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const newValue = (event.target as HTMLInputElement).value;
    setSeedPhraseWords((prevWords) => {
      const newWords = [...prevWords];
      newWords[index] = newValue;

      const newSeedPhrase = newWords.join(" ");
      setNewSeedPhrase(newSeedPhrase);

      if (newWords.length === 12 && newWords.every((word) => word.trim() !== "")) {
        setIsButtonDisabled(false);
      }
      return newWords;
    });
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
                Recovery Phrase Required
                <LockOutlined fontSize="small" sx={{ ml: 1 }} />
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
                    autoFocus={index === 0}
                    size="small"
                    focused={index === 0}
                    value={seedPhraseWords[index] || ""}
                    onPaste={handlePaste}
                    onChange={(event) => handleChange(event, index)}
                    sx={{ width: 120 }}
                    inputProps={{ style: { fontSize: "0.9rem" } }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack p={1} direction="row" justifyContent="center" alignItems="center">
              <Typography variant="subtitle1" mr={1}>
                {newSeedPhrase}
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
              <Button onClick={() => setOpenForgotSeedPhrase(true)}>I forgot my recovery phrase</Button>
            ) : (
              <Typography></Typography>
            )}
            <Button
              disabled={isButtonDisabled || ((salt || false) && seedPhraseWords.length === 0)}
              onClick={() => {
                if (isButtonDisabled) {
                  openSuccessSnackbar("Please Backup the Seed Phrase", true);
                }
                onConfirmSeed(newSeedPhrase);
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

export default React.memo(SeedPhraseDialog);
