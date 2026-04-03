import { StaticImageData } from "next/image";

import { Images } from "../../../../../assets";
import Link from "next/link";
import { CustomImage } from "../../../common/image";

interface ILogoProps {
  imgSrc: string | StaticImageData;
  alternate?: string;
  width?: number;
  height?: number;
  customClass?: string;
  dataTestSelector?: string;
}

export function Logo(props: Readonly<ILogoProps>) {
  const { imgSrc, alternate, width, height, customClass, dataTestSelector } = props;
  const image = typeof imgSrc === "string" && imgSrc.trim() !== "" ? imgSrc : Images.noImage;

  const computedClass = `${customClass || ""} ${image === Images.noImage ? "w-4/5" : "max-w-[200px] w-auto object-contain"}`.trim();

  return (
    <Link href="/" data-test-selector="linkLogoImage" className="inline-block">
        <CustomImage src={image} alt={alternate ?? ""} className={computedClass} width={width} height={height} dataTestSelector={dataTestSelector || ""} loading="lazy" />
    </Link>
  );
}
