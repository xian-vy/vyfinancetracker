import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setDarkMode } from "../../localstorage/darkmodesettings";
import { toggleDarkMode } from "../../redux/reducer/themeSlice";
import { RootState } from "../../redux/store";

const iconStyle = (): any => ({
  fontSize: 20,
  color: "#f58e8a",
  mx: 0.5,
  cursor: "pointer",
});

const SimpleThemeToggle = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state: RootState) => state.theme.darkMode);
  const handleDarkMode = (newMode: boolean | null) => {
    if (newMode !== currentMode) {
      setDarkMode(newMode);
      dispatch(toggleDarkMode(newMode));
    }
  };

  return (
    <Stack direction="row" justifyContent="center" mb={3}>
      {currentMode ? (
        <DarkModeOutlinedIcon sx={iconStyle()} onClick={() => handleDarkMode(false)} />
      ) : (
        <WbSunnyOutlinedIcon sx={iconStyle()} onClick={() => handleDarkMode(true)} />
      )}
    </Stack>
  );
};

export default SimpleThemeToggle;
