import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface Icon {
  name: string;
  icon: JSX.Element;
}

interface Props {
  icons: Icon[];
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  color: string;
}

const IconListComponent = ({ icons, selectedIcon, onIconSelect, color }: Props) => {
  // State to hold the outlined icons
  const [outlinedIcons, setOutlinedIcons] = useState<Icon[]>([]);
  // State to track the loading status of the icons
  const [loadingIcons, setLoadingIcons] = useState<boolean>(false);
  const [selected, setSelected] = useState<Icon | null>(null);

  // Function to load the icons
  const loadIcons = async () => {
    setLoadingIcons(true);
    // No need to filter the icons, as they are already outlined
    setOutlinedIcons(icons);
    setLoadingIcons(false);
  };

  const renderIcon = (icon: JSX.Element, color: string) => {
    return React.cloneElement(icon, { style: { color: color } });
  };

  useEffect(() => {
    if (selectedIcon) {
      const icon = icons.find((icon) => icon.name === selectedIcon);
      setSelected(icon || null);
    }
  }, [selectedIcon, icons]);

  const IconSelectComponent = (
    <FormControl fullWidth size="small">
      <InputLabel id="icon-select-label">Select Icon (Optional)</InputLabel>
      <Select
        size="small"
        labelId="icon-select-label"
        id="icon-select"
        value={selectedIcon || ""}
        onChange={(event) => {
          const iconName = event.target.value as string;
          onIconSelect(iconName);
        }}
        label="Select Icon (Optional)"
      >
        {outlinedIcons.map((iconObject) => {
          return (
            <MenuItem key={iconObject.name} value={iconObject.name}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {renderIcon(iconObject.icon, color)}
                <Typography align="left" variant="body1" pl={1}>
                  {iconObject.name}
                </Typography>
              </div>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );

  return { IconSelectComponent, loadIcons };
};

export default IconListComponent;
