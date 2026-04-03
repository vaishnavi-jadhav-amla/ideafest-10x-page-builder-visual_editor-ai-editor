"use client";
import { GoogleTagManager } from "@next/third-parties/google";

interface IContainerData {
  containerId: string;
}
export function GoogleTagsManager(props: IContainerData) {
  return props.containerId && <GoogleTagManager gtmId={props.containerId} />;
}
