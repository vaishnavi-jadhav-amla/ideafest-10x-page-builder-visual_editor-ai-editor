export function removeWhiteSpaces(data: string) {
  return data.trim();
}

export async function addDays(days: number) {
  const date: Date = new Date();
  const newDate = new Date(date.setTime(date.getTime() + days * 86400000));
  return newDate;
}

export const debounce = (callback: CallableFunction, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export function maskEmail(email: string) {
  if (!email || !email.includes("@")) return email || "";

  const [name, domain] = email.split("@");

  const mask = (str: string) => {
    if (!str) return str;
    if (str.length <= 2) return "*".repeat(str.length);
    return str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
  };

  // mask name
  const maskedName = mask(name);

  // mask domain
  const lastDot = domain.lastIndexOf(".");
  if (lastDot <= 0) return `${maskedName}@${domain}`;

  const domainLeft = domain.substring(0, lastDot);
  const tld = domain.substring(lastDot + 1);

  const maskedDomainLeft = mask(domainLeft);
  const maskedTld = tld.length <= 2 ? tld : tld[0] + "*".repeat(tld.length - 1);

  return `${maskedName}@${maskedDomainLeft}.${maskedTld}`;
}
