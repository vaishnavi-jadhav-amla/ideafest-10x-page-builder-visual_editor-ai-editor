import { WIDGET_CONFIGURATION_MESSAGES } from "@znode/page-builder/constants";
import { IRichTextWidgetRenderProps } from "./RichTextWidgetConfig";

export function RichTextWidgetRender(props: Readonly<IRichTextWidgetRenderProps>) {
  const { text, puck } = props;

  if (puck.isEditing && text === "") return <div className="data-state-handler-empty-message">{WIDGET_CONFIGURATION_MESSAGES.RICH_TEXT_CONFIGURATION_REQUIRED} </div>;

  return (
    <div className="revert-base">
      <div className="ql-snow">
        <div
          className="ql-editor"
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
      </div>
    </div>
  );
}
