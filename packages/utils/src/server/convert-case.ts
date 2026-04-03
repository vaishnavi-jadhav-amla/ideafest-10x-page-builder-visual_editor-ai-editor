/* eslint-disable @typescript-eslint/no-explicit-any */
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonArray = Array<JsonValue>;

const PREFIXES: string[] = ["SEO", "CMS", "SKU", "VAT", "HST", "GST", "PST", "URL", "CRS", "SMS", "CSR"];

/** Convert pascal case to camel case */
export function convertCamelCase(obj: JsonValue | JsonArray | any): JsonValue | any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertCamelCase(item));
  } else if (obj !== null && typeof obj === "object") {
    const newObj: JsonObject = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = toCamel(key);
        newObj[newKey] = convertCamelCase(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

function toCamel(str: string): string {
  for (const prefix of PREFIXES) {
    if (str.startsWith(prefix)) {
      return prefix.toLowerCase() + str.slice(prefix.length).replace(/_./g, (match) => (match[1] || "").toUpperCase());
    } else if (str.endsWith(prefix)) {
      return str.slice(0, -prefix.length).toLowerCase() + prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
    }
  }
  return str.replace(/_./g, (match) => (match[1] || "").toUpperCase()).replace(/^[A-Z]/, (match) => match.toLowerCase());
}

/** Covert camel case to pascal case */
export function convertPascalCase(obj: JsonValue | JsonArray | any): JsonValue | any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertPascalCase(item));
  } else if (obj !== null && typeof obj === "object") {
    const newObj: JsonObject = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = toPascal(key);
        newObj[newKey] = convertPascalCase((obj as JsonObject)[key] as JsonValue);
      }
    }
    return newObj;
  }
  return obj;
}

function toPascal(str: string): string {
  if (typeof str !== "string") {
    return str; // Return as is if not a string
  }

  let result = str.replace(/(^\w|_\w)/g, (match) => match.replace("_", "").toUpperCase());

  for (const prefix of PREFIXES) {
    const regex = new RegExp(`(${prefix})`, "i");
    if (regex.test(str)) {
      result = result.replace(regex, prefix);
    }
  }

  return result;
}
