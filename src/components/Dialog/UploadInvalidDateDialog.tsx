import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import React from "react";

interface MSGProps {
  isDialogOpen: boolean;
  msgTitle: string;
  msgHeader: string;
  msgBody: { rowNumber: string; description: string; date: string }[];
  onClose: () => void;
  bg: string;
}

const UploadInvalidDateDialog: React.FC<MSGProps> = ({ isDialogOpen, msgTitle, msgHeader, msgBody, onClose, bg }) => {
  return (
    <div>
      <Dialog open={isDialogOpen}>
        <DialogTitle variant="body2" sx={{ background: bg }}>
          {msgTitle}
        </DialogTitle>
        <DialogContent sx={{ background: bg }}>
          <Typography variant="body2" mb={2}>
            {msgHeader}
          </Typography>

          {msgBody.map((message, index) => (
            <Box key={index}>
              <Typography variant="body1" textAlign="center">
                <span style={{ color: "dodgerblue" }}> {"Row " + "[" + message.rowNumber + "]"} </span>
              </Typography>
              <Typography variant="body1">
                <span style={{ color: "#2196f3" }}>Description: </span>
                {message.description}
              </Typography>
              <Typography variant="body1">
                <span style={{ color: "#2196f3" }}>Date: </span>
                <span>{message.date}</span>
              </Typography>
              <Divider />
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ background: bg }}>
          <Button onClick={onClose}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UploadInvalidDateDialog;
