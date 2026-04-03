import type { Data } from "@measured/puck";
import { INullablePageStructure, IPageStructure, PWidget } from "@znode/types/visual-editor";
import { IPageVariant } from "../types/page-builder";
import { PAGE_CONSTANTS } from "@znode/page-builder/constants";
import { config } from "process";

export function replaceDynamicSegment(url: string): string {
  return url
    .replace(/\/[^/]+$/, (match) => {
      let ignoredUrl = ["brand/list", "blog/list"];
      // Check if the segment contains only numbers (like in "category/89" or "brand/123")
      if (url.startsWith("content") && /\d+/.test(match)) {
        return `${match}`;
      } else if (/\d+/.test(match) || (!ignoredUrl.some((data) => url.startsWith(data)) && (url.startsWith("brand/") || url.startsWith("blog/")))) {
        if (url.startsWith("brand/") || url.startsWith("blog/")) return "details";
        return "/{id}";
      } else if (ignoredUrl.some((data) => url.startsWith(data))) {
        return "list";
      }
      // For non-numeric segments, replace with a common placeholder
      return "/{common}";
    })
    .replace(/\bpages?\b/gi, "")
    .replace(/\s+/g, "");
}

export function extractDynamicValue(url: string) {
  // Clean up the URL and split into segments
  const segments = url.split("/").filter((segment) => segment); // Filter out empty segments

  // If there are no segments, return null
  if (segments.length === 0) {
    return null;
  }

  // Get the last segment
  const lastSegment: string = segments.pop() || "";

  // Check if the last segment is an ID (purely numeric)
  if (/^\d+$/.test(lastSegment)) {
    return lastSegment; // Return the ID
  }

  // Otherwise, return the last segment as a common value
  return lastSegment; // Return the common segment
}

// *** Note: Remove API Response ***
export function removeApiResponse(data: Data,   pageStructure?: IPageStructure): Data {
  const cleanData = JSON.parse(JSON.stringify(data));
  const content = cleanData.content;
  const zones = cleanData.zones;
  const widgets = pageStructure?.widgets || [];
  for (let item of content) {
    if (item.props?.response) {
      item.props.response = null;
    }
    
    if(item.props?.config?.type == "Widget")
    {
        widgetList(item.props?.config, widgets)
    }
  }

  if (typeof zones === "object") {
    Object.entries(zones).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((zone) => {
          zone.props?.response !== undefined && (zone.props.response = null);
           if(zone.props?.config?.type == "Widget")
            {
                widgetList(zone.props?.config, widgets)
            }
        });
      }
    });
  }

  return cleanData;
}

export function doPostMessageToParent(type: String, actionType: string, category: string, updatedData: any) {
  const eventData = {
    type: type,
    actionType: actionType,
    category: category,
    data: updatedData,
  };
  if (window.parent) {
    window.parent.postMessage(eventData, "*");
  }
}

 function widgetList(config: any , widgets : PWidget[]) {
  const key = config?.widgetConfig?.widgetKey;
  if(!widgets.some(widget => widget?.widgetKey === key))
  { 

    widgets.push({ widgetKey: config?.widgetConfig?.widgetKey, type: config.widgetConfig?.widgetCode});
  }
}

export function removeFirstWord(input: string) {
  return input.split("-").slice(1).join("-");
}

export function generateRandomNumber() {
  return Math.floor(Math.random() * 5000) + 1;
}

export function getUpdatedWidgetUrl(currentUrl: string, apiUrl: string) {
  if (!currentUrl) {
    return apiUrl;
  }
  const contentPageId = new URL(currentUrl).searchParams.get("contentPageId");
  const updatedUrl = contentPageId ? `${apiUrl}&typeOfMapping=${"ContentPageMapping"}&cmsMappingID=${contentPageId}` : `${apiUrl}&typeOfMapping=${"PortalMapping"}`;
  return updatedUrl;
}

const getZoneId = (zoneCompound: string) => {
  if (!zoneCompound) {
    return "";
  }
  if (zoneCompound && zoneCompound.indexOf(":") > -1) {
    return zoneCompound.split(":")[0];
  }
  return zoneCompound;
};

