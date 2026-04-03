"use client";

import "./zoom-image.scss";

import React, { useEffect, useRef, useState } from "react";

import { CustomImage } from "../image";

interface ZoomPosition {
  x: number;
  y: number;
}

interface IZoomImage {
  imageUrl: string;
  imageZoomPosition?: string;
  alt: string;
  dataTestSelector?: string;
}

export const ZoomImage: React.FC<IZoomImage> = ({ imageUrl, imageZoomPosition, alt, dataTestSelector }) => {
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  const [zoomPosition, setZoomPosition] = useState<ZoomPosition>({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoomContainerRef.current && !zoomContainerRef.current.contains(event.target as Node)) {
        setIsZoomed(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    setZoomPosition({ x, y });
    setIsZoomed(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - left) / width;
    const y = (touch.clientY - top) / height;

    setZoomPosition({ x, y });
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const center = () => (
    <div ref={zoomContainerRef} className="zoom-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

      <CustomImage className="object-contain zoom-image" src={imageUrl} alt={alt} dataTestSelector={`img${dataTestSelector}`} />

      {isZoomed && (
        <div className="zoomed-center-container" style={{ backgroundImage: `url("${imageUrl}")`, backgroundPosition: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%` }}></div>
      )}
    </div>
  );

  const position = () => (
    <div ref={zoomContainerRef} className="zoom-container" onMouseMove={handleMouseMove} onTouchMove={handleTouchMove} onMouseLeave={handleMouseLeave}>
      <div className="image-container">
        <CustomImage className="object-contain zoom-image" src={imageUrl} alt={alt} width={500} height={500} dataTestSelector={`img${dataTestSelector}`} />
      </div>
      {isZoomed && (
        <div
          className={`zoomed-container ${imageZoomPosition}`}
          style={{ backgroundImage: `url("${imageUrl}")`, backgroundPosition: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%` }}
        ></div>
      )}
    </div>
  );

  return imageZoomPosition === "left" || imageZoomPosition === "right" ? position() : center();
};
