import { ANALYTICS_EVENTS } from "@znode/constants/analytics-event";
import { sendGTMEvent } from "@next/third-parties/google";

interface IAnalyticsEvent {
  event: string;
  ecommerce: object;
}

export function sendAnalyticsEvent(analyticsEvent: IAnalyticsEvent) {
  if (analyticsEvent.event === ANALYTICS_EVENTS.PURCHASE) {
    analyticsEvent.event = "gtm.dom";
  }
  sendGTMEvent(analyticsEvent);
}