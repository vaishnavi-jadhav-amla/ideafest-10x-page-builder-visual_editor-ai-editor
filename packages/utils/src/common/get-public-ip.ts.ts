import { logClient } from "@znode/logger";
import { AREA } from "@znode/logger/server";

export async function getClientPublicIp(): Promise<string | null> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");

    if (response.ok) {
      const data = await response.json();
      return data?.ip ?? null;
    }
  } catch (error) {
    logClient.error(AREA.USER_ACTIVITY, `Error fetching IP: ${error instanceof Error ? error.message : String(error)}`);
  }
  return null;
}
