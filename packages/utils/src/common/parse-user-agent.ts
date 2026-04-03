export function parseBrowser(ua: string): string {
  const browserMatchers: [RegExp, string][] = [
    [/Edg\/([\d.]+)/, "Edge"],
    [/(OPR|Opera)\/([\d.]+)/, "Opera"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/Firefox\/([\d.]+)/, "Firefox"],
    [/Safari\/([\d.]+)/, "Safari"],
  ];

  for (const [regex, name] of browserMatchers) {
    const match = ua.match(regex);
    if (match) {
      const version = match[2] || match[1] || "Unknown";
      return `${name} ${version}`;
    }
  }

  return "Unknown";
}

export function parseOS(ua: string): string {
  const osMatchers: [RegExp, string][] = [
    [/Windows NT 10.0/, "Windows 10"],
    [/Windows NT 6.3/, "Windows 8.1"],
    [/Windows NT 6.2/, "Windows 8"],
    [/Windows NT 6.1/, "Windows 7"],
    [/Mac OS X ([\d_]+)/, "macOS"],
    [/Android ([\d.]+)/, "Android"],
    [/iPhone OS ([\d_]+)/, "iOS"],
    [/iPad; CPU OS ([\d_]+)/, "iOS"],
    [/Linux/, "Linux"],
  ];

  for (const [regex, name] of osMatchers) {
    const match = ua.match(regex);
    if (match) {
      return name;
    }
  }

  return "Unknown";
}

export function calculateSessionDuration(loginTimeISO: string, logoutTimeISO: string): string {
  const loginTime = new Date(loginTimeISO);
  const logoutTime = new Date(logoutTimeISO);

  const diffMs = Math.max(0, logoutTime.getTime() - loginTime.getTime());

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formatTimeUnit = (n: number) => String(n).padStart(2, "0");

  return `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)}`;
}
