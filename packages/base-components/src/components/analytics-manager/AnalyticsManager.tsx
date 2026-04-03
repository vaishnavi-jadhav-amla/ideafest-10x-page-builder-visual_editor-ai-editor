"use client";
import { GoogleTagsManager } from "../google-tags-manager/GoogleTagsManager";
import { GoogleAnalyticsData } from "../google-analytics/GoogleAnalytics";
import { useCommonDetails } from "../../stores/common";

export function AnalyticsManager() {
  const {analyticsInfo } = useCommonDetails();
  return (
    <>
      {analyticsInfo.isEnabledTagManager && analyticsInfo.isEnabledEnhancedEcommerce ? <GoogleTagsManager containerId={analyticsInfo.containerId} /> : null}
      {analyticsInfo.isEnabledAnalytics ? <GoogleAnalyticsData analyticsUId={analyticsInfo.analyticsUId} /> : null}
    </>
  );
}
