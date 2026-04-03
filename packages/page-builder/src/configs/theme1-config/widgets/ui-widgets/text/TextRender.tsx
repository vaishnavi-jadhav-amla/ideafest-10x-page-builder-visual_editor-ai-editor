import { ITextRenderProps } from "./TextConfig";
import { Text } from "@znode/theme1-components/ui-widgets/text";
import { formatTestSelector } from "@znode/utils/common";

export function TextRender({ align, color, text, size, padding, maxWidth }: ITextRenderProps) {
  return <Text color={color} align={align} text={text} size={size} padding={padding} maxWidth={maxWidth} dataTestSelector={formatTestSelector("txt", `${text}`)} />;
}
