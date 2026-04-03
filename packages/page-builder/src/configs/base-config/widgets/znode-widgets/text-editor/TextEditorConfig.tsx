import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import { TextEditorRender } from "./TextEditorRender";
import { baseUrlOfWidgets } from "../../../../../constants/constants";
import { httpRequest } from "@znode/base-components/http-request";
import { removeFirstWord } from "../../../../../utils/common";

export interface ITextEditorConfig {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
}

export type ITextEditorConfigRenderProps = ITextEditorConfig & IRenderProps;

export const TextEditorConfig: ComponentConfig<ITextEditorConfig> = {
  fields: {
    response: {
      type: "custom",
      render: () => <></>,
    },
    config: {
      type: "custom",
      render: () => <></>,
    },
  },
  resolveData: async ({ props }) => {
    if (props.response?.data) {
      return { props };
    }

    const url = `${baseUrlOfWidgets.textEdit}?widgetKey=996079&typeOfMapping=PortalMapping&cmsMappingId=233`;
    const response = await httpRequest<any>({ endpoint: url });

    const id = removeFirstWord(props.id);

    return {
      props: {
        response: {
          data: response?.data,
        },
        config: {
          ...props.config,
          widgetConfig: {
            ...props.config.widgetConfig,
            updatedWidgetKey: `996079-${id}`,
          },
        },
      },
    };
  },
  defaultProps: {
    response: null,
    config: {
      type: "Widget",
      id: "TextEditorWidget",
      hasConfigurable: false,
      widgetConfig: {
        widgetKey: "565767",
        typeOfMapping: "PortalMapping",
        widgetCode: "TextEditor",
        displayName: "Text Editor",
      },
    },
  },
  label: "TextEditor Widget",
  render: (props: ITextEditorConfigRenderProps) => {
    return <TextEditorRender {...props} />;
  },
};
