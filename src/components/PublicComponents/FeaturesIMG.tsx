import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, Link, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import budgetDark from "../../media/features/budget-dark.png";
import budgetLight from "../../media/features/budget-light.png";
import dashboardDark from "../../media/features/dashboard-dark.png";
import dashboardLight from "../../media/features/dashboard-light.png";
import expenseDark from "../../media/features/expenses-dark.png";
import expenseLight from "../../media/features/expenses-light.png";
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
              <Stack sx={{ background: darktheme ? "#333" : "#555", p: 0.2, borderRadius: 3 }}>
                <Stack
                  sx={{
                    background: darktheme ? "#000" : "#666",
                    py: { xs: 1.5, lg: 2 },
                    px: { xs: 0.7, lg: 1 },
                    height: { xs: 200, sm: 350, md: 400, lg: 450 },
                    position: "relative",
                    borderRadius: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
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
          <Stack sx={{ background: darktheme ? "#333" : "#555", p: 0.2, borderRadius: 3 }}>
            <Stack
              sx={{
                background: darktheme ? "#000" : "#666",
                py: { xs: 2, lg: 3 },
                px: { xs: 0.7, lg: 1 },
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

              <CloseIcon
                sx={{
                  color: darktheme ? "#333" : "#fff",
                  fontSize: { xs: 20, md: 24, lg: 30 },
                  position: "absolute",
                  top: { xs: 10, md: 15, lg: 20 },
                  right: { xs: 10, md: 15, lg: 20 },
                  cursor: "pointer",
                  background: darktheme ? "#ccc" : "#555",
                  borderRadius: "50%",
                  p: 0.5,
                }}
                onClick={() => setShowFullImage({ open: false, img: "" })}
              />
            </Stack>
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
};
export default FeaturesIMG;
