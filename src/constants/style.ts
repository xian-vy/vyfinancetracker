export const CHART_X_AXIS_STYLE = (smScreen: boolean, preferredFontSize: string) => {
  return {
    fontSize: smScreen
      ? preferredFontSize === "md"
        ? "0.8rem"
        : "0.7rem"
      : preferredFontSize === "md"
      ? "0.9rem"
      : "0.8rem",
  };
};
export const CHART_Y_AXIS_STYLE = (smScreen: boolean, preferredFontSize: string) => {
  return {
    fontSize: smScreen
      ? preferredFontSize === "md"
        ? "0.7rem"
        : "0.6rem"
      : preferredFontSize === "md"
      ? "0.8rem"
      : "0.7rem",
  };
};
