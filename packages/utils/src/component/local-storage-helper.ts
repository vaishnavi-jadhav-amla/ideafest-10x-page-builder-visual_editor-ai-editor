/**
 * Gets Data from LocalStorage on the basis of given key.
 * @param key
 * @returns
 */
export function getLocalStorageData(key: string): string {
  const isServer = typeof window === "undefined";
  if (!isServer && key) {
    return localStorage.getItem(key.toString()) || "";
  }
  return "";
}

/**
 * Sets Data on LocalStorage on the basis of given key.
 * @param key
 * @param value
 */
export function setLocalStorageData(key: string, value: string) {
  const isServer = typeof window === "undefined";
  if (!isServer && key && value) {
    localStorage.setItem(key.toString(), value.toString());
  }
}

export function removeLocalStorageData(key: string) {
  const isServer = typeof window === "undefined";
  if (!isServer && key) {
    localStorage.removeItem(key.toString());
  }
}

/**
 * Clears all LocalStorageData
 * @param key
 */
export function clearLocalStorageData() {
  const isServer = typeof window === "undefined";
  if (!isServer) {
    localStorage.clear();
  }
}
