"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

import { IMAGE_REGEX } from "@znode/constants/regex";
import { Images } from "../../../../assets";
import { LoaderComponent } from "../loader-component";

type ICustomImageProps = ImageProps & { imageWrapperClass?: string; dataTestSelector: string; isLoader?: boolean };

const isValidImageSrc = (src: ImageProps["src"]) => {
  if (typeof src !== "string" || src === "" || src === null) return false;
  return IMAGE_REGEX.IMAGE_SRC_REGEX.test(src);
};

export function CustomImage(props: Readonly<ICustomImageProps>) {
  const { src, alt, imageWrapperClass, dataTestSelector, isLoader = true, ...restProps } = props || {};
  const [imgSrc, setImgSrc] = useState<string>(isValidImageSrc(src) ? src : Images.noImage);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleError = () => {
    setImgSrc(Images.noImage);
  };

  useEffect(() => {
    if (typeof src === "string" && isValidImageSrc(src)) {
      setImgSrc(src);
    } else {
      setImgSrc(Images.noImage);
    }
  }, [src]);

  return (
    <div className={`relative ${imageWrapperClass || ""}`}>
      {!hasLoaded && isLoader && (
        <div className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 loader top-1/2 left-1/2">
          <LoaderComponent isLoading={true} width="20px" height="20px" />
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        className="w-full max-h-[7.813rem] min-h-[7.813rem] m-auto "
        width={200}
        height={0}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={handleError}
        onLoad={() => setHasLoaded(true)}
        {...restProps}
        data-test-selector={dataTestSelector}
        unoptimized
      />
    </div>
  );
}
