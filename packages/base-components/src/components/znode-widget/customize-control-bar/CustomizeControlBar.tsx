"use client";

import { useEffect } from "react";

import { ActionBar, usePuck } from "@measured/puck";
import { ZIcons } from "../../common/icons";

import { IWidget } from "@znode/types/widget";
import { produce } from "immer";
import { isEmpty, removeFirstWord } from "@znode/utils/common";

interface ICustomizeControlBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedConfig: any;
  widgetConfig: IWidget & { masterWidgetKey?: string };
  customizedBarSettings: {
    isVisible: boolean;
  };
  openPopup: () => void;
}

interface ParentMessage {
  data: {
    category: string;
  };
}

const ContentPages = {
  WidgetBar: "widgetBar",
  CMSWidgetBar: "cmsWidgetBar",
  ContentPageMapping: "ContentPageMapping",
  PortalMapping: "PortalMapping",
};

export function CustomizeControlBar(props: Partial<ICustomizeControlBarProps>) {
  const { widgetConfig, selectedConfig } = props || {};
  const { selectedItem, dispatch } = usePuck();

  const {
    widgetCode = "",
    displayName = "",
    widgetName = "",
    typeOfMapping = "",
    cmsMappingId = "",
    localeId = undefined,
    publishCatalogId = undefined,
    properties = {},
    masterWidgetKey = "",
    // isNonConfigurable = false,
  } = widgetConfig || {};

  function sendMessageOutsideIframe() {
    const hasPostMessage = selectedConfig?.hasPostMessage;
    if (hasPostMessage) {
      // trigger event for window postMessage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const postMessagePayload: any = selectedItem?.props?.config?.postMessagePayload;

      if (postMessagePayload && typeof postMessagePayload === "object" && !Array.isArray(postMessagePayload)) {
        window.postMessage(postMessagePayload, "*");
      } else {
        // eslint-disable-next-line no-console
        console.warn("Invalid postMessagePayload:", postMessagePayload);
      }

      return;
    }

    const id = removeFirstWord(selectedItem?.props.id);
    const updateWidgetKey = id ? `${masterWidgetKey}-${id}` : masterWidgetKey;

    dispatch({
      type: "setData",
      data: (data) => {
        const newData = produce(data, (draft) => {
          // Update content array
          draft.content = draft.content.map((content) => {
            if (content.props.id === selectedItem?.props.id && !isEmpty(content?.props?.config) && !isEmpty(content.props.config.widgetConfig)) {
              const id = removeFirstWord(selectedItem?.props.id);
              const newWidgetKey = `${content.props.config.widgetConfig.masterWidgetKey}-${id}`;
              content.props = {
                ...content.props,
                config: {
                  ...content.props.config,
                  widgetConfig: {
                    ...content.props.config.widgetConfig,
                    widgetKey: newWidgetKey,
                  },
                },
              };
            }
            return content;
          });

          if (draft.zones) {
            Object.keys(draft.zones).forEach((zoneKey) => {
              if (draft.zones) {
                draft.zones[zoneKey] =
                  draft.zones &&
                  draft.zones[zoneKey].map((zoneContent) => {
                    if (zoneContent.props.id === selectedItem?.props.id && !isEmpty(zoneContent?.props?.config) && !isEmpty(zoneContent.props.config.widgetConfig)) {
                      const id = removeFirstWord(selectedItem?.props.id);
                      const newWidgetKey = `${zoneContent.props.config.widgetConfig.masterWidgetKey}-${id}`;
                      zoneContent.props = {
                        ...zoneContent.props,
                        config: {
                          ...zoneContent.props.config,
                          widgetConfig: {
                            ...zoneContent.props.config.widgetConfig,
                            widgetKey: newWidgetKey,
                          },
                        },
                      };
                    }
                    return zoneContent;
                  });
              }
            });
          }
        });

        // eslint-disable-next-line no-console
        console.log("PreparedDataWithUpdatedWidgetKey", newData);
        return newData;
      },
    });

    const eventData = {
      type: "update",
      actionType: "customize_widget",
      category: "widget",
      data: {
        widgetName,
        widgetKey: updateWidgetKey,
        widgetCode,
        typeOfMapping,
        displayName,
        cmsMappingId,
        localeId,
        publishCatalogId,
        properties,
        masterWidgetKey,
      },
    };
    if (window.parent) {
      window.parent.postMessage(eventData, "*");

    }
  }

  function receiveMessage(parentMessage: ParentMessage) {
    if (parentMessage?.data?.category === ContentPages.CMSWidgetBar) {
      if (widgetConfig?.typeOfMapping === ContentPages.ContentPageMapping) {
        widgetBar();
      }
    } else if (parentMessage?.data?.category === ContentPages.WidgetBar) {
      if (widgetConfig?.typeOfMapping === ContentPages.PortalMapping) {
        widgetBar();
      }
    }
  }

  function widgetBar() {
    const customizedBarSettings = {
      isVisible: [widgetConfig?.widgetCode].includes(widgetConfig?.widgetCode),
    };
    if (customizedBarSettings && customizedBarSettings.isVisible) {
      const elements = document.querySelectorAll(".block.rounded-full");

      elements.forEach((element) => {
        (element as HTMLElement).style.pointerEvents = "auto";
      });
    }
  }

  function fetchData() {
    if (window.parent) {
      window.parent.postMessage({ category: "widget" }, "*");

    }
  }

  useEffect(() => {
    window.addEventListener("message", receiveMessage);

    if (window.document.readyState === "complete") {
      fetchData();
    } else {
      window.addEventListener("load", fetchData);
    }

    return () => {
      window.removeEventListener("load", fetchData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ActionBar.Action onClick={sendMessageOutsideIframe}>
      <ZIcons name="settings" strokeWidth={"2px"} />
    </ActionBar.Action>
  );
}

export default CustomizeControlBar;
