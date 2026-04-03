"use client";

import "./Rating.scss";

import { useEffect, useState } from "react";

import Button from "../../common/button/Button";

interface RatingProps {
  isVisible?: boolean;
  disableActions?: boolean;
  ratingValue?: number;
  handleRatingClick?: (_rating: number) => void;
  dataTestSelector?: string;
}

export default function Rating({ isVisible, disableActions, ratingValue = 0, handleRatingClick, dataTestSelector }: Readonly<RatingProps>) {
  const [rating, setRating] = useState<number>(0);

  const handleRatingUpdate = (i: number) => {
    setRating(i);
    handleRatingClick && handleRatingClick(i);
  };

  useEffect(() => {
    setRating(ratingValue);
  }, [ratingValue]);

  const getClasses = (isActive: boolean, isHalf: boolean) => {
    const disabledActionsClass = disableActions ? "pointer-events-none" : "";
    const activeClass = isActive ? "on" : "off";
    const halfStarClass = isHalf ? "half-star" : "";
    return `${activeClass} ${halfStarClass} ${disabledActionsClass}`;
  };

  const renderRatings = () => {
    return Array.from({ length: 5 }, (_ele, index) => {
      const starIndex = index + 1;
      const isFullStar = starIndex <= Math.floor(rating); // Fully filled stars
      const isHalfStar = starIndex === Math.floor(rating) + 1 && rating % 1 >= 0.5; // Half-filled star (e.g., 3.6, 2.5)
      return (
        <Button
          key={starIndex}
          type="text"
          size="small"
          className={`${getClasses(isFullStar, isHalfStar)}`}
          onClick={() => handleRatingUpdate(starIndex)}
          startIcon={
            isFullStar ? (
              <FullStarIcon width="17px" height="17px" color="#000" />
            ) : 
            isHalfStar ? (
              <HalfStarIcon width="17px" height="17px" color="#000" />
            ) : (
              <EmptyStarIcon width="17px" height="17px"color="#d1d1d1"  />
            )
          }
          dataTestSelector={`btn${dataTestSelector}${starIndex}`}
          ariaLabel="Star rating icon"
          ></Button>
      );
    });
  };
  if (!isVisible) return null;
  return (
    <div className="star-rating" data-test-selector={`div${dataTestSelector}`}>
      {renderRatings()}
    </div>
  );
}

const HalfStarIcon = ({ width = "15px", height = "20px", color = "#FFD700" }: { width?: string; height?: string; color?: string }) => {
  return (
    <svg width={width} height={height} fill={color} viewBox="0 0 24 24">
      <path
        fill="#000000"
        d="m22 9.74-7.19-.62L12 2.5 9.19 9.13 2 9.74l5.46 4.73-1.64 7.03L12 17.77l6.18 3.73-1.63-7.03L22 9.74ZM12 15.9V6.6l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.9Z"
      ></path>
    </svg>
  );
};
const EmptyStarIcon = ({ width = "15px", height = "20px", color = "#d1d1d1" }: { width?: string; height?: string; color?: string }) => {
  return (
    <svg width={width} height={height} fill={color} viewBox="0 0 24 24">
      <path
        fill="#d1d1d1"
        fill-rule="evenodd"
        d="m14.81 8.62 7.19.62-5.45 4.73L18.18 21 12 17.27 5.82 21l1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.62Zm-6.57 9.05L12 15.4l3.77 2.28-1-4.28 3.32-2.88-4.38-.38L12 6.1l-1.7 4.03-4.38.38 3.32 2.88-1 4.28Z"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};

const FullStarIcon = ({ width = "15px", height = "20px", color = "#FFD700" }: { width?: string; height?: string; color?: string }) => {
  return (
    <svg width={width} height={height} fill={color} viewBox="0 0 24 24">
      <path d="m12 17.77 6.18 3.73-1.64-7.03L22 9.74l-7.19-.61L12 2.5 9.19 9.13 2 9.74l5.46 4.73-1.64 7.03L12 17.77Z"></path>
    </svg>
  );
};
