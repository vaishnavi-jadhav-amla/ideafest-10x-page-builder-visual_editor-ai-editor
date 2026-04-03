import { IUserActivityLog } from "@znode/types/user-activity";
import { httpRequest } from "../base";
import { getClientPublicIp } from "@znode/utils/common";

type WindowWithFlag = Window & { isUserActivityTrackerEnabled?: boolean };

function checkUserActivityFlag(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as WindowWithFlag).isUserActivityTrackerEnabled);
}

export async function userActivityLog(body: IUserActivityLog) {
  const isUserActivityTrackingEnabled = checkUserActivityFlag();
  if (!isUserActivityTrackingEnabled) {
    return;
  }
  const ip = (await getClientPublicIp()) ?? "Unknown IP";
  await httpRequest<string>({
    endpoint: "/api/user-activity",
    method: "POST",
    body: { ...body, ip },
  });
}
