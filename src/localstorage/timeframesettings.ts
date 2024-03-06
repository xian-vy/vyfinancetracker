import { FilterTimeframe } from "../constants/timeframes";

export const saveTimeframetoLocalStorage = (timeframe: FilterTimeframe) => {
  localStorage.setItem("timeframe", timeframe);
};
export const getTimeframetoLocalStorage = () => {
  const userData = localStorage.getItem("timeframe");
  if (userData && Object.values(FilterTimeframe).includes(userData as FilterTimeframe)) {
    return userData as FilterTimeframe;
  }
  return FilterTimeframe.Year;
};
