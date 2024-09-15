import { Theme, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FilterTimeframe } from "../constants/timeframes";
import { operation_types, txn_types } from "../constants/collections";
import { Timestamp } from "firebase/firestore";

export const isProduction = process.env.NODE_ENV === "production";

export const getFilterTitle = (filterOption: FilterTimeframe, startDate: Date | null, endDate: Date | null) => {
  const now = new Date();

  switch (filterOption) {
    case FilterTimeframe.CustomMonth:
      if (startDate && endDate) {
        const startMonthYear = startDate.toLocaleDateString("default", {
          month: "short",
          year: "numeric",
        });
        return `${startMonthYear} `;
      }
      return "Custom Month";
    case FilterTimeframe.CustomYear:
      if (startDate && endDate) {
        const startYear = startDate.toLocaleDateString("default", {
          year: "numeric",
        });

        return `${startYear}`;
      }
      return "Custom Year";

    case FilterTimeframe.Year:
      return `${now.getFullYear()}`;
    case FilterTimeframe.LastYear:
      return `${now.getFullYear() - 1}`;
    case FilterTimeframe.Month:
      return `${now.toLocaleDateString("default", { month: "short", year: "numeric" })}`;
    case FilterTimeframe.LastMonth:
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${lastMonth.toLocaleDateString("default", { month: "short", year: "numeric" })}`;
    case FilterTimeframe.Day:
      return `${now.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`;
    case FilterTimeframe.Yesterday:
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return `${yesterday.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;

    case FilterTimeframe.Week:
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleString("en-us", {
        month: "short",
      })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleString("en-us", {
        month: "short",
      })} ${endOfWeek.getDate()} ${endOfWeek.getFullYear()}`;
    case FilterTimeframe.LastWeek:
      const startOfLastWeek = new Date();
      startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      return `${startOfLastWeek.toLocaleString("en-us", {
        month: "short",
      })} ${startOfLastWeek.getDate()} - ${endOfLastWeek.toLocaleString("en-us", {
        month: "short",
      })} ${endOfLastWeek.getDate()} ${endOfLastWeek.getFullYear()}`;
    default:
      return `${filterOption} `;
  }
};

//For filter icons dark/light bg color
export function ThemeColor(theme: Theme) {
  const isDarkMode = theme.palette.mode === "dark";
  return isDarkMode ? "#ccc" : "#666";
}
//For list  dark/light bg color
export function hoverBgColor(theme: Theme) {
  const isDarkMode = theme.palette.mode === "dark";
  return isDarkMode ? "#333" : "#eaeaea";
}

const currency = "PHP";

// export function formatNumberWithCurrency(amount: number) {
//   const roundedAmount = Math.round(amount * 100) / 100; // Round to two decimal places
//   const hasDecimal = roundedAmount % 1 !== 0;
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: currency,
//     minimumFractionDigits: hasDecimal ? 2 : 0,
//     maximumFractionDigits: hasDecimal ? 2 : 0,
//   }).format(roundedAmount);
// }
export function formatNumberWithoutCurrency(amount: number) {
  const roundedAmount = Math.round(amount * 100) / 100;
  let formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedAmount);

  // Remove trailing .00
  if (formattedAmount.endsWith(".00")) {
    formattedAmount = formattedAmount.slice(0, -3);
  }
  // Remove trailing .0
  else if (formattedAmount.endsWith(".0")) {
    formattedAmount = formattedAmount.slice(0, -2);
  }

  return formattedAmount;
}
export function formatShortAmountWithCurrency(amount: number, isDecimal?: boolean, excludeCurrency?: boolean) {
  // Get the currency symbol
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const part = formatter.formatToParts(0).find((part) => part.type === "currency");
  const symbol = part ? part.value : "";

  // Check if the amount is negative
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);

  // Shorten the number
  let shortAmount = "";
  if (absoluteAmount >= 1e3 && absoluteAmount < 1e6) {
    const formatted = (absoluteAmount / 1e3).toString();
    const decimalPart = formatted.includes(".") ? formatted.split(".")[1].slice(0, 2) : "";
    shortAmount = `${formatted.split(".")[0]}${decimalPart ? "." + decimalPart : ""}k`;
  } else if (absoluteAmount >= 1e6 && absoluteAmount < 1e9) {
    const formatted = (absoluteAmount / 1e6).toString();
    const decimalPart = formatted.includes(".") ? formatted.split(".")[1].slice(0, 2) : "";
    shortAmount = `${formatted.split(".")[0]}${decimalPart ? "." + decimalPart : ""}M`;
  } else if (absoluteAmount < 1e3) {
    const formatted = absoluteAmount.toString();
    const decimalPart = formatted.includes(".") ? formatted.split(".")[1].slice(0, 2) : "";
    shortAmount = `${formatted.split(".")[0]}${decimalPart ? "." + decimalPart : ""}`;
  } else {
    shortAmount = absoluteAmount.toString().slice(0, 4);
  }
  // Add the negative sign back if necessary
  if (isNegative) {
    shortAmount = "-" + shortAmount;
  }

  if (excludeCurrency) {
    return shortAmount;
  }

  return symbol + shortAmount;
}

export function formatAmountForChart(amount: number) {
  const absoluteAmount = Math.abs(amount);

  let shortAmount = "";
  if (absoluteAmount >= 1e3 && absoluteAmount < 1e6) {
    const formatted = (absoluteAmount / 1e3).toString();
    shortAmount = `${formatted.split(".")[0]}k`;
  } else if (absoluteAmount >= 1e6 && absoluteAmount < 1e9) {
    const formatted = (absoluteAmount / 1e6).toString();
    shortAmount = `${formatted.split(".")[0]}M`;
  } else if (absoluteAmount < 1e3 && absoluteAmount >= 100) {
    shortAmount = `${Math.floor(absoluteAmount / 100)}h`;
  } else {
    shortAmount = absoluteAmount.toString();
  }

  return shortAmount;
}

export const useResponsiveCharLimit = () => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMdScreen = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLgScreen = useMediaQuery(theme.breakpoints.up("lg"));

  let charLimit: number = 0;
  if (isXsScreen) {
    charLimit = 25;
  } else if (isSmScreen) {
    charLimit = 30;
  } else if (isMdScreen) {
    charLimit = 35;
  } else if (isLgScreen) {
    charLimit = 40;
  } else {
    charLimit = 25;
  }

  return charLimit;
};

export const toTitleCase = (str: string) => {
  if (typeof str !== "string") {
    return "";
  }
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};
export const isValidInput = (value: any) => {
  const regex = /^(?!.*\..*\.)[0-9]*(\.[0-9]{0,2})?$/;
  return regex.test(value);
};

export function getOperatingSystem() {
  const userAgent = window.navigator.userAgent;
  if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    return "MacOS";
  } else if (/Windows|Win16|Win32|WinCE|Win64/.test(userAgent)) {
    return "Windows";
  } else if (/Android/.test(userAgent)) {
    return "Android";
  } else if (/Linux/.test(userAgent)) {
    return "Linux";
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "iOS";
  } else {
    return "Unknown";
  }
}

export function hexToRGBA(hex: string, alpha = 0.6) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const createSwapLog = (id: string, type: txn_types, categoryId: string, accountId: string, amount: number) => ({
  txn_id: "",
  txn_ref_id: id,
  txn_type: type,
  operation: operation_types.Create,
  category_id: categoryId,
  account_id: accountId,
  amount,
  lastModified: Timestamp.now(),
});
