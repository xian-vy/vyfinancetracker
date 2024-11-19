import { List, ListItem, Stack, ListItemAvatar, Typography, TextField, Box, CircularProgress } from "@mui/material";
import React from "react";
import CategoryIcons from "../../media/CategoryIcons";
import CategoryModel from "../../models/CategoryModel";
import { iconSizeXS } from "../../constants/size";

type Props = {
  categories: CategoryModel[];
  firstTextFieldRef: React.RefObject<HTMLInputElement>;
  categoryAmounts: { [categoryId: string]: number };
  onAmountChange: (categoryId: string, value: string) => void;
};

function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
}

const BudgetFormCategoryList = ({ categories, firstTextFieldRef, categoryAmounts, onAmountChange }: Props) => {
  return (
    <div>
      {!categories ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100%">
          <CircularProgress size={20} />
        </Box>
      ) : (
        <List dense sx={{ height: { xs: 200, md: 150, lg: 170, xl: 180 }, overflowY: "auto" }}>
          {categories.map((category, index) => {
            const categoryIcon = CategoryIcons.find((icon) => icon.name === category?.icon);

            return (
              <ListItem key={category.id} value={category.id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                  <ListItemAvatar>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {categoryIcon && renderIcon(categoryIcon.icon, category.color)}
                      <Typography align="left" variant="body1" pl={1} noWrap>
                        {category.description.length > 12
                          ? category.description.substring(0, 12) + ".."
                          : category.description}{" "}
                      </Typography>
                    </div>
                  </ListItemAvatar>
                  <TextField
                    inputRef={index === 0 ? firstTextFieldRef : null}
                    value={new Intl.NumberFormat("en-US").format(categoryAmounts[category.id] || 0)}
                    onChange={(e) => onAmountChange(category.id, e.target.value)}
                    size="small"
                    sx={{ width: 60, ml: 2 }}
                    variant="standard"
                    inputMode="numeric"
                    inputProps={{ inputMode: "numeric" }}
                  />
                </Stack>
              </ListItem>
            );
          })}
        </List>
      )}
    </div>
  );
};

export default React.memo(BudgetFormCategoryList);
