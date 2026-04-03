"use client";

import { IStoreLocatorRenderProps } from "./StoreLocatorPageConfig";
import { StoreLocator } from "@znode/base-components/components/store-locator";
export function StoreLocatorPageRender(props: Readonly<IStoreLocatorRenderProps>) {
  const { googleMapApiKey, appName } = props?.response?.data ?? {};
  return <StoreLocator googleMapKey={googleMapApiKey || ""} appName={appName} />;
}
