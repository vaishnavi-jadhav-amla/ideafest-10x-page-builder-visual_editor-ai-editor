"use client";

import { useEffect, useState } from "react";

import { getContentBlockDetails } from "../../http-request";
import { sanitizeHTML } from "@znode/utils/common";

export default function RenderBlock({ blockKey }: Readonly<{ blockKey: string }>) {
  const [contentData, setContentData] = useState<string>();


  const getRenderBlock = async (inputKey: string) => {
    const contentBlock = await getContentBlockDetails({ inputKey: inputKey });
    const sanitizedHtml = sanitizeHTML(contentBlock || "");
    setContentData(sanitizedHtml);
  };

  useEffect(() => {
    getRenderBlock(blockKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="text-2xl font-semibold" dangerouslySetInnerHTML={{ __html: contentData ?? "" }} />;
}
