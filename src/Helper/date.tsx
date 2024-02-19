import { isValid, parse, format, subMonths, subYears, compareAsc } from "date-fns";
import { enUS } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import { FilterTimeframe, FilterTimeframe as Timeframe, monthFilters, weekFilters } from "../constants/timeframes";

export function TimestamptoDate(timestamp: Timestamp, formatString: string) {
  const jsDate = timestamp.toDate();
  return format(jsDate, formatString);
}

export function DatetoTimestamp(date: string) {
  const dateObject = new Date(date);
  return Timestamp.fromDate(dateObject);
}
//Parse excel strng date to timestamp
export function convertFormattedDateToTimestamp(inputDate: string) {
  const formats = [
    "MM/dd/yyyy", // 12/25/2021
    "dd/MM/yyyy", // 25/12/2021
    "yyyy/MM/dd", // 2021/12/25
    "MM-dd-yyyy", // 12-25-2021
    "dd-MM-yyyy", // 25-12-2021
    "dd-MMM-yy", // 25-Dec-21
    "yyyy-MM-dd", // 2021-12-25
    "MMMM dd, yyyy", // December 25, 2021
    "EEE, MMMM dd, yyyy", // Tue, December 25, 2021
    "EEEE, MMMM dd, yyyy", // Tuesday, December 25, 2021
    "MMM dd, yyyy", // Dec 25, 2021
    "MMMM dd, yyyy 'at' hh:mm:ss a", // December 25, 2021 at 10:30:00 AM
    "EEEE, MMMM dd, yyyy 'at' hh:mm:ss a", // Tuesday, December 25, 2021 at 10:30:00 AM
    "EEE, MMMM dd, yyyy 'at' hh:mm:ss a", // Tue, December 25, 2021 at 10:30:00 AM
    "MMM dd, yyyy 'at' hh:mm:ss a", // Dec 25, 2021 at 10:30:00 AM
  ];
  // Iterate through the formats and try parsing the input date
  for (const format of formats) {
    const parsedDate = parse(inputDate, format, new Date(), { locale: enUS });

    // Check if the parsed date is valid
    if (isValid(parsedDate)) {
      // Get the timestamp (Unix timestamp) in milliseconds
      const timestamp = parsedDate.getTime();

      return timestamp;
    }
  }

  // If neither format matches, return NaN or handle the error as needed
  return NaN;
}
//EXCEL upload date validation
export function validateDateFormat(input: string) {
  const allowedFormats = [
    "MM/dd/yyyy", // 12/25/2021
    "dd/MM/yyyy", // 25/12/2021
    "yyyy/MM/dd", // 2021/12/25
    "MM-dd-yyyy", // 12-25-2021
    "dd-MM-yyyy", // 25-12-2021
    "dd-MMM-yy", // 25-Dec-21
    "yyyy-MM-dd", // 2021-12-25
    "MMMM dd, yyyy", // December 25, 2021
    "EEE, MMMM dd, yyyy", // Tue, December 25, 2021
    "EEEE, MMMM dd, yyyy", // Tuesday, December 25, 2021
    "MMM dd, yyyy", // Dec 25, 2021
    "MMMM dd, yyyy 'at' hh:mm:ss a", // December 25, 2021 at 10:30:00 AM
    "EEEE, MMMM dd, yyyy 'at' hh:mm:ss a", // Tuesday, December 25, 2021 at 10:30:00 AM
    "EEE, MMMM dd, yyyy 'at' hh:mm:ss a", // Tue, December 25, 2021 at 10:30:00 AM
    "MMM dd, yyyy 'at' hh:mm:ss a", // Dec 25, 2021 at 10:30:00 AM
  ];
  // Try to parse the input using each allowed format
  for (const format of allowedFormats) {
    const parsedDate = parse(input, format, new Date(), { locale: enUS });

    // Check if the parsed date is valid
    if (isValid(parsedDate)) {
      return true; // Input matches one of the allowed formats
    }
  }

  return false; // Input does not match any of the allowed formats
}

export function currentDatetoDatePicker() {
  const today = new Date();
  return today;
}

export function getFirstAndLastDayOfMonth(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999);
  return { firstDayOfMonth, lastDayOfMonth };
}

export function getFirstAndLastDayOfYear(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  firstDayOfYear.setHours(0, 0, 0, 0);
  const lastDayOfYear = new Date(date.getFullYear(), 11, 31);
  lastDayOfYear.setHours(23, 59, 59, 999);
  return { firstDayOfYear, lastDayOfYear };
}

//Sunday start of week
export function getFirstAndLastDayOfWeek(date: Date) {
  const firstDayOfWeek = new Date(date);
  firstDayOfWeek.setDate(date.getDate() - date.getDay());
  firstDayOfWeek.setHours(0, 0, 0, 0);
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);
  return { firstDayOfWeek, lastDayOfWeek };
}
// export function getFirstAndLastDayOfWeek(date: Date) {
//   const firstDayOfWeek = new Date(date);
//   const currentDayOfWeek = date.getDay();
//   const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
//   firstDayOfWeek.setDate(date.getDate() + distanceToMonday);
//   firstDayOfWeek.setHours(0, 0, 0, 0);

