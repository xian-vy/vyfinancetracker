import CloseIcon from "@mui/icons-material/Close";
import { Box, Link, Stack } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, { useState } from "react";
import budgetLaptop from "../../Media/features/budgetLaptop.png";
import budgetMobile from "../../Media/features/budgetMobile.png";
import expensesLaptop from "../../Media/features/expensesLaptop.png";
import expensesMobile from "../../Media/features/expensesMobile.png";
import dashboardLaptop from "../../Media/features/laptop.png";
import dashboardMobile from "../../Media/features/mobile.png";
import "./features.css";
const features = [
  { name: "Dashboard", laptopImg: dashboardLaptop, mobileImg: dashboardMobile },
  { name: "Expenses", laptopImg: expensesLaptop, mobileImg: expensesMobile },
  { name: "Budget", laptopImg: budgetLaptop, mobileImg: budgetMobile },
];
const FeaturesIMG = () => {
  const [showFullImage, setShowFullImage] = useState({ open: false, img: "" });
  const [currentImage, setCurrentImage] = useState(expensesLaptop);
  const [currentMobileImage, setCurrentMobileImage] = useState(expensesMobile);

  const handleBreadcrumbClick = (laptopImage, mobileImage) => {
    setCurrentImage(laptopImage);
    setCurrentMobileImage(mobileImage);
  };

  const handleImageClick = (image) => {
    setShowFullImage({ open: true, img: image });
  };

  return (
    <>
      <Stack
        justifyContent="center"
        alignItems="center"
        direction="column"
        px={{ xs: 1, md: 5, lg: 8, xl: 15 }}
        mb={{ xs: 1, sm: 2, lg: 2.5, xl: 3 }}
        mt={{ xs: 1.5, sm: 1.5, lg: 2, xl: 2.5 }}
      >
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center">
          <Stack direction="column" alignItems="center" justifyContent="flex-start" mb={{ xs: 2, md: 0 }}>
            <Stack direction="row" alignItems="center" mb={1.2} sx={{ px: 0.5 }}>
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  href="#"
                  color={currentImage === feature.laptopImg ? "primary" : "inherit"}
                  onClick={() => handleBreadcrumbClick(feature.laptopImg, feature.mobileImg)}
                  sx={{
                    textDecoration: "none",
                    WebkitTapHighlightColor: "transparent",
                    fontSize: { xs: "0.75rem", md: "0.85rem" },
                    mx: { xs: 1, md: 1.5 },
                  }}
                >
                  {feature.name}
                </Link>
              ))}
            </Stack>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                className="laptop"
                loading={currentImage === expensesLaptop ? undefined : "lazy"}
                src={currentImage}
                alt="laptop"
                onClick={() => handleImageClick(currentImage)}
                style={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
              />
              <img
                className="mobile"
                loading={currentMobileImage === expensesMobile ? undefined : "lazy"}
                src={currentMobileImage}
                alt="mobile"
                onClick={() => handleImageClick(currentMobileImage)}
                style={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
              />
            </div>
          </Stack>
        </Box>
      </Stack>
      {showFullImage.open && (
        <div className="full-image-wrapper" onClick={() => setShowFullImage({ open: false, img: "" })}>
          <IconButton className="close-button" onClick={() => setShowFullImage({ open: false, img: "" })}>
            <CloseIcon fontSize="large" />
          </IconButton>
          <img
            src={showFullImage.img}
            loading="lazy"
            alt={`Vy Finance Tracker ${showFullImage.img}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
export default FeaturesIMG;
