/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidateTag } from "next/cache";
import {
  clearCategoryPageCaching,
  clearHomePageCaching,
  clearLayoutPageCaching,
  clearPortalCaching,
  clearProductPageCaching,
  clearTagLevelCaching,
  clearCartPageCaching,
  clearCheckoutPageCaching,
} from "@znode/agents/revalidate";
import { EVENT_NAME } from "@znode/constants/cache-keys";
import { publishEviction } from "@znode/cache";
import { portalDataCache, portalPromiseMap } from "@znode/agents/portal/global";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    console.log("request data for revalidation received from API ---> ", requestData);
    if (requestData.EventType === "Cache") {
      const {tag, parentKey}: {tag: string[], parentKey?: string} = await clearTagLevelCaching(requestData);
      
      tag.forEach((tag) => {
        revalidateTag(tag);
      });
      
        const allKeys = [
      ...portalDataCache.keys(),
      ...portalPromiseMap.keys(),
      ];
      await publishEviction(allKeys);
      console.log("data evicted with tag ->", tag);

      if (
        requestData.EventName === EVENT_NAME.PortalPublishEvent ||
        requestData.EventName === EVENT_NAME.PortalUpdateEvent ||
        requestData.EventName === EVENT_NAME.VisualEditorPublishEvent ||
        requestData.EventName === EVENT_NAME.ManuallyRefreshWebStoreCacheEvent
      ) {
         clearPortalCaching(tag, parentKey);
      }

      if (
        requestData.EventName === EVENT_NAME.ProductPublishEvent ||
        requestData.EventName === EVENT_NAME.CustomerReviewUpdateEvent ||
        requestData.EventName === EVENT_NAME.ProductPriceUpdateEvent ||
        requestData.EventName === EVENT_NAME.ProductInventoryUpdateEvent
      ) {
         clearProductPageCaching(tag);
      }

      if (
        requestData.EventName === EVENT_NAME.CategoryPublishEvent ||
        requestData.EventName === EVENT_NAME.ProductPriceUpdateEvent ||
        requestData.EventName === EVENT_NAME.ProductInventoryUpdateEvent ||
        requestData.EventName === EVENT_NAME.CustomerReviewUpdateEvent
      ) {
         clearCategoryPageCaching(tag);
      }

      if (requestData.EventName === EVENT_NAME.BannerSliderPublishEvent || requestData.EventName === EVENT_NAME.ContentContainerPublishEvent) {
         clearHomePageCaching(parentKey);
      }

      if (requestData.EventName === EVENT_NAME.CatalogPublishEvent) {
        clearLayoutPageCaching(parentKey);
      }
      
        // Clear Cart and Checkout page caching for Portal-related events
      if (
        requestData.EventName === EVENT_NAME.PortalPublishEvent ||
        requestData.EventName === EVENT_NAME.PortalUpdateEvent ||
        requestData.EventName === EVENT_NAME.VisualEditorPublishEvent ||
        requestData.EventName === EVENT_NAME.ManuallyRefreshWebStoreCacheEvent
      ) {
         clearCartPageCaching();
         clearCheckoutPageCaching();
      }
      return new Response("revalidated successfully ", { status: 200 });
    }
    return new Response("event triggered Successfully", { status: 200 });
  } catch (error) {
    return new Response(`failed to revalidate. ${String(error)}`, { status: 500 });
  }
}
