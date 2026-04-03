import { ITextEditorConfigRenderProps } from "./TextEditorConfig";
import { TextEditor } from "@znode/base-components/znode-widget/text-editor";

export function TextEditorRender(props: Readonly<ITextEditorConfigRenderProps>) {

  const { response } = props;

  if (!response?.data) {
    return null;
  }

  const htmlContent = response.data || "";

  return <TextEditor htmlContent={htmlContent} key={props.id} />;
}
