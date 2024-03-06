export const setFontSize = (FontSize: string) => {
  localStorage.setItem("fontsize", JSON.stringify(FontSize));
};

export const getFontSize = (): string => {
  const storedFontSize = localStorage.getItem("fontsize");
  return storedFontSize ? JSON.parse(storedFontSize) : "sm";
};
