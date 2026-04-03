import dayjs from "dayjs";

export function safeJsonParse(jsonString?: string | null) {
  try {
    if (jsonString) {
      return JSON.parse(jsonString);
    } else return undefined;
  } catch (error) {
    return undefined;
  }
}

export const handleHTMLTags = (htmlString: string) => {
  return htmlString?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(data: any): boolean {
  if (data === undefined || data === null || data === "") {
    return true; // Check if data is undefined or null
  }

  if (Array.isArray(data)) {
    return data.length === 0; // Checks if it's an empty array
  }

  if (typeof data === "object" && data !== null) {
    return Object.keys(data).length === 0; // Checks if it's an empty object
  }

  return false;
}

export const getBaseUrl = () => {
  return window.location.origin;
};

export function removeFirstWord(input: string) {
  // eslint-disable-next-line newline-per-chained-call
  return input.split("-").slice(1).join("-");
}

export const convertFirstLetterToLowerCase = (input: string): string => {
  if (!input) return "";
  return input.charAt(0).toLowerCase() + input.slice(1) || "";
};
export const convertFirstLetterToUpperCase = (input: string): string => {
  if (!input) return "";
  return input.charAt(0).toUpperCase() + input.slice(1) || "";
};

export const sanitizeInputValue = (value: string, requiredMessage: string): string | boolean => {
  if (!value.trim()) {
    return requiredMessage;
  }
  const sanitizedValue = value ? value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "") : "";
  return sanitizedValue.trim() ? true : requiredMessage;
};

export const formatTestSelector = (prefix: string, value: string): string => {
  if (!value) return "";
  const isCamelCase = /^[a-z]+([A-Z][a-z]*)*$/.test(value);
  let formattedValue;
  if (isCamelCase) {
    formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
  } else {
    formattedValue = value
      .trim()
      .replace(/[-_/]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\B\w/g, (char) => char.toLowerCase())
      .replace(/\s/g, "");
  }
  return `${prefix}${formattedValue}`;
};

export const getUrl = (headersList: Headers) => {
  const linkHeader = headersList.get("link");
  const url = linkHeader ? linkHeader.split(">")[0].replace("<", "") : null;
  return url;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkDefaultWidgetHasData(data: any, widgetToRetrieve: { rootWidgetName: string; responsePropsName: string }, configType: string): boolean {
  if (data && data.length == 0) return true;
  const filteredData = data
    .filter((item: { type: string }) => widgetToRetrieve.rootWidgetName === item.type)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((item: { props: { response: { data: any } } }) => {
      if (configType === "product") {
        const hasProductBasicDetails = item?.props?.response?.data?.[widgetToRetrieve.responsePropsName];
        return hasProductBasicDetails;
      } else if (configType === "category") {
        return Array.isArray(item?.props?.response?.data?.[widgetToRetrieve.responsePropsName]?.productList);
      } else if (configType === "blog-details") {
        return item?.props?.response?.data;
      } else if (configType === "brand-details") {
        return !item?.props?.response?.data?.hasError;
      }
    });
  return filteredData && filteredData.length === 0;
}

export const decodeString = (link = "") => decodeURIComponent(link);

export const formatDateTime = (date: Date | null, dateFormat?: string, timeFormat?: string, displayTimeZone?: string): string => {
  if (!date) return "";
  if (dateFormat && timeFormat && displayTimeZone) {
    return dayjs(date).tz(displayTimeZone)
.format(`${dateFormat} ${timeFormat}`);
  }
  return dayjs(date).format();
};

export const encodeId = (id: number) => {
  return Buffer.from(id.toString()).toString("base64");
};

export const decodeId = (encoded: string) => {
  return parseInt(Buffer.from(encoded, "base64").toString("ascii"));
};