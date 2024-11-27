import CloseIcon from "@mui/icons-material/Close";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import {
  Backdrop,
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CategoryIcons from "../../media/CategoryIcons";
import IncomeSourceIcons from "../../media/IncomeSourceIcons";
import SavingsIcons from "../../media/SavingsIcons";
import { iconSizeXS } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import { EXPENSE_PATH, INCOME_PATH, SAVINGS_PATH } from "../../constants/routes";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { RootState } from "../../redux/store";
import SavingGoalsModel from "../../models/SavingGoalsModel";

type genericModel = {
  id: string;
  description: string;
  color: string;
  icon?: string;
};

const ShortcutItemsDialog = React.lazy(() => import("./ShortcutItemsDialog"));

const Shortcutitems = ({
  type,
  dialogOpen,
  onDialogClose,
}: {
  type: string;
  dialogOpen: boolean;
  onDialogClose: () => void;
}) => {
  const persistenceID = useSelector((state: RootState) => state.auth.persistentId);
  const [openSnackBar, setSnackBarOpen] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleFavoriteClick = useCallback((selectedCategory: genericModel) => {
    setLoading(true);
    if (favorites.includes(selectedCategory.id)) {
      // If the selectedCategory is already a favorite, remove it from the favorites
      setFavorites(favorites.filter((id) => id !== selectedCategory.id));
      setSnackBarMessage("Removed from favorites");
    } else {
      // If the selectedCategory is not a favorite, add it to the favorites
      setFavorites([...favorites, selectedCategory.id]);
      setSnackBarMessage("Added to favorites");
    }
    setTimeout(() => {
      snackbarOpen();
      setLoading(false);
    }, 500);
  }, [favorites]);

  const handleAddFavorite = (newfavorite: string) => {
    setFavorites([...favorites, newfavorite]);
    setSnackBarMessage("Added to favorites");
    setTimeout(() => {
      snackbarOpen();
    }, 500);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBarOpen(false);
  };

  const { categories } = useCategoryContext();
  const { incomeSource } = useIncomeSourcesContext();
  const savingsSlice : SavingGoalsModel[]= useSelector((state: RootState) => state.savings.savings);

  const savings = savingsSlice.map((item) => ({
    id: item.id,
    description: item.description,
    color: item.color,
    icon: item.icon,
  }));

  let shortcutList: genericModel[] = [];
  switch (type) {
    case txn_types.Expenses:
      //expense/budget have same categories
      shortcutList = categories;
      break;
    case txn_types.Income:
      shortcutList = incomeSource;
      break;
    case txn_types.Savings:
      shortcutList = savings;
      break;

    default:
      break;
  }

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites" + persistenceID);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites" + persistenceID, JSON.stringify(favorites));
  }, [favorites]);

  const navigate = useNavigate();

  const handleNavigate = useCallback((selectedCategory: genericModel) => {
    switch (type) {
      case txn_types.Expenses:
        navigate(`${EXPENSE_PATH}/${selectedCategory.id}`, { state: { openForm: true } });
        break;
      case txn_types.Income:
        navigate(`${INCOME_PATH}/${selectedCategory.id}`, { state: { openForm: true } });
        break;
      case txn_types.Savings:
        //this is savings.id
        navigate(`${SAVINGS_PATH}/${selectedCategory.id}`, { state: { openForm: true } });
        break;

      default:
        break;
    }
  }, [type, navigate]);


  const favoriteList = useMemo(() => {
    return shortcutList.filter((item) => favorites.includes(item.id));
  }, [shortcutList, favorites]);

  const AdddedToFavorites = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const snackbarOpen = () => {
    setSnackBarOpen(true);
  };

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
  }

  return (
    <Box py={{ xs: 0, md: 1 }} px={{ xs: 0, md: 1, lg: 2 }} mt={0.5}>
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={{ xs: 1, md: 1.5 }}>
        {favoriteList.length > 0 && favoriteList.map((category, index) => {
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
                  pl: 1,
                  pr:  0.5 ,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                }}
                variant="outlined"
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {renderIcon(iconObject || <DoNotDisturbAltIcon sx={{ fontSize: iconSizeXS }} />, category.color)}
                  <Typography
                    align="left"
                    pl={smScreen ? 0.2 : 1}
                    onClick={() => handleNavigate(category)}
                    sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    variant={smScreen ? "caption" : "body1"}
                  >
                    <span style={{ flex: 1 }}>{category.description}</span>
                  </Typography>
                  <Checkbox
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite style={{ color: isDarkMode ? "#666" : "#999" }} />}
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

      <Snackbar
        open={openSnackBar}
        autoHideDuration={2000}
        onClose={handleClose}
        message={snackBarMessage}
        action={AdddedToFavorites}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            color: isDarkMode ? "#ccc" : "#333",
          },
        }}
      />
      <React.Suspense
        fallback={
          <Box display="flex" justifyContent="center">
           {dialogOpen && <CircularProgress size={15} /> }
          </Box>
        }
      >
        <ShortcutItemsDialog
          open={dialogOpen}
          onClose={onDialogClose}
          type={type}
          context={shortcutList}
          favorites={favorites}
          onAddFavorite={handleAddFavorite}
        />
      </React.Suspense>
    </Box>
  );
};

export default React.memo(Shortcutitems);
