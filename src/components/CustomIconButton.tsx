import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import React from "react";
interface CustomIconButtonProps {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  style?: React.CSSProperties;
  type: string;
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ children, onClick, style, type }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const backgroundColor = isDarkMode ? "#353434" : "#fff";
  // if (type === "filter") {
  //   backgroundColor = isDarkMode ? "#353434" : "#e8f7fa";
  // } else {
  //   backgroundColor = isDarkMode ? "#343434" : "#daf7db";
  // }

  return (
    <IconButton
      onClick={onClick}
      sx={{
        backgroundColor: backgroundColor,
        // border: `solid 1px ${isDarkMode ? "#333" : "#b3e1eb"}`,
        border: `solid 1px ${isDarkMode ? "#333" : "#ccc"}`,
        borderRadius: 2,
        py: 0.4,
        pr: 0.4,
        ml: 1,
        ...style,
      }}
    >
      {children}
    </IconButton>
  );
};

export default CustomIconButton;
