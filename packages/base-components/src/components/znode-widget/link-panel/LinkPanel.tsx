"use client";

import { CustomImage } from "../../common/image/CustomImage";
import Link from "next/link";
import dataUrls from "./../../../../constants/dataUrls.json";
import { formatTestSelector } from "@znode/utils/common";

interface ILinkPanelProps {
  allLinks: Array<{
    url: string;
    isNewTab: boolean;
    mediaPath: string;
    title: string;
  }>;

  contentOrientation?: "horizontal" | "vertical";
  customClass?: string;
  isFont?: boolean;
  customImageClass: string;
}

export function LinkPanel(props: Readonly<ILinkPanelProps>) {
  const { contentOrientation = "", isFont, allLinks = [], customClass = "", customImageClass = "" } = props || {};

  const getOrientation = () => {
    return contentOrientation === "horizontal" ? "block md:items-center" : "flex flex-col";
  };
  // *** If you want to add a custom class then you can add in array directly
  const linkPanelClasses = ["grid", isFont ? "font-normal" : "font-medium", contentOrientation === "horizontal" ? "md:flex gap-0 md:gap-4" : "gap-0", getOrientation(), customClass]
    .filter(Boolean) // Remove falsy values
    .join(" ");
  return (
    <ul className={linkPanelClasses} data-test-selector="listLinkPanel">
      {allLinks.map((item, index) => {
        const { url = "", isNewTab = "", mediaPath = "", title = "" } = item || {};

        const linkTarget = isNewTab ? "_blank" : "_self";
        const imageClass = customImageClass || "pt-0";

        return (
          <li key={index} className={customClass} data-test-selector={formatTestSelector("list", title)}>
            <Link
              target={linkTarget}
              href={`${url || "#"}`}
              prefetch={false}
              data-test-selector={formatTestSelector("link", title)}
              aria-label={`${title} link${isNewTab ? " (opens in a new window)" : ""}`.trim()}
              className="flex"
            >
              {!mediaPath ? (
                title
              ) : (
                <CustomImage
                  src={`${mediaPath}`}
                  alt={title}
                  width={35}
                  height={35}
                  className={`${imageClass} h-[35px] w-[35px] object-cover`}
                  loading={"lazy"}
                  placeholder={"blur"}
                  blurDataURL={dataUrls.smallPlaceholder}
                  dataTestSelector={formatTestSelector("img", title)}
                  aria-label={title}
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
