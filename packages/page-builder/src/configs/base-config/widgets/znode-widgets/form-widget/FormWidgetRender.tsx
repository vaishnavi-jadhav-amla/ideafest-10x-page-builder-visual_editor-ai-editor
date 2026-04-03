import { IFormWidgetRenderProps } from "./FormWidgetConfig";
import { IFormResponse } from "@znode/types/form-builder/get-form";
import { FormWidget } from "@znode/base-components/znode-widget/form-widget";
import RichTextEditor from "../../../../../component/rich-text-editor/RichTextEditor";

export function FormWidgetRender(props: IFormWidgetRenderProps) {
  const { response, config, puck } = props;

  const isEditing = puck.isEditing;

  if (!response?.data) {
    return null;
  }

  const formTemplateResponse: IFormResponse = response.data;
  const widgetKey = String(config?.postMessagePayload?.data?.widgetKey ?? "");

  return <FormWidget response={formTemplateResponse} widgetKey={widgetKey} RichTextEditor={isEditing ? undefined : RichTextEditor} />;
}
