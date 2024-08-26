export const setDarkMode = (darkmode: boolean | null) => {
  localStorage.setItem("darkmode", JSON.stringify(darkmode));
};

export const getDarkMode = () => {
  const storedDarkMode = localStorage.getItem("darkmode");
  return storedDarkMode ? JSON.parse(storedDarkMode) : true;
};
