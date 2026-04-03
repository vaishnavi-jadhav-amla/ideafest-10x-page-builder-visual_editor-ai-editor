/**
 * @deprecated This function is deprecated use this one instead stringToBooleanV2
 * @function stringToBooleanV2.
 */
export function stringToBoolean(str: string) {
  if (typeof str !== "string") {
    return;
  }
  const lowerCaseStr = str.toLowerCase();
  if (lowerCaseStr === "true") {
    return true;
  } else if (lowerCaseStr === "false") {
    return false;
  }
}

export function stringToBooleanV2(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    if (text === "true" || text === "1") return true;
    if (text === "false" || text === "0") return false;
  }
  return false;
}