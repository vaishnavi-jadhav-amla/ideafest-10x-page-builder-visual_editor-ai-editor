import { Section } from "../Components/Section";
import { ILogoRenderProps } from "./LogoConfig";

export function LogoRender({ logos }: ILogoRenderProps) {
  return (
    <Section>
      <div>
        {logos.map((item, i) => (
          <div key={i}>
            <img alt={item.alt} src={item.imageUrl} height={64}></img>
          </div>
        ))}
      </div>
    </Section>
  );
}
