import Image from "next/image";
import { Images } from "../../../../assets";
import Link from "next/link";

export interface IImageProps {
  srcImg: string;
  alt: string;
  height?: number;
  width?: number;
  url?: string;
  layout?: "fixed" | "responsive" | "fullWidth";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  borderRadius?: string;
  loading?: "lazy" | "eager";
  hoverEffect?: "zoom" | "grayscale" | "opacity" | "none";
  shadow?: boolean;
  padding?: string;
  target?: string;
  alignment?: "start" | "center" | "end";
}

export function ImageWidget(props: Readonly<IImageProps>) {
  const {
    srcImg = "",
    alt,
    width = 200,
    height = 200,
    url,
    layout = "fixed",
    objectFit = "cover",
    objectPosition = "center",
    borderRadius = "0px",
    loading = "lazy",
    shadow = false,
    padding = "0px",
    target = "_self",
    alignment = "start",
  } = props || {};

  const src = srcImg || Images.noImage;
  const isExternal = url?.startsWith("http");

  const wrapperClasses = `
    ${layout === "fullWidth" ? "relative w-full overflow-hidden" : ""}
    ${layout === "responsive" ? "relative w-full h-auto" : ""}
    ${layout === "fixed" ? "relative flex" : ""}
    ${layout === "fixed" && alignment === "start" ? "justify-start" : ""}
    ${layout === "fixed" && alignment === "center" ? "justify-center" : ""}
    ${layout === "fixed" && alignment === "end" ? "justify-end" : ""}
  `;

  const imageClasses = `
    ${shadow ? "shadow-md" : ""}
    ${padding ? `p-[${padding}]` : ""}
    ${layout === "fixed" ? `w-[${width}px] h-[${height}px]` : ""}
    object-${objectFit}
  `;
  
  const imageStyle = {
    borderRadius: borderRadius ? `${borderRadius}` : undefined,
  };

  const imageElement = (
    <Image
      src={src}
      alt={alt}
      layout={layout === "fullWidth" ? "fill" : layout}
      width={layout !== "fullWidth" ? width : undefined}
      height={layout !== "fullWidth" ? height : undefined}
      objectFit={objectFit}
      objectPosition={objectPosition}
      loading={loading}
      className={imageClasses}
      style={imageStyle}
    />
  );

  return (
    <div className={wrapperClasses} style={layout === "fullWidth" ? { height: `${height}px`, width: "100%" } : undefined}>
      {url?.trim() ? (
        <Link
          href={!isExternal ? `/${url}` : url}
          passHref
          target={target}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {imageElement}
        </Link>
      ) : (
        imageElement
      )}
    </div>
  );
}
