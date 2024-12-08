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
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const [currentImage, setCurrentImage] = useState(darktheme ? dashboardDark : dashboardLight);

  const handleBreadcrumbClick = (laptopImage: string) => {
    setCurrentImage(laptopImage);
  };

  useEffect(() => {
    setCurrentImage(darktheme ? dashboardDark : dashboardLight);
  }, [darktheme]);
  return (
    <>
      <Stack justifyContent="center" alignItems="center" direction="column" maxWidth="md" mt={4} width="100%">
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center">
          <Stack direction="column" alignItems="center" justifyContent="flex-start" mb={{ xs: 2, md: 0 }}>
            <Stack direction="row" alignItems="center" mb={1.2} sx={{ px: 0.5 }}>
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  color="inherit"
                  onClick={() => handleBreadcrumbClick(darktheme ? feature.laptopImgDark : feature.laptopImg)}
                  sx={{
                    textDecoration: "none",
                    WebkitTapHighlightColor: "transparent",
                    fontSize:"0.85rem",
                    borderBottom:
                      currentImage === feature.laptopImg || currentImage === feature.laptopImgDark
                        ? `solid 3px #d86c70`
                        : "none",

                    mx: { xs: 1, md: 1.5 },
                    fontWeight: 500,
                    cursor: "pointer",
                    color: darktheme ? "#ccc" : "#222",
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
              <Stack sx={{ background: darktheme ? "#222" : "#555", p: 0.2, borderRadius: 2 }}>
                <Stack
                  sx={{
                    background: darktheme ? "#101010" : "#555",
                    py: { xs: 1.5, lg: 2 },
                    px:0.8,
                    height: { xs: 220, sm: 350, md: 400, lg: 450 },
                    position: "relative",
                    borderRadius: 2,
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
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
   
    </>
  );
};
export default FeaturesIMG;
