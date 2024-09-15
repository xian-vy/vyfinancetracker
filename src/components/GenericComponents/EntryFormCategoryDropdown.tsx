import React from "react";
import { FormControl, InputLabel, Select, MenuItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { iconSizeXS } from "../../constants/size";

interface CategoryModel {
  id: string;
  description: string;
  icon?: string;
  color?: string;
}

interface IconsList {
  name: string;
  icon: React.JSX.Element;
}

interface SelectDropdownProps {
  label: string;
  increaseLabel?: boolean;
  category_id: string;
  onChange: (category_id: string) => void;
  categories: CategoryModel[];
  onAddNewCategory?: () => void;
  icons: IconsList[];
  sx?: any;
}
function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
}

const EntryFormCategoryDropdown = ({
  label,
  increaseLabel,
  category_id,
  onChange,
  categories,
  onAddNewCategory,
  icons,
  sx,
}: SelectDropdownProps) => {
  const renderOption = (option: CategoryModel) => {
    const icon = icons.find((icon) => icon.name === option?.icon);

    return (
      <MenuItem key={option.id} value={option.id}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {icon && renderIcon(icon.icon, option.color || "#ccc")}
          <Typography
            align="left"
            variant="body1"
            pl={1}
            style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}
          >
            {option.description}
          </Typography>
        </div>
      </MenuItem>
    );
  };

  return (
    <FormControl fullWidth>
      <InputLabel id={`${label}-select-label`} shrink sx={{ fontSize: increaseLabel ? 15 : 13 }}>
        {label}
      </InputLabel>
      <Select
        size="small"
        labelId={`${label}-select-label`}
        id={`${label}-select`}
        required
        value={category_id}
        onChange={(e) => onChange(e.target.value as string)}
        label={label}
        sx={sx}
      >
        {onAddNewCategory && (
          <MenuItem value="" onClick={onAddNewCategory}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Add New" />
          </MenuItem>
        )}
        {categories.map(renderOption)}
      </Select>
    </FormControl>
  );
};

export default EntryFormCategoryDropdown;