//   const lastDayOfWeek = new Date(firstDayOfWeek);
//   lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
//   lastDayOfWeek.setHours(23, 59, 59, 999);

//   return { firstDayOfWeek, lastDayOfWeek };
// }
export function getFirstAndLastDayOfDay(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}

export function getFirstAndLastDays(date: Date) {
  const currentDate = new Date(date);

  const { firstDayOfMonth, lastDayOfMonth } = getFirstAndLastDayOfMonth(currentDate);
  const { firstDayOfYear, lastDayOfYear } = getFirstAndLastDayOfYear(currentDate);
  const { firstDayOfWeek, lastDayOfWeek } = getFirstAndLastDayOfWeek(currentDate);
  const { dayStart, dayEnd } = getFirstAndLastDayOfDay(currentDate);

  const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const { firstDayOfMonth: firstDayOfLastMonth, lastDayOfMonth: lastDayOfLastMonth } =
    getFirstAndLastDayOfMonth(lastMonthDate);

  const lastYearDate = new Date(currentDate.getFullYear() - 1, 0, 1);
  const { firstDayOfYear: firstDayOfLastYear, lastDayOfYear: lastDayOfLastYear } =
    getFirstAndLastDayOfYear(lastYearDate);

  const lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { firstDayOfWeek: firstDayOfLastWeek, lastDayOfWeek: lastDayOfLastWeek } =
    getFirstAndLastDayOfWeek(lastWeekDate);

  return {
    firstDayOfMonth,
    lastDayOfMonth,
    firstDayOfYear,
    lastDayOfYear,
    firstDayOfWeek,
    lastDayOfWeek,
    dayStart,
    dayEnd,
    firstDayOfLastMonth,
    lastDayOfLastMonth,
    firstDayOfLastYear,
    lastDayOfLastYear,
    firstDayOfLastWeek,
    lastDayOfLastWeek,
  };
}

const currentDate = new Date();

const {
  firstDayOfMonth,
  lastDayOfMonth,
  firstDayOfYear,
  lastDayOfYear,
  firstDayOfWeek,
  lastDayOfWeek,
  dayStart,
  dayEnd,
  firstDayOfLastMonth,
  lastDayOfLastMonth,
  firstDayOfLastYear,
  lastDayOfLastYear,
  firstDayOfLastWeek,
  lastDayOfLastWeek,
} = getFirstAndLastDays(currentDate);

