"use client";

import "./banner.scss";

import { CarousalWrapper, ICarouselProps } from "../../common/carousel-wrapper";
import { IBannerSlider, ISlider } from "@znode/types/slider-banner";

import { Banner } from "./Banner";
import { ZIcons } from "../../common/icons";
import { formatTestSelector } from "@znode/utils/common";

interface IBannersProps {
  carouselConfig: ICarouselProps;
  bannerSlider: IBannerSlider;
}
export function Banners(props: Readonly<IBannersProps>) {
  const { carouselConfig, bannerSlider } = props || {};
  if (bannerSlider && bannerSlider.sliderBanners) {
    const sliderBanners = bannerSlider.sliderBanners || {};
    return (
      <CarousalWrapper
        {...carouselConfig}
        thumbs={sliderBanners.map((banner: ISlider) => ({
          url: banner.mediaPath || "",
          alt: banner.imageAlternateText || "",
        }))}
        renderArrowPrev={(onClickHandler, hasPrev, label) => {
          return (
            hasPrev && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute z-10 p-0 rounded-full left-arrow max-md:left-2 max-md:top-1/2 max-md:-translate-y-2/4 md:right-32 md:bottom-5 lg:bottom-10 // bg-slate-100 hover:bg-gray-600 lg:p-1"
                data-test-selector={formatTestSelector("btn", `${label}`)}
                aria-label={`${label}`}
              >
                <ZIcons name="chevron-left" data-test-selector={formatTestSelector("svg", `${label}`)} />
              </button>
            )
          );
        }}
        renderArrowNext={(onClickHandler, hasNext, label) => {
          return (
            hasNext && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute z-10 p-0 rounded-full right-arrow max-md:right-2 max-md:top-1/2 max-md:-translate-y-2/4 md:right-20 md:bottom-5 lg:bottom-10 // bg-slate-100 hover:bg-gray-600 lg:p-1"
                data-test-selector={formatTestSelector("btn", `${label}`)}
                aria-label={`${label}`}
              >
                <ZIcons name="chevron-right" data-test-selector={formatTestSelector("svg", `${label}`)} />
              </button>
            )
          );
        }}
      >
        {sliderBanners?.map((banner, index) => (
          <Banner
            mediaPath={banner.mediaPath as string}
            textAlignment={banner.textAlignment}
            index={index}
            key={banner.bannerSequence}
            description={banner?.description}
            buttonLink={banner.buttonLink}
          />
        ))}
      </CarousalWrapper>
    );
  }
  return null;
}
