"use client";
import { GoogleAnalytics } from "@next/third-parties/google";

interface IGoogleAnalyticsData {
  analyticsUId: string;
}

export function GoogleAnalyticsData(props: IGoogleAnalyticsData) {
  return props.analyticsUId ? <GoogleAnalytics gaId={props.analyticsUId} /> : null;
}
