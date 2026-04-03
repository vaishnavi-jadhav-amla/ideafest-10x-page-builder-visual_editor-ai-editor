import "./banner.scss";

import { CustomImage } from "../../common/image";

const getTextPosition = (textAlign: string) => {
  const getPosition = "md:absolute md:top-1/2 md:-translate-y-2/4 max-md:p-5";

  const getAlignment = () => {
    switch (textAlign) {
      case "Left Align":
        return "text-left left-20";
      case "Center Align":
        return "text-center w-full";
      case "Right Align":
        return "text-right right-20";
      default:
        return "text-left left-20";
    }
  };

  return `${getPosition} ${getAlignment()}`;
};

interface IBannerProps {
  index: number;
  buttonLink?: string;
  bannerSequence?: number;
  mediaPath?: string;
  imageAlternateText?: string;
  description?: string;
  textAlignment?: string;
}
export function Banner(props: Readonly<IBannerProps>) {
  const { mediaPath = "", imageAlternateText = "", textAlignment = "", description = "", index, buttonLink = "" } = props;

  if (!mediaPath) return null;

  return (
    <div key={props.bannerSequence} className="w-full h-full bg-black bg-opacity-80" data-test-selector={`divBanner${index}`}>
      <a href={buttonLink || "javascript:void(0)"} data-test-selector={`link${index}`} className="block h-full">
        <CustomImage
          src={mediaPath}
          alt={imageAlternateText || "Product image"}
          dataTestSelector={`imgBanner${index}`}
          width={200}
          height={0}
          sizes="100vw"
          priority={false}
          className="object-cover"
          aria-label={imageAlternateText || "Go to banner"}
        />
        <div className={textAlignment ? getTextPosition(textAlignment) : ""}>
          {description && (
            <div
              className="text-sm text-white break-words lg:text-4xl md:text-3xl"
              data-test-selector={`divDescription${index}`}
              dangerouslySetInnerHTML={{ __html: description }}
            ></div>
          )}
        </div>
      </a>
    </div>
  );
}
