import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { DynamicWidgetRender } from "./DynamicWidgetRender";
import { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import { WIDGET_CONFIGURATION_MESSAGES } from "packages/page-builder/src/constants/constants";
import { CodeEditorWrapper } from "./CodeEditorWrapper";

type IConfig = Omit<IPageOrWidgetConfig, "widgetConfig">;

export type IDynamicWidgetConfig = {
  text: string;
  config?: IConfig;
};

export type IDynamicWidgetRenderProps = IDynamicWidgetConfig & IRenderProps;

const defaultDynamicPostMessagePayload: Record<string, any> = {
  type: "update",
  actionType: "open_popup",
  category: "widget",
  data: {
    widgetName: "DynamicWidget",
    text: "",
  },
};

const defaultDynamicConfig: IConfig = {
  type: "Widget",
  id: "DynamicWidget",
  hasConfigurable: true,
  hasPostMessage: true,
  postMessagePayload: defaultDynamicPostMessagePayload,
};

export const DynamicWidgetConfig: ComponentConfig<IDynamicWidgetConfig> = {
  fields: {
    text: {
      label: "",
      type: "custom",
      render: ({ value, onChange }) => <CodeEditorWrapper value={value} onChange={onChange} />,
    },
  },
  defaultProps: {
    text: "",
    config: defaultDynamicConfig,
  },
  resolveData: ({ props }) => {
    const text = props.text;

    let updatedConfig: IConfig | undefined = {
      ...defaultDynamicConfig,
      postMessagePayload: {
        ...defaultDynamicPostMessagePayload,
        data: {
          widgetName: "DynamicWidget",
          text: text,
        },
      },
    };

    return {
      props: {
        config: updatedConfig,
      },
    };
  },
  label: "Dynamic Widget",
  render: (props: IDynamicWidgetRenderProps) => (
    <DataStateHandler response={props.text} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.DYNAMIC_WIDGET_EMPTY_MESSAGE}>
      <DynamicWidgetRender {...props} />
    </DataStateHandler>
  ),
};
