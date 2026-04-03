import { INewsLetterConfigRenderProps } from "./NewsLetterConfig";
import { NewsLetter } from "@znode/base-components/znode-widget/newsletter";

export function NewsLetterWrapper({ align = "left", ...restProps }: Readonly<INewsLetterConfigRenderProps>) {
  const alignmentClass =
    {
      center: "justify-center",
      right: "justify-end",
      left: "justify-start",
    }[align] ?? "justify-start";

  return (
    <div className={`flex ${alignmentClass}`}>
      <NewsLetter {...restProps} />
    </div>
  );
}
