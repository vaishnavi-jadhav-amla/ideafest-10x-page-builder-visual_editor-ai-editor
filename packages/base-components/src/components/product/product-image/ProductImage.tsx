"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";
import ProductAlternateImages from "../../common/image/ProductAlternateImages";
import { SwiperWrapper } from "../../common/swiper-wrapper";
import { ZoomImage } from "../../common/zoom-image";
import noImage from "../../../../assets/no-image.png";
import noVideo from "../../../../assets/no-image.png";
import { VIDEO_ID_REGEX } from "@znode/constants/regex";

interface IProductImage {
  imageLargePath: string;
  seoTitle: string;
  alternateImages?: IAlternateImages[];
  videos?: IVideos[];
}
export interface IAlternateImages {
  imageLargePath: string;
}

export interface IVideos {
  attributeCode?: string;
  attributeName?: string;
  attributeValues?: string;
  imageLargePath?: string;
}

const defaultBreakpoints = {
  320: { slidesPerView: 1, spaceBetween: 10 },
  480: { slidesPerView: 2, spaceBetween: 15 },
  768: { slidesPerView: 2, spaceBetween: 15 },
  1024: { slidesPerView: 3, spaceBetween: 15 },
  1440: { slidesPerView: 4, spaceBetween: 15 },
};

const ProductImage = ({ imageLargePath, seoTitle, alternateImages = [], videos = [] }: IProductImage) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mediaPath, setMediaPath] = useState<any>(imageLargePath);
  const [mediaIndex, setMediaIndex] = useState<number>(0);

  useEffect(() => {
    setMediaPath(imageLargePath);
  }, [imageLargePath]);

  const defaultImage = { imageLargePath: imageLargePath };
  const allImages = alternateImages ? [defaultImage, ...alternateImages] : [defaultImage];
  const allMediaData = allImages && videos && [...allImages, ...videos];

  const handleMediaClick = (mediaData: IVideos, index: number) => {
    setMediaPath(mediaData);
    setMediaIndex(index);
  };

  const storeCode = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("storeCode") : "";

  const renderAlternateMedia = () => {
    return (
      allMediaData &&
      allMediaData?.length > 1 && (
        <div>
          <SwiperWrapper
            hasNavigationEnable={true}
            hasPaginationEnable={true}
            hasGrid={true}
            breakpoints={defaultBreakpoints}
            position="left"
            customClass="pdp-alternate-image-slider"
            breakpointsBase={`${storeCode ? "container" : "window"}`}
          >
            {allMediaData.map((data: IVideos, i: number) => {
              return (
                <SwiperWrapper.SwiperSlider>
                  <div
                    className={`relative w-[95%] min-h-[110px] cursor-pointer border-2 slide-card content-center justify-center slide-product-card rounded ${
                      i === mediaIndex ? "border-primaryColor" : "border-gray-300"
                    }`}
                    onClick={() => handleMediaClick(data, i)}
                  >
                    <ProductAlternateImages alternateImageData={data} index={i} />
                  </div>
                </SwiperWrapper.SwiperSlider>
              );
            })}
          </SwiperWrapper>
        </div>
      )
    );
  };

  const videoUrlHandlers = [
    {
      condition: (url: string) => url.includes("youtube") || url.includes("youtu.be"),
      action: (url: string) => {
        const videoId = url.includes("watch?v") ? url.split("v=")[1] : url.substring(url.lastIndexOf("/") + 1);
        return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
      },
    },
    {
      condition: (url: string) => url.includes("dailymotion") || url.includes("dai.ly"),
      action: (url: string) => {
        const videoId = url.substring(url.lastIndexOf("/") + 1);
        return `https://www.dailymotion.com/embed/video/${videoId}`;
      },
    },
    {
      condition: (url: string) => url.includes("drive"),
      action: (url: string) => {
        const video = url.replace("/view?usp=sharing", "/preview");
        return video.includes("/preview") ? video : `${video}/preview`;
      },
    },
    {
      condition: (url: string) => url.includes("vimeo.com"),
      action: (url: string) => {
          const match = url.match(VIDEO_ID_REGEX.VIMEO);
          const videoId = match ? match[1] : "";
          return `https://player.vimeo.com/video/${videoId}`;
      },
    },
    {
      condition: (url: string) => url.endsWith(".mp4") || url.endsWith(".ogg") || url.endsWith(".webm") || url.endsWith(".ogv"),
      action: (url: string) => url,
    },
  ];

  const renderProductVideo = (videoUrl: string) => {
    if (!videoUrl) {
      return <Image src={noVideo} alt={seoTitle} data-test-selector="imgVideoUnavailable" />;
    }

    const lowerCaseUrl = videoUrl.toLowerCase();
    const handler = videoUrlHandlers.find((videoHandler) => videoHandler.condition(lowerCaseUrl));

    if (handler) {
      return <embed src={handler.action(videoUrl)} title="Product Video" data-test-selector="embedProductVideo" className="w-full h-80 mb-10"></embed>;
    }

    if (
      lowerCaseUrl.endsWith(".jpg") ||
      lowerCaseUrl.endsWith(".png") ||
      lowerCaseUrl.endsWith(".jpeg") ||
      lowerCaseUrl.endsWith(".webp") ||
      lowerCaseUrl.includes("/data/media/")
    ) {
      return <ZoomImage imageUrl={videoUrl} alt={seoTitle} data-test-selector="imgProductImage" />;
    }

    return <Image src={noVideo} alt={seoTitle} data-test-selector="imgVideoUnavailable" />;
  };

  const renderProductMedia = () => {
    if (mediaPath?.attributeCode) {
      const mediaUrl = mediaPath?.attributeValues;
      return renderProductVideo(mediaUrl);
    } else {
      return (
        <div className="md:px-4 mb-4 z-10">
          <ZoomImage imageUrl={mediaPath?.imageLargePath ? mediaPath?.imageLargePath : mediaPath ? mediaPath : noImage} alt={seoTitle} dataTestSelector="ProductImage" />
        </div>
      );
    }
  };

  return (
    <>
      <div className="w-full flex justify-center mb-4">{renderProductMedia()}</div>
      <div data-test-selector="divAlternateImagesContainer">{renderAlternateMedia()}</div>
    </>
  );
};

export default ProductImage;
