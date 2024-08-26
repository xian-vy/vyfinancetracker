import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, Link, Stack } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useState } from "react";
import budgetDark from "../../media/features/budget-dark.png";
import budgetLight from "../../media/features/budget-light.png";
import expenseDark from "../../media/features/expenses-dark.png";
import expenseLight from "../../media/features/expenses-light.png";
import dashboardDark from "../../media/features/dashboard-dark.png";
import dashboardLight from "../../media/features/dashboard-light.png";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
const features = [
  { name: "Expenses", laptopImg: expenseLight, laptopImgDark: expenseDark },
  { name: "Dashboard", laptopImg: dashboardLight, laptopImgDark: dashboardDark },
  { name: "Budget", laptopImg: budgetLight, laptopImgDark: budgetDark },
];
const FeaturesIMG = () => {
  const [showFullImage, setShowFullImage] = useState({ open: false, img: "" });
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const [currentImage, setCurrentImage] = useState(darktheme ? dashboardDark : dashboardLight);

  const handleBreadcrumbClick = (laptopImage: string) => {
    setCurrentImage(laptopImage);
  };

  const handleImageClick = (image: string) => {
    setShowFullImage({ open: true, img: image });
  };

  useEffect(() => {
    setCurrentImage(darktheme ? dashboardDark : dashboardLight);
  }, [darktheme]);
  return (
    <>
      <Stack justifyContent="center" alignItems="center" direction="column" maxWidth="md" mt={{ xs: 2, sm: 3, lg: 4 }}>
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center">
          <Stack direction="column" alignItems="center" justifyContent="flex-start" mb={{ xs: 2, md: 0 }}>
            <Stack direction="row" alignItems="center" mb={1.2} sx={{ px: 0.5 }}>
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  href="#"
                  color="inherit"
                  onClick={() => handleBreadcrumbClick(darktheme ? feature.laptopImgDark : feature.laptopImg)}
                  sx={{
                    textDecoration: "none",
                    WebkitTapHighlightColor: "transparent",
                    fontSize:
                      currentImage === feature.laptopImg || currentImage === feature.laptopImgDark
                        ? "0.85rem"
                        : "0.75rem",
                    borderBottom:
                      currentImage === feature.laptopImg || currentImage === feature.laptopImgDark
                        ? `solid 3px #d86c70`
                        : "none",

                    mx: { xs: 1, md: 1.5 },
                    fontWeight: 500,
                  }}
                >
                  {feature.name}
                </Link>
              ))}
            </Stack>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{
                mx: "auto",
                my: 2,
                borderRadius: 2,
              }}
            >
              <Stack sx={{ background: darktheme ? "#333" : "#444", p: 0.2, borderRadius: 3 }}>
                <Stack
                  sx={{
                    background: darktheme ? "#000" : "#666",
                    p: { xs: 1.5, xl: 2 },
                    height: { xs: 200, sm: 300, md: 350, lg: 400 },
                    position: "relative",
                    borderRadius: 3,
                  }}
                >
                  <img
                    // loading={currentImage === dashboardDark ? undefined : "lazy"}
                    src={currentImage}
                    style={{
                      width: "auto",
                      height: "100%",
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    alt="laptop"
                    onClick={() => handleImageClick(currentImage)}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
      <Dialog
        open={showFullImage.open}
        onClose={() => setShowFullImage({ open: false, img: "" })}
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 3, m: 1, background: darktheme ? "#333" : "#666" } }}
      >
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{
            mx: "auto",
            borderRadius: 2,
          }}
        >
          <Stack sx={{ background: darktheme ? "#333" : "#666", p: 0.2, borderRadius: 3 }}>
            <Stack
              sx={{
                background: darktheme ? "#000" : "#666",
                p: { xs: 1 },
                maxHeight: { xs: 400, sm: 700, md: 800, lg: 800 },
                position: "relative",
                borderRadius: 3,
              }}
            >
              <img
                src={showFullImage.img}
                loading="lazy"
                alt={`Vy Finance Tracker ${showFullImage.img}`}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "100%", height: "100%" }}
              />
              <IconButton
                onClick={() => setShowFullImage({ open: false, img: "" })}
                sx={{ background: "#ccc", width: 24, height: 24, position: "absolute", top: 15, right: 15 }}
              >
                <CloseIcon sx={{ color: "#666", fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
};
export default FeaturesIMG;
