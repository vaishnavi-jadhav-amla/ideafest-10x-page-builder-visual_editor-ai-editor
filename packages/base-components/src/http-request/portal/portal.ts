import { IPortalDetail } from "@znode/types/portal";
import { httpRequest } from "../base";

export const getPortalData = async () => {
  const portalData = await httpRequest<IPortalDetail>({ endpoint: "/api/common/analytics-details" });
  return portalData;
};
