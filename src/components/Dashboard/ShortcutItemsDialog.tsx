import CloseIcon from "@mui/icons-material/Close";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import {
  Backdrop,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { txn_types } from "../../constants/collections";
import { DIALOG_CLOSEICON_SIZE, iconSizeSM, iconSizeXS } from "../../constants/size";
import CategoryIcons from "../../media/CategoryIcons";
import IncomeSourceIcons from "../../media/IncomeSourceIcons";
import SavingsIcons from "../../media/SavingsIcons";
import { RootState } from "../../redux/store";

interface Props<T> {
  open: boolean;
  type: string;
  onClose: () => void;
  context: T;
  favorites: string[];
  onAddFavorite: (newfavorite: string) => void;
}

type maitenanceContextModel = {
  id: string;
  description: string;
  color: string;
  icon?: string;
};

const ShortcutItemsDialog = ({ open, type, onClose, context, favorites, onAddFavorite }: Props<any>) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const NonfavoriteList = context.filter((item: any) => !favorites.includes(item.id));

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: smScreen ? iconSizeXS : iconSizeSM } });
  }

  const handleFavoriteClick = (selectedCategory: maitenanceContextModel) => {
    setLoading(true);
    // If the selectedCategory is not a favorite, add it to the favorites
    onAddFavorite(selectedCategory.id);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            alignItems: "center",
            p:3
          }}
        >
          <Typography variant="body1">Add to Favorites</Typography>
          <CloseIcon sx={{ cursor: "pointer",fontSize:DIALOG_CLOSEICON_SIZE }} onClick={onClose}/>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}>
          <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit" />
          </Backdrop>
          <Stack direction="row" alignItems="center" flexWrap="wrap">
            {NonfavoriteList.map((category: maitenanceContextModel, index: number) => {
              let iconObject: React.ReactElement | undefined;

              switch (type) {
                case txn_types.Expenses:
                  iconObject = CategoryIcons.find((icon) => icon.name === category.icon)?.icon;
                  break;
                case txn_types.Income:
                  iconObject = IncomeSourceIcons.find((icon) => icon.name === category.icon)?.icon;
                  break;
                case txn_types.Savings:
                  iconObject = SavingsIcons.find((icon) => icon.name === category.icon)?.icon;
                  break;
                default:
                  break;
              }

              return (
                <div key={index}>
                  <Paper
                    sx={{
                      py: 0.5,
                      pl: { xs: 0.5, md: 1 },
                      pr: { xs: 0, md: 0.5 },
                      my: smScreen ? 0.4 : 0.8,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                      mx: smScreen ? 0.5 : 1,
                    }}
                    variant="outlined"
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {renderIcon(
                        iconObject || <DoNotDisturbAltIcon sx={{ fontSize: smScreen ? iconSizeXS : iconSizeSM }} />,
                        category.color
                      )}
                      <Typography
                        align="left"
                        pl={smScreen ? 0.2 : 1}
                        sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                        variant={smScreen ? "caption" : "body1"}
                      >
                        <span style={{ flex: 1 }}>{category.description}</span>
                      </Typography>

                      <Checkbox
                        icon={<FavoriteBorder />}
                        checkedIcon={<Favorite />}
                        sx={{ p: 0, mx: smScreen ? 0.5 : 1 }}
                        checked={favorites.includes(category.id)}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleFavoriteClick(category);
                        }}
                      />
                    </div>
                  </Paper>
                </div>
              );
            })}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShortcutItemsDialog;
