export const setTrendChartStacked = (stacked: boolean) => {
  localStorage.setItem("trendchart_stacked", JSON.stringify(stacked));
};

export const getTrendChartStacked = (): boolean => {
  const value = localStorage.getItem("trendchart_stacked");
  return value ? JSON.parse(value) : true;
};


