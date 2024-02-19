import { Dialog, DialogContent, DialogTitle, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
interface LoadingDialogProps {
  type: string;
  isLoading: boolean;
}

const UploadingDialog: React.FC<LoadingDialogProps> = ({ isLoading, type }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const uploadProgress = useSelector((state: RootState) => state.expenses.uploadProgress);
  const isUploading = useSelector((state: RootState) => state.expenses.isUploading);
  // const uploadCount = useSelector((state: RootState) => state.expenses.uploadCount);
  // const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   if (isLoading) {
  //     setOpen(true);
  //   }
  // }, [isLoading]);

  return (
    <Dialog open={isUploading} aria-labelledby="loading-dialog-title" maxWidth="md" fullWidth>
      <DialogTitle id="loading-dialog-title" sx={{ backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}>
        {/* {isUploading ? ( */}
        <Stack direction="column">
          <Stack direction="row" justifyContent="center">
            <>
              <Typography variant="body1" mr={1}>
                Uploading {type}:
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {Math.round(uploadProgress)}%
              </Typography>
            </>
          </Stack>
          <LinearProgress color="inherit" variant="determinate" value={uploadProgress} sx={{ mt: 2, height: 5 }} />
        </Stack>
        {/* ) : (
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Typography color="green" variant="body2">
              {uploadCount}
              {" expenses uploaded"}
            </Typography>
            <TaskAltOutlinedIcon fontSize="small" sx={{ ml: 1, color: "green" }} />
          </Stack>
        )} */}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: isDarkMode ? "#1e1e1e" : "#fff", px: { xs: 0, md: 2 } }}>
        {/* <div
          style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "10px", marginTop: "10px" }}
        >
        </div> */}

        {/* <Stack direction="row" justifyContent="flex-end" mr={{ xs: 2, md: 0 }} mt={2}>
          <Button color="info" variant="outlined" onClick={() => setOpen(false)} disabled={isUploading}>
            Close
          </Button>
        </Stack> */}
      </DialogContent>
    </Dialog>
  );
};

export default UploadingDialog;
