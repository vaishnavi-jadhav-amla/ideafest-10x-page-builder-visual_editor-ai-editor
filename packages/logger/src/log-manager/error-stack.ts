/* eslint-disable @typescript-eslint/no-explicit-any */
export function errorStack(error: any) {
  if (error) {
    return error.stack;
  }
  return "";
}
