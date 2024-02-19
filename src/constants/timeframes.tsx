export enum FilterTimeframe {
  Day = "This Day",
  Yesterday = "Yesterday",
  Week = "This Week",
  LastWeek = "Last Week",
  Month = "This Month",
  LastMonth = "Last Month",
  Year = "This Year",
  LastYear = "Last Year",
  CustomMonth = "Select Month",
  CustomYear = "Select Year",
  AllTime = "All Time",
}

//For Popover/drawer grouping
export const dayFilters = [FilterTimeframe.Day, FilterTimeframe.Yesterday];
export const weekFilters = [FilterTimeframe.Week, FilterTimeframe.LastWeek];
export const monthFilters = [FilterTimeframe.Month, FilterTimeframe.LastMonth, FilterTimeframe.CustomMonth];
export const yearFilters = [FilterTimeframe.Year, FilterTimeframe.LastYear, FilterTimeframe.CustomYear];

export enum BudgetTimeframe {
  Day = "Day",
  Week = "Week",
  Month = "Month",
}
