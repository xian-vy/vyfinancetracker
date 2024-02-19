import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface EntryFormDatePickerProps<T> {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  newData: T;
  setNewData: (expense: T) => void;
  label?: string;
  datefield?: string;
}

const EntryFormDatePicker = <T extends object>({
  selectedDate,
  setSelectedDate,
  newData,
  setNewData,
  label = "Select a Date",
  datefield = "date",
}: EntryFormDatePickerProps<T>) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          slotProps={{ textField: { size: "small" } }}
          label={label}
          value={selectedDate}
          views={["year", "month", "day"]}
          onChange={(newValue) => {
            if (newValue) {
              setSelectedDate(newValue);
              setNewData({
                ...newData,
                [datefield]: Timestamp.fromDate(newValue),
              });
            }
          }}
          reduceAnimations={powerSavingMode}
          sx={{ width: "100%" }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default EntryFormDatePicker;
