import { IButtonGroupRenderProps } from "./ButtonGroupConfig";
import { Section } from "../Components/Section";
import Button from "@znode/base-components/common/button/Button";

export function ButtonGroupRender({ align = "left", buttons, puck }: IButtonGroupRenderProps) {
  const alignmentClass =
    {
      center: "justify-center",
      right: "justify-end",
      left: "justify-start",
    }[align] ?? "justify-start";

  return (
    <Section>
      <div className={`flex flex-wrap gap-4 items-center ${alignmentClass}`}>
        {buttons.map((button, i) => (
          <Button
            className="normal-case"
            type={button.variant}
            dataTestSelector={`btnGroup${i}`}
            onClick={() => {
              if (button.target && button.target !== "_self") {
                window.open(button.href, button.target,  button.target === "_blank" ? "noopener,noreferrer" : undefined);
              } else {
                window.location.href = button.href;
              }
            }}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </Section>
  );
}
