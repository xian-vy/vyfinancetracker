import { Box, Link, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import budgetDark from "../../media/features/budget.jpeg";
import dashboardDark from "../../media/features/dashboard.jpeg";
import expenseDark from "../../media/features/expense.jpeg";
import { RootState } from "../../redux/store";
const features = [
  { name: "Expenses", laptopImgDark: expenseDark },
  { name: "Dashboard",  laptopImgDark: dashboardDark },
  { name: "Budget", laptopImgDark: budgetDark },
];
const FeaturesIMG = () => {
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const [currentImage, setCurrentImage] = useState(dashboardDark);

  const handleBreadcrumbClick = (laptopImage: string) => {
    setCurrentImage(laptopImage);
  };

  useEffect(() => {
    setCurrentImage(dashboardDark);
  }, [darktheme]);
  return (
    <>
      <Stack justifyContent="center" alignItems="center" direction="column"  mt={4} width="100%">
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center">
          <Stack direction="column" alignItems="center" justifyContent="flex-start" mb={{ xs: 2, md: 0 }}>
            <Stack direction="row" alignItems="center" mb={1.2} sx={{ px: 0.5 }}>
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  color="inherit"
                  onClick={() => handleBreadcrumbClick(feature.laptopImgDark)}
                  sx={{
                    textDecoration: "none",
                    WebkitTapHighlightColor: "transparent",
                    fontSize:"0.85rem",
                    borderBottom:
                      currentImage === feature.laptopImgDark
                        ? `solid 3px #d86c70`
                        : "none",

                    mx: { xs: 1, md: 1.5 },
                    fontWeight: 500,
                    cursor: "pointer",
                    color:  "#ccc",
                  }}
                >
                  {feature.name}
                </Link>
              ))}
            </Stack>
     
                <Stack
                  sx={{
                    height: { xs: 230, sm: 350, md: 450, lg: 500, xl: 600 },
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
                  />
              
            </Stack>
          </Stack>
        </Box>
      </Stack>
   
    </>
  );
};
export default FeaturesIMG;