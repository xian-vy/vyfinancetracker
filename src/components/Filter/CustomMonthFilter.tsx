import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Container, Dialog, DialogContent, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
interface Props {
  isFormOpen: boolean;
  closeForm: () => void;
  onFormSubmit: (month: Date, year: Date) => void;
}

const CustomMontFilter = (props: Props) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const [selectedYear, setSelectedYear] = React.useState(new Date());

  const handleDateChange = (date: Date | null) => {
    if (date !== null) {
      setSelectedMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setSelectedYear(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    } else {
      console.log("Invalid Month/Year");
    }
  };

  const handleCloseForm = () => {
    props.closeForm();
  };

  const handleFormSubmit = () => {
    // console.log("1" + selectedMonth + "-" + selectedYear);

    props.onFormSubmit(selectedMonth, selectedYear);
    props.closeForm();
  };

  return (
    <Dialog
      open={props.isFormOpen}
      onClose={handleCloseForm}
      PaperProps={{
        sx: { borderRadius: 2, background: isDarkMode ? "#1e1e1e" : "#fff", width: 300 },
      }}
    >
      <DialogContent sx={{ px: 0, pb: 3, pt: 2 }}>
        <Container maxWidth="xs">
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mr={-1}>
              <Typography variant="body2">Filter by Month</Typography>
              <IconButton size="small" onClick={handleCloseForm}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label={"Select Month and Year"}
                views={["month", "year"]}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
                reduceAnimations={powerSavingMode}
              />
            </LocalizationProvider>

            <Button variant="outlined" component="span" color="inherit" onClick={handleFormSubmit}>
              FILTER
            </Button>
          </Box>
        </Container>
      </DialogContent>
    </Dialog>
  );
};

export default CustomMontFilter;
