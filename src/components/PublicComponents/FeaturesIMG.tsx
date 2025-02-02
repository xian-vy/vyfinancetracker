import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import dashboardDark from "../../media/features/dashboard-dark.jpeg";
import dashboardLight from "../../media/features/dashboard-light.jpeg";
import { RootState } from "../../redux/store";

const FeaturesIMG = () => {
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const [currentImage, setCurrentImage] = useState(darktheme ? dashboardDark : dashboardLight);
  useEffect(() => {
    setCurrentImage(darktheme ? dashboardDark : dashboardLight);
  }, [darktheme]);
  return (
      <Stack maxWidth="md" direction="column" alignItems="center" justifyContent="center" my={6}  mb={{ xs: 2, md: 0 }} 
       sx={{ height: { xs: 200, sm: 320, md: 400, lg: 450,xl: 500 }, ml:{xs:0.5,sm:1}}}>
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
  );
};
export default FeaturesIMG;
