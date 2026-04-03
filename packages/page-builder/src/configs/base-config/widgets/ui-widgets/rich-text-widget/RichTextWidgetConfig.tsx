import type { ComponentConfig } from "@measured/puck";
import { RichTextWidgetRender } from "./RichTextWidgetRender";
import { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import { RichTextEditorWrapper } from "../../../../../component/rich-text-editor/RichTextEditorWrapper";

type IConfig = Omit<IPageOrWidgetConfig, "widgetConfig">;

export type IRichTextWidgetConfig = {
  text: string;
  config?: IConfig;
};

export type IRichTextWidgetRenderProps = IRichTextWidgetConfig & IRenderProps;

const defaultRichTextPostMessagePayload: Record<string, any> = {
  type: "update",
  actionType: "open_popup",
  category: "widget",
  data: {
    widgetName: "RichTextWidget",
    text: "",
  },
};

const defaultRichTextConfig: IConfig = {
  type: "Widget",
  id: "RichTextWidget",
  hasConfigurable: true,
  hasPostMessage: true,
  postMessagePayload: defaultRichTextPostMessagePayload,
};

export const RichTextWidgetConfig: ComponentConfig<IRichTextWidgetConfig> = {
  fields: {
    text: {
      label: "Text Label",
      type: "custom",
      render: ({ onChange, value }) => {
        return <RichTextEditorWrapper value={value} onChange={onChange} />;
      },
    },
  },
  defaultProps: {
    text: "",
    config: defaultRichTextConfig,
  },
  resolveData: ({ props }) => {
    const text = props.text;

    let updatedConfig: IConfig | undefined = {
      ...defaultRichTextConfig,
      postMessagePayload: {
        ...defaultRichTextPostMessagePayload,
        data: {
          widgetName: "RichTextWidget",
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
  label: "Rich Text Widget",
  render: (props: IRichTextWidgetRenderProps) => {
    return <RichTextWidgetRender {...props} />;
  },
};
