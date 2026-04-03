"use client";

import "./swiper.scss";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./swiper-wrapper.css";

import { Navigation, Pagination } from "swiper/modules";
import React, { ReactNode, useEffect, useState } from "react";
import { Swiper, SwiperProps, SwiperSlide } from "swiper/react";

import { ZIcons } from "../icons";

type SwiperWrapperProps = Partial<SwiperProps> & {
  children: ReactNode;
  hasNavigationEnable: boolean;
  hasPaginationEnable: boolean;
  hasGrid: boolean;
  position?: "left" | "center" | "right";
  customClass?: string;
  breakpointsBase?: "window" | "container";
};

const defaultBreakpoints = {
  100: { slidesPerView: 1, spaceBetween: 10 },
  320: { slidesPerView: 1, spaceBetween: 10 },
  480: { slidesPerView: 2, spaceBetween: 15 },
  768: { slidesPerView: 3, spaceBetween: 15 },
  1024: { slidesPerView: 4, spaceBetween: 15 },
  1280: { slidesPerView: 5, spaceBetween: 10 },
};

export function SwiperWrapper({
  children,
  hasNavigationEnable,
  hasPaginationEnable,
  spaceBetween = 10,
  slidesPerView = 1,
  position = "center",
  customClass = "",
  breakpointsBase = "container",
  breakpoints = defaultBreakpoints,
}: SwiperWrapperProps) {
  const swiperConfig = {
    spaceBetween,
    slidesPerView,
    breakpoints,
    breakpointsBase,
    pagination: {
      clickable: true,
      enabled: hasPaginationEnable,
      dynamicBullets: true,
    },
    ...(hasNavigationEnable && {
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    }),
  };

  const renderArrows = () => (
    <>
      <div className="swiper-button-prev">
        <ZIcons name="chevron-left" color="#fff" />
      </div>
      <div className="swiper-button-next">
        <ZIcons name="chevron-right" color="#fff" />
      </div>
    </>
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (children && React.Children.count(children) > 0) {
      setIsLoaded(true);
    }
  }, [children]);

  if (!isLoaded) {
    return null;
  }
  return (
    <div className="swiper-container">
      <Swiper {...swiperConfig} className={`${customClass} swiper-position-${position}`} modules={[Pagination, Navigation]}>
        {children}
        {hasNavigationEnable && renderArrows()}
      </Swiper>
    </div>
  );
}

SwiperWrapper.SwiperSlider = SwiperSlide;
