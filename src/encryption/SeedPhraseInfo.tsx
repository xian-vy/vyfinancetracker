import { Typography } from "@mui/material";
import React from "react";
import GenericDialog from "../components/Dialog/GenericDialog";

const SeedPhraseInfo = ({ openInfo, onClose }: { openInfo: boolean; onClose: () => void }) => {
  return (
    <div>
      <GenericDialog
        open={openInfo}
        handleClose={onClose}
        title="Secret Recovery Phrase"
        content={
          <>
            <Typography variant="body2" textAlign="center" mt={2} gutterBottom>
              A Secret Recovery Phrase is a randomly generated sequence of words that serve as a key to unlock your
              encrypted data.
            </Typography>
            <Typography variant="body2" textAlign="center" gutterBottom>
              It is unique to each user and is not shared with anyone, including the service that created it
            </Typography>
            <Typography variant="body2" textAlign="center" gutterBottom>
              In the event of a device change or data loss, your Secret Recovery Phrase is essential for restoring your
              encrypted data. Without it, you will lose access to all your data permanently.
            </Typography>
          </>
        }
      />
    </div>
  );
};

export default SeedPhraseInfo;
