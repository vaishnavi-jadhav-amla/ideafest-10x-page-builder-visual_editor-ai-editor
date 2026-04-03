"use client";
import { IFeedbackRenderProps } from "./FeedbackPageConfig";
import { Feedback } from "@znode/base-components/components/page-widget";
export function FeedbackPageRender(props: Readonly<IFeedbackRenderProps>) {
  return <Feedback {...props} />;
}
