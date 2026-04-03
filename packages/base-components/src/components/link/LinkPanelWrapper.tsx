"use client";
import { getLinkPanelData } from "../../http-request";
import { useEffect, useState } from "react";
import { LinkPanel } from "../znode-widget";
import { ILinkData } from "@znode/types/widget";

interface ILinkPanelProps {
  contentOrientation?: "horizontal" | "vertical";
  customClass?: string;
  isFont?: boolean;
  widgetKey: string;
  widgetCode: string;
  typeOfMapping: string;
  customImageClass?: string;
}

function LinkPanelWrapper(props: ILinkPanelProps) {
  const { contentOrientation, widgetKey, widgetCode, typeOfMapping } = props;
  const [linkData, setLinkData] = useState<ILinkData[]>();
  const getLinkPanel = async () => {
    const requestPayload = {
      widgetKey: widgetKey,
      widgetCode: widgetCode,
      typeOfMapping: typeOfMapping,
    };
    const linkData = await getLinkPanelData(requestPayload);
    setLinkData(linkData);
  };
  useEffect(() => {
    getLinkPanel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!linkData) {
    return null;
  }

  return <LinkPanel allLinks={linkData || []} customImageClass={""} contentOrientation={contentOrientation} />;
}

export default LinkPanelWrapper;
