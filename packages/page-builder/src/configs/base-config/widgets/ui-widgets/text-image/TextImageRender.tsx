import { ITextImageRenderProps } from "./TextImageConfig";
import Image from "next/image";
import { Images } from "../../../../../../../base-components/assets";
import Button from "@znode/base-components/common/button/Button";

export function TextImageRender(props: Readonly<ITextImageRenderProps>) {
  const {
    image: { alt, width, src, ratio },
    button,
    padding,
    margin,
    order,
    heading,
    description,
  } = props || {};
  const srcImg = src ? src : Images.noImage;
  return (
    <div className="flex flex-col md:flex-row" style={{ padding, margin }}>
      <div className="flex w-full md:w-1/2" style={{ order: order === "image-first" ? 1 : 2 }}>
        <div className="relative aspect-[70/45] m-auto" style={{ width: ratio === "small" ? `${width}%` : "100%" }}>
          <Image src={srcImg} alt={alt} fill className="object-cover" />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4 w-full md:w-1/2 p-4" style={{ order: order === "image-first" ? 2 : 1 }}>
        <div className="text-5xl">{heading}</div>
        <div dangerouslySetInnerHTML={{ __html: description }}></div>
        {button.url && (
          <div className="w-max">
            <Button
              className="normal-case"
              type={button.variant}
              dataTestSelector={`btnTextImage`}
              onClick={() => {
                if (button.target && button.target !== "_self") {
                  window.open(button.url, button.target, button.target === "_blank" ? "noopener,noreferrer" : undefined);
                } else {
                  window.location.href = button.url;
                }
              }}
            >
              {button.buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