export function findZonesForContentType(data: Data) {
  const contentItems = data.content;
  const zones = data.zones || {};
  let zoneCollections = {};
  function collectZonesByType(parentId: string, contentType: string, zonesByType: any) {
    Object.keys(zones).forEach((zoneKey) => {
      const matchesParent = getZoneId(zoneKey) === parentId;
      if (matchesParent) {
        const childZones = zones[zoneKey];
        if (!zonesByType[contentType]) {
          zonesByType[contentType] = {};
        }
        zonesByType[contentType][zoneKey] = childZones;
        childZones.forEach((childZoneItem) => {
          const childParentId = childZoneItem.props.id;
          collectZonesByType(childParentId, contentType, zonesByType);
        });
      }
    });
    return zonesByType;
  }

  contentItems.forEach((contentItem, index) => {
    console.group(`Processing content item: ${index}`, contentItem.props.id, contentItem.type);
    const parentId = contentItem.props.id;
    const contentType = contentItem.type;
    const zoneTree = {};
    const zonesByType = collectZonesByType(parentId, contentType, zoneTree);
    zoneCollections = { ...zoneCollections, ...zonesByType };
    console.log("Zones by Type:", zonesByType);
    console.groupEnd();
  });
  return zoneCollections;
}

export function mergeHeaderFooterAndMainContent(
  mainContentJson: INullablePageStructure,
  headerJson: INullablePageStructure,
  footerJson: INullablePageStructure,
  pageVariant: IPageVariant
) {
  let mergeContent: Data["content"] = [];
  let mergeZones: Data["zones"] = {};
  let mergeRoot: Data["root"] = {};

  if (mainContentJson?.data && pageVariant !== PAGE_CONSTANTS.GENERAL.LAYOUT) {
    const {
      data: { content, zones, root },
    } = mainContentJson;
    mergeContent = content;
    mergeZones = zones;
    mergeRoot = root;
  }

  if (headerJson?.data) {
    const {
      data: { content = [], zones = {} },
    } = headerJson;
    const headerContent = content.filter((i) => i.type !== PAGE_CONSTANTS.GENERAL.EMPTYBOX);
    mergeContent = [...headerContent, ...mergeContent];

    Object.keys(zones).forEach((key) => {
      const items = zones[key];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item.type === PAGE_CONSTANTS.WIDGETS.LINKPANEL) {
            item.props.pageVariant = PAGE_CONSTANTS.GENERAL.LAYOUT;
          }
        });
      }
    });
    mergeZones = { ...mergeZones, ...zones };
  }

  if (footerJson?.data) {
    const {
      data: { content: footerContent = [], zones = {} },
    } = footerJson;
    mergeContent = [...mergeContent, ...footerContent];
    Object.keys(zones).forEach((key) => {
      const items = zones[key];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item.type === PAGE_CONSTANTS.GENERAL.FLEX || item.type === PAGE_CONSTANTS.GENERAL.COLUMN) {
            if (item.props) {
              item.props.hasDropZoneDisabled = true;
            }
          }

          if (item.type === PAGE_CONSTANTS.WIDGETS.LINKPANEL) {
            item.props.pageVariant = PAGE_CONSTANTS.GENERAL.LAYOUT;
          }
        });
      }
    });

    mergeZones = { ...mergeZones, ...zones };
  }

  return { content: mergeContent, zones: mergeZones, root: mergeRoot };
}

export function hasMainContent(pageVariant: IPageVariant, publicId: string): boolean {
  return (
    (pageVariant === PAGE_CONSTANTS.GENERAL.MAIN_CONTENT || pageVariant === PAGE_CONSTANTS.GENERAL.ALL) &&
    publicId !== PAGE_CONSTANTS.URLS.FOOTER &&
    publicId !== PAGE_CONSTANTS.URLS.HEADER
  );
}

export function hasHeader(pageVariant: IPageVariant): boolean {
  return pageVariant === PAGE_CONSTANTS.PAGE_CODES.HEADER || pageVariant === PAGE_CONSTANTS.GENERAL.ALL || pageVariant === PAGE_CONSTANTS.GENERAL.LAYOUT;
}

export function hasFooter(pageVariant: IPageVariant): boolean {
  return pageVariant === PAGE_CONSTANTS.PAGE_CODES.FOOTER || pageVariant === PAGE_CONSTANTS.GENERAL.ALL || pageVariant === PAGE_CONSTANTS.GENERAL.LAYOUT;
}

export function hasNotAllOrLayout(pageVariant: IPageVariant) {
  return pageVariant !== PAGE_CONSTANTS.GENERAL.ALL && pageVariant !== PAGE_CONSTANTS.GENERAL.LAYOUT;
}

export function createPageStructure(key: string, data: Data & {pageVersion?: number}, headerData?: Data, footerData?: Data): INullablePageStructure {
  return {
    key,
    data,
    headerData,
    footerData,
    ...(data?.pageVersion&&{pageVersion: data.pageVersion})
  };
}
