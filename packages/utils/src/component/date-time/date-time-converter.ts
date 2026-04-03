import dayjs, { Dayjs } from "dayjs";

import getCookie from "../cookies";
import { getDefaultInHandDate } from "./date-picker";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

/*
 This method returns Date and time according to timezone which is set in global setting for display.
*/
export const convertDateTime = (date: string, dateFormat?: string, timeFormat?: string, displayTimeZone?: string) => {
  if (dateFormat && timeFormat && displayTimeZone) {
    const convertedDate = dayjs
      .utc(date)
      .tz(displayTimeZone)
      .format(dateFormat + " " + timeFormat);
    return convertedDate;
  } else return date;
};

/**
 * This method returns date according to the timezone which is set in global setting for display.
 *
 * @param date
 * @returns
 */
export const convertDate = (date: string, dateFormat?: string, displayTimeZone?: string) => {
  if (dateFormat && displayTimeZone) {
    const convertedDate = dayjs.utc(date).tz(displayTimeZone)
      .format(dateFormat);
    return convertedDate;
  } else if (date && dateFormat) {
    return dayjs(date)?.format(dateFormat);
  } else return date;
};

export const convertTimeOnly = (date: string, timeFormat?: string, displayTimeZone?: string) => {
  if (timeFormat && displayTimeZone) {
    return dayjs.utc(date).tz(displayTimeZone)
.format(timeFormat);
  } else {
    return date;
  }
};

/**
 * This method returns In-hand date according to the timezone which is set in global setting for display.
 *
 * @param date
 * @returns
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertInHandDate = (dateString: string, dateFormat: string) => {
  if (dateFormat) {
    const [year, month, day] = dateString.split("-");

    let formattedDate;
    if (dateFormat.includes("MMM")) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = parseInt(month || "", 10) - 1;
      const monthAbbreviation = monthNames[monthIndex];
      formattedDate = dateFormat.replace("MMM", monthAbbreviation);
    } else {
      formattedDate = dateFormat.replace("MM", month?.padStart(2, "0"));
    }
    formattedDate = formattedDate.replace("DD", day);

    if (dateFormat?.includes("YYYY")) {
      formattedDate = formattedDate.replace("YYYY", year?.padStart(4, "20"));
    } else if (dateFormat?.includes("YY")) {
      formattedDate = formattedDate.replace("YY", year?.slice(-2));
    }

    return formattedDate;
  } else return dateString;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertAndApplyGlobalDateFormat = (inputDate: string, dateFormat: string) => {
  if (inputDate) {
    let formattedInHandDate = "";
    const dateObject = new Date(inputDate);
    formattedInHandDate = dateObject.toLocaleDateString(getCookie("NEXT_LOCALE"), { month: "2-digit", day: "2-digit", year: "numeric" });
    const [month, day, year] = formattedInHandDate.split("/");
    formattedInHandDate = `${year}-${month}-${day}`;
    if (formattedInHandDate === "Invalid Date") {
      formattedInHandDate = getDefaultInHandDate();
    }
    formattedInHandDate = convertInHandDate(formattedInHandDate, dateFormat);
    return formattedInHandDate;
  }
};

export const getCurrentDate = (displayTimeZone?: string): Dayjs => {
  let currentDate = dayjs();

  //changing date timezone
  if (displayTimeZone) {
    currentDate = currentDate.utc().tz(displayTimeZone) || "";
  }
  currentDate.hour(0).minute(0)
    .second(0);

  return currentDate;
};
