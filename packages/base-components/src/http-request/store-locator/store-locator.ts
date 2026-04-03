import { IStoreLocatorResponse } from "@znode/types/store-locator";
import { httpRequest } from "../base";

export async function getStoreLocator() {
  const response = await httpRequest<IStoreLocatorResponse>({ endpoint: "/api/store-locator" });
  return response;
}
