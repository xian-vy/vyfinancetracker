import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  List,
  ListItemButton,
  Popover,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import CategoryIcons from "../media/CategoryIcons";
import { iconSizeSM, iconSizeXS } from "../constants/size";
import { useCategoryContext } from "../contextAPI/CategoryContext";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useCategoryList = () => {
  const { categories } = useCategoryContext();
  const [selectedCategory, setSelectedCategory] = useState<string[]>(["All Categories"]);
  const [filterOpenCategory, setFilterOpenCategory] = useState(false);
  const [anchorElCategory, setAnchorElCategory] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory((prevCategories) => {
      if (category === "All Categories" && prevCategories.includes("All Categories")) {
        return [];
      } else if (category === "All Categories" && !prevCategories.includes("All Categories")) {
        return ["All Categories"];
      } else if (category !== "All Categories" && prevCategories.includes("All Categories")) {
        //initial state is just label All Categories, so need to map first and remove the desselected category
        return categories.map((cat) => cat.description).filter((c) => c !== category);
      } else if (prevCategories.includes(category)) {
        return prevCategories.filter((c) => c !== category);
      } else {
        return [...prevCategories, category];
      }
    });
  };

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeSM } });
  }

  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorElCategory(event.currentTarget);
    setFilterOpenCategory(!anchorElCategory);
  };

  const handleCategoryFilterClose = () => {
    setAnchorElCategory(null);
    setFilterOpenCategory(false);
  };

  const iconMap = useMemo(() => new Map(CategoryIcons.map((icon) => [icon.name, icon.icon])), []);

  const renderCategoryList = () => {
    const listItems = ["All Categories", ...categories].map((category, index) => {
      let categoryIcon: React.ReactElement | undefined;
      if (typeof category !== "string" && iconMap.has(category.icon)) {
        categoryIcon = iconMap.get(category.icon);
      }
      return (
        <ListItemButton
          key={index}
          onClick={() => handleCategoryChange(typeof category === "string" ? category : category.description)}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={
                selectedCategory.includes("All Categories") ||
                selectedCategory.includes(typeof category === "string" ? category : category.description)
              }
              onClick={(event) => {
                event.stopPropagation();
                handleCategoryChange(typeof category === "string" ? category : category.description);
              }}
              sx={{ py: 0, px: 0.1 }}
            />
            {categoryIcon && renderIcon(categoryIcon, typeof category === "string" ? category : category.color)}
            <Typography align="left" variant="body1" pl={0.5}>
              {typeof category === "string" ? category : category.description}
            </Typography>
          </div>
        </ListItemButton>
      );
    });

    return isSmallScreen ? (
      <Drawer
        open={filterOpenCategory}
        onClose={handleCategoryFilterClose}
        anchor="bottom"
        sx={{
          "& .MuiDrawer-paper": {
            mx: 1,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            background: isDarkMode ? "#1e1e1e" : "#fff",
            pb: 1,
          },
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <div
          style={{
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              height: "4px",
              width: "40px",
              borderRadius: "2px",
              backgroundColor: isDarkMode ? "#333" : "#999",
            }}
          />
        </div>

        <List>{listItems}</List>
        <Divider sx={{ mx: 2 }} />
        <Button onClick={handleCategoryFilterClose}>Close</Button>
      </Drawer>
    ) : (
      <Popover
        open={filterOpenCategory}
        anchorEl={anchorElCategory}
        onClose={handleCategoryFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: { style: { minWidth: 220 } },
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <List>{listItems}</List>
      </Popover>
    );
  };
  return {
    renderCategoryList,
    selectedCategory,
    handleCategoryClick,
  };
};
