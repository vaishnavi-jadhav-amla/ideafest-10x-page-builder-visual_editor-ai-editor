"use client";
import React, { useEffect } from "react";
import { useCommonDetails } from "../../stores/common";


const insertTrackingPixelScript = (trackingPixelScript: string) => {
  if (!trackingPixelScript) return;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = trackingPixelScript;

  tempDiv.childNodes.forEach((node) => {
    if (node.nodeName !== "SCRIPT") {
      document.body.appendChild(node.cloneNode(true));
    }
  });

  // Append scripts to the head
  tempDiv.querySelectorAll("script").forEach((script) => {
    if (script.src) {
      if (!document.querySelector(`script[src="${script.src}"]`)) {
        const newScript = document.createElement("script");
        newScript.src = script.src;
        newScript.defer = true;
        document.head.appendChild(newScript);
      }
    } else if (script.textContent?.trim()) {
      const inlineScript = document.createElement("script");
      inlineScript.textContent = script.textContent;
      inlineScript.type = "text/javascript";
      document.head.appendChild(inlineScript);
    }
  });
};

const TrackingPixel: React.FC = () => {
  const { analyticsInfo } = useCommonDetails();

  useEffect(() => {
    if (analyticsInfo?.trackingPixelScript) {
      insertTrackingPixelScript(analyticsInfo.trackingPixelScript);
    }
  }, [analyticsInfo?.trackingPixelScript]);

  return null;
};

export default TrackingPixel;
