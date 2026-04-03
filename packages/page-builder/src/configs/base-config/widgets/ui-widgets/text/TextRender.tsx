import { ITextRenderProps } from "./TextConfig";
import { Section } from "../Components/Section";
import { formatTestSelector } from "@znode/utils/common";

export function TextRender({ align, color, text, size, padding, weight }: ITextRenderProps) {
  return (
    <Section padding={padding}>
      <p
        data-test-selector={formatTestSelector("spn", `${text}`)}
        className={`flex 
    ${align === "center" ? "text-center justify-center" : align === "right" ? "text-right justify-end" : "text-left justify-start"}
    w-full 
    ${size === "m" ? "text-xl" : "text-base"}
    mx-auto 
    whitespace-pre-wrap 
    font-${weight}
    ${color === "default" ? "" : "text-widgetColor"}`}
      >
        {text}
      </p>
    </Section>
  );
}
