import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import { FormWidgetRender } from "./FormWidgetRender";
import type { ComponentConfig } from "@measured/puck";
import { IFormResponse } from "@znode/types/form-builder/get-form";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { FormWidgetListWrapper } from "packages/page-builder/src/component/form-widget/FormConfigurationWrapper";

export interface IFormWidgetConfig {
  formCode: string;
  response?: {
    data: IFormResponse | null;
  };
  config?: IPageOrWidgetConfig;
}

export type IFormWidgetRenderProps = IRenderProps & IFormWidgetConfig;

const defaultFormWidgetPostMessagePayload: Record<string, any> = {
  type: "update",
  actionType: "open_popup",
  category: "widget",
  data: {
    formCodeId: "",
    formCode: "",
    widgetCode: "FormWidget",
    widgetKey: "",
    cmsFormWidgetConfigurationId: "",
  },
};

const defaultFormWidgetConfig: IPageOrWidgetConfig = {
  type: "Widget",
  id: "FormWidget",
  hasConfigurable: true,
  hasPostMessage: true,
  postMessagePayload: defaultFormWidgetPostMessagePayload,
  widgetConfig: {},
};

const defaultProps = {
  formCode: "",
  response: undefined,
  config: defaultFormWidgetConfig,
};

export const FormWidgetConfig: ComponentConfig<IFormWidgetConfig> = {
  fields: {
    formCode: {
      type: "custom",
      render: ({ onChange, value }) => {
        return <FormWidgetListWrapper onChange={onChange} value={value} />;
      },
    },
  },

  defaultProps: defaultProps,
  label: "Form Widget",
  permissions: {
    duplicate: false
  },
  render: (props: IFormWidgetRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData: Record<string, any> = {};
    const updatedResponseData = response?.data || defaultData;

    return (
      <DataStateHandler
        response={updatedResponseData}
        emptyMessage="The Form Widget has no content. Configure the widget by selecting the settings icon in the toolbar and . If the data is already set, publish the page to reflect the changes on the Storefront"
      >
        <FormWidgetRender response={response} {...restProps} />
      </DataStateHandler>
    );
  },
};
