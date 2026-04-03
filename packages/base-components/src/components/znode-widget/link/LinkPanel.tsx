import { ILinkData, IWidget } from "@znode/types/widget";

import { CustomImage } from "../../common/image";
import Link from "next/link";
import { formatTestSelector } from "@znode/utils/common";
import { getLinkData } from "@znode/agents/widget";
import { getPortalHeader } from "@znode/utils/server";

const fetchData = async (props: Omit<IWidget, "localeId" | "portalId">) => {
  try {
    const { localeId, portalId } = await getPortalHeader();
    const { widgetKey, widgetCode, typeOfMapping } = props;
    const linkWidgetData = await getLinkData({
      localeId: localeId,
      widgetKey: widgetKey,
      widgetCode: widgetCode,
      typeOfMapping: typeOfMapping,
      cmsMappingId: portalId,
      portalId: portalId,
    });
    return linkWidgetData;
  } catch (e) {
    return null;
  }
};

export async function LinkWidget(props: Omit<IWidget, "localeId" | "portalId">): Promise<JSX.Element> {
  const { contentOrientation, customClass, isFont, customImageClass, widgetKey } = props;
  const linkWidgetData = await fetchData(props);

  const renderWidgetLinks = (linkWidgetConfigurationList: ILinkData[]) => {
    const linkWidgets = linkWidgetConfigurationList.map((linkWidgetConfigurationData: ILinkData, i) => {
      const { url, isNewTab, mediaPath, title } = linkWidgetConfigurationData;
      if (url) {
        return (
          <li key={i} className={customClass} data-test-selector={formatTestSelector("list", `${title}`)}>
            <Link target={isNewTab ? "_blank" : "_self"} href={`${url}`} prefetch={false} data-test-selector={formatTestSelector("link", `${title}`)}>
              {!mediaPath && widgetKey !== "222" ? (
                title
              ) : (
                <CustomImage
                  src={mediaPath ?? ""}
                  alt={title}
                  width={35}
                  height={35}
                  className={customImageClass || "pt-3"}
                  dataTestSelector={formatTestSelector("img", `${title}`)}
                />
              )}
            </Link>
          </li>
        );
      }
    });
    return linkWidgets;
  };

  const getOrientation = () => {
    return contentOrientation === "horizontal" ? "flex flex-wrap" : "block";
  };

  return (
    <div>{linkWidgetData && <ul className={`link-panel widget gap-6 ${isFont ? "font-normal" : "font-medium"} ${getOrientation()}`}>{renderWidgetLinks(linkWidgetData)}</ul>}</div>
  );
}
