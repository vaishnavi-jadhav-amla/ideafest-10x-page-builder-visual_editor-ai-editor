import { Button } from "@measured/puck";
import { IRenderHeroProps } from "./HeroConfig";
import { Section } from "../Components/Section";

export function HeroRender({ align, title, description, buttons, padding, image, puck }: IRenderHeroProps) {
  return (
    <Section padding={padding}>
      {image?.mode === "background" && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-no-repeat bg-center"
            style={{
              backgroundImage: `url(${image?.url})`,
            }}
          ></div>

          <div className="hero-image-overlay"></div>
        </>
      )}

      {/* inner */}
      <div className={`flex items-center flex-wrap lg:flex-nowrap gap-12 relative ${align === "center" ? "justify-center" : ""}`}>
        {/* content */}
        <div className={`flex flex-col w-full  gap-4 ${align === "center" ? "justify-center items-center" : ""}`}>
          <h1 className="text-5xl md:text-6xl font-bold">{title}</h1>
          <p>{description}</p>
          <div className="flex items-center gap-1 flex-wrap">
            {buttons.map((button, i) => (
              <Button key={i} href={button.href} variant={button.variant} size="large" tabIndex={puck.isEditing ? -1 : undefined}>
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        {align !== "center" && image?.mode !== "background" && image?.url && (
          <div className="bg-cover bg-no-repeat bg-center w-full h-80 rounded-2xl" style={{ backgroundImage: `url(${image.url})` }}></div>
        )}
      </div>
    </Section>
  );
}
