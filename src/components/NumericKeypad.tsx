import React, { useEffect } from "react";
import { Button, Box, useTheme } from "@mui/material";

interface NumericKeypadProps {
  onInput: (input: string) => void;
  onClear: () => void;
  disabled: boolean;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ onInput, onClear, disabled }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."].includes(key)) {
        onInput(key);
      } else if (key === "Escape") {
        // Assuming 'Escape' key is used to clear
        onClear();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onInput, onClear]);

  return (
    <Box display="flex" flexWrap="wrap" justifyContent="space-evenly" my={1}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."].map((input) => (
        <Button
          key={input}
          variant="outlined"
          color="inherit"
          onClick={() => onInput(input)}
          disabled={disabled}
          sx={{ width: "2.5em", margin: "2px", borderColor: isDarkMode ? "#454545" : "#ccc", fontSize: "0.75rem" }}
        >
          {input}
        </Button>
      ))}

      <Button
        variant="outlined"
        color="inherit"
        onClick={onClear}
        disabled={disabled}
        sx={{ width: "2.5em", margin: "2px", borderColor: isDarkMode ? "#454545" : "#ccc", fontSize: "0.75rem" }}
      >
        C
      </Button>
    </Box>
  );
};

export default NumericKeypad;