export function getStartAndEndDate(timeframe: string, dateStart?: Date, dateEnd?: Date) {
  let startDate: Date = new Date();
  let endDate: Date = new Date();

  switch (timeframe) {
    case Timeframe.Day:
      startDate = dayStart;
      endDate = dayEnd;
      break;
    case Timeframe.Yesterday:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      endDate = new Date(startDate);
      break;
    case Timeframe.Week:
      startDate = firstDayOfWeek;
      endDate = lastDayOfWeek;
      break;
    case Timeframe.LastWeek:
      startDate = firstDayOfLastWeek;
      endDate = lastDayOfLastWeek;
      break;
    case Timeframe.Month:
      startDate = firstDayOfMonth;
      endDate = lastDayOfMonth;
      break;
    case Timeframe.LastMonth:
      startDate = firstDayOfLastMonth;
      endDate = lastDayOfLastMonth;
      break;
    case Timeframe.Year:
      startDate = firstDayOfYear;
      endDate = lastDayOfYear;
      break;
    case Timeframe.LastYear:
      startDate = firstDayOfLastYear;
      endDate = lastDayOfLastYear;
      break;
    case Timeframe.CustomMonth:
    case Timeframe.CustomYear:
      if (dateStart && dateEnd) {
        startDate = new Date(dateStart);
        endDate = new Date(dateEnd);
      }
      break;
    case Timeframe.AllTime:
      //Unix Epoch time, or January 1, 1970)
      startDate = new Date(0);
      endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      return { startDate, endDate };
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}
export function getPreviousTimeframe(timeframe: FilterTimeframe, dateStart?: Date, dateEnd?: Date) {
  let startDate: Date = new Date();
  let endDate: Date = new Date();
  let prevDate: string = "";

  const currentDate = new Date();
  const {
    dayStart,
    dayEnd,
    firstDayOfLastMonth,
    lastDayOfLastMonth,
    firstDayOfLastYear,
    lastDayOfLastYear,
    firstDayOfLastWeek,
    lastDayOfLastWeek,
  } = getFirstAndLastDays(currentDate);

  switch (timeframe) {
    case Timeframe.Day:
      startDate = new Date(dayStart);
      startDate.setDate(startDate.getDate() - 1);
      endDate = new Date(dayEnd);
      endDate.setDate(endDate.getDate() - 1);
      prevDate = format(startDate, "MMM dd, yyyy");
      break;
    case Timeframe.Yesterday:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      endDate = new Date(startDate);
      prevDate = format(startDate, "MMM dd, yyyy");
      break;
    case Timeframe.Week:
      startDate = firstDayOfLastWeek;
      endDate = lastDayOfLastWeek;
      prevDate = format(startDate, "MMM dd, yyyy");
      break;
    case Timeframe.LastWeek:
      startDate = new Date(firstDayOfLastWeek);
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date(lastDayOfLastWeek);
      endDate.setDate(endDate.getDate() - 7);
      prevDate = format(startDate, "MMM dd, yyyy");
      break;
    case Timeframe.Month:
      startDate = firstDayOfLastMonth;
      endDate = lastDayOfLastMonth;
      prevDate = format(startDate, "MMM yyyy");
      break;
    case Timeframe.LastMonth:
      startDate = new Date(firstDayOfLastMonth.getFullYear(), firstDayOfLastMonth.getMonth() - 1, 1);
      endDate = new Date(firstDayOfLastMonth.getFullYear(), firstDayOfLastMonth.getMonth(), 0);
      prevDate = format(startDate, "MMM yyyy");

      break;
    case Timeframe.Year:
      startDate = firstDayOfLastYear;
      endDate = lastDayOfLastYear;
      prevDate = format(startDate, "yyyy");
      break;
    case Timeframe.LastYear:
      startDate = new Date(firstDayOfLastYear);
      startDate.setFullYear(startDate.getFullYear() - 1);
      endDate = new Date(lastDayOfLastYear);
      endDate.setFullYear(endDate.getFullYear() - 1);
      prevDate = format(startDate, "yyyy");
      break;
    case Timeframe.CustomMonth:
      if (dateStart && dateEnd) {
        startDate = new Date(dateStart);
        endDate = new Date(dateEnd);
        // Subtract the appropriate amount of time based on the custom range
        const diffMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        startDate = subMonths(startDate, diffMonths);
        endDate = subMonths(endDate, diffMonths);
        prevDate = format(startDate, "MMM yyyy");
      }
      break;
    case Timeframe.CustomYear:
      if (dateStart && dateEnd) {
        startDate = new Date(dateStart);
        endDate = new Date(dateEnd);
        // Subtract the appropriate amount of time based on the custom range
        const diffYears = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
        startDate = subYears(startDate, diffYears);
        endDate = subYears(endDate, diffYears);
        prevDate = format(startDate, "yyyy");
      }
      break;
    case Timeframe.AllTime:
      // For AllTime, the previous timeframe doesn't really make sense
      //  could return null or handle this case differently
      startDate = new Date(0);
      endDate = new Date();
      prevDate = format(startDate, "MMM dd, yyyy");
      break;
    default:
      return { startDate, endDate, prevDate };
  }
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate, prevDate };
}
export const getDateFormat = (filterOption: string) => {
  switch (filterOption) {
    case Timeframe.Day:
    case Timeframe.Yesterday:
      return "h:mma";
    //"6:12pm"
    case Timeframe.Week:
    case Timeframe.LastWeek:
      return "eee";
    //Mon, Tue-01
    case Timeframe.Month:
    case Timeframe.LastMonth:
    case Timeframe.CustomMonth:
      return "dd";
    //"01"
    case Timeframe.Year:
    case Timeframe.LastYear:
    case Timeframe.CustomYear:
      return "MMM";
    //"Jan
    case Timeframe.AllTime:
      return "yyyy";
    //2023
    default:
      console.log("No data available.");
      return "";
  }
};

export const sortDates = <T extends { date: string }>(
  items: T[],
  filterOption: FilterTimeframe,
  dateFormat: string
): T[] => {
  const dayToNumber = (day: string) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.indexOf(day);
  };

  return items.sort((a, b) => {
    if (monthFilters.includes(filterOption)) {
      // Compare the full date strings
      const dateA = a.date ? (a.date as unknown as string).split(" ")[1] : "";
      const dateB = b.date ? (b.date as unknown as string).split(" ")[1] : "";

      return dateA.localeCompare(dateB);
    } else if (weekFilters.includes(filterOption)) {
      const getSortableKeyForWeek = (dateStr: string) => {
        if (!dateStr) {
          return "";
        }
        const [dayOfWeek, dayOfMonth] = dateStr.split(" - ");
        const dayNumber = dayToNumber(dayOfWeek);
        return `${dayNumber.toString().padStart(2, "0")}-${dayOfMonth.padStart(2, "0")}`; // Format as "dow-dd"
      };
      const keyA = getSortableKeyForWeek(a.date);
      const keyB = getSortableKeyForWeek(b.date);
      return keyA.localeCompare(keyB);
    } else {
      const dateA = parse(a.date, dateFormat, new Date());
      const dateB = parse(b.date, dateFormat, new Date());
      return compareAsc(dateA, dateB);
    }
  });
};
