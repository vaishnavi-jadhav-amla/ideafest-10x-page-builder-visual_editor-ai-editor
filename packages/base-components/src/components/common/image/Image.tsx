"use client";

import React, { useState } from "react";

import { IImageProp } from "@znode/types/common";
import Image from "next/image";
import LoaderComponent from "../loader-component/LoaderComponent";
import { formatTestSelector } from "@znode/utils/common";
import noImage from "../../../../assets/no-image.png";

const ImageWrapper: React.FC<IImageProp> = ({ imageLargePath, seoTitle, dataTestSelector, cssClass, parentCSS, width, height, noLoad }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(false);
  return (
    <div className={`relative ${parentCSS}`} data-test-selector={formatTestSelector("divProduct", dataTestSelector)}>
      {!noLoad && !hasLoaded && (
        <div className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 loader top-1/2 left-1/2">
          <LoaderComponent isLoading={true} width="20px" height="20px" />
        </div>
      )}
      <Image
        src={!imgSrc && imageLargePath !== "" ? imageLargePath : noImage}
        alt={seoTitle || ""}
        className={`${cssClass} max-h-[300px]`}
        data-test-selector={formatTestSelector("img", dataTestSelector)}
        width={width || 200}
        height={height || 350}
        onError={() => setImgSrc(true)}
        onLoad={() => setHasLoaded(true)}
      />
    </div>
  );
};

export default ImageWrapper;
