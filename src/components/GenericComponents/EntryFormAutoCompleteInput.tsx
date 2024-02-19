import React from "react";
import { Autocomplete, TextField } from "@mui/material";

interface AutocompleteInputProps {
  options: string[];
  value: string;
  onInputChange: (event: React.SyntheticEvent, newInputValue: string) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  inputRef: React.RefObject<HTMLInputElement>;
}

const EntryFormAutoCompleteInput: React.FC<AutocompleteInputProps> = ({
  options,
  value,
  onInputChange,
  onChange,
  label = "Description",
  inputRef,
}) => {
  return (
    <Autocomplete
      freeSolo
      options={options}
      inputValue={value}
      onInputChange={onInputChange}
      componentsProps={{
        popper: {
          modifiers: [
            {
              name: "flip",
              enabled: false,
            },
            {
              name: "preventOverflow",
              enabled: false,
            },
          ],
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={label}
          inputRef={inputRef}
          onChange={onChange}
          InputLabelProps={{ shrink: true }}
        />
      )}
    />
  );
};

export default EntryFormAutoCompleteInput;
