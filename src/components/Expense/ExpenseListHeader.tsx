import { Add as AddIcon } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { IconButton, InputAdornment, InputBase, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { SORT_TYPE } from "../../constants/constants";
import { iconSizeXS } from "../../constants/size";
import { ThemeColor } from "../../helper/utils";
import { useActionPopover } from "../../hooks/actionHook";
import CustomIconButton from "../CustomIconButton";

interface ExpenseListActionProps {
  onformOpen: () => void;
  onSearch: (searchItem: string) => void;
  onSortChange: (sortBy: SORT_TYPE) => void;
}

const ExpenseListHeader: React.FC<ExpenseListActionProps> = ({ onformOpen, onSearch, onSortChange }) => {
  const [searchValue, setSearchValue] = React.useState("");

  const handleAction = (action: string, fodder: string) => {
    onSortChange(action as SORT_TYPE);
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [SORT_TYPE.date, SORT_TYPE.amount],
    handleAction,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onSearch("");
  };
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <div>
      <Stack justifyContent="flex-end" direction="row" alignItems="center" sx={{ pr: { xs: 0, sm: 1, md: 2 } }}>
        <Stack
          sx={{
            border: `1px solid ${isDarkMode ? "#333" : "#ccc"}`,
            borderRadius: 2,
            textAlign: "left",
            flexGrow: 1,
            maxWidth: { md: 350, lg: 500, xl: 800 },
            pl: 0.5,
            ml: { xs: 0, sm: 1 },
          }}
        >
          <InputBase
            onChange={handleSearchChange}
            placeholder="Search by description"
            value={searchValue}
            startAdornment={<SearchOutlinedIcon sx={{ fontSize: iconSizeXS, mr: 0.5 }} />}
            endAdornment={
              searchValue && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
            style={{
              paddingLeft: 5,
            }}
          />
        </Stack>

        <CustomIconButton type="filter" onClick={(event) => handleActionOpen(event, "fodder")}>
          <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
            Sort
          </Typography>

          <SwapVertIcon sx={{ fontSize: iconSizeXS }} />
        </CustomIconButton>

        <CustomIconButton onClick={onformOpen} type="add">
          <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
            New
          </Typography>
          <AddIcon sx={{ fontSize: iconSizeXS }} />
        </CustomIconButton>
      </Stack>

      {ActionPopover}
    </div>
  );
};

export default ExpenseListHeader;
