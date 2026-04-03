import React, { useMemo } from "react";

type LoadingSkeletonProps = {
  type?: "card" | "list" | "avatar";
  count?: number;
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 1 }) => {
  const getClassName = useMemo(() => {
    switch (type) {
      case "card":
        return "bg-white rounded-lg p-4 shadow-md";
      case "list":
        return "bg-white rounded-md p-4 shadow-md";
      case "avatar":
        return "h-10 w-10 rounded-full bg-gray-300 animate-pulse";
      default:
        return "bg-white rounded-md p-4 shadow-md";
    }
  }, [type]);

  const renderSkeletonBlocks = useMemo(() => {
    const blockWidth = `${100 / count}%`;
    return Array.from({ length: count }, (_, i) => (
    <div key={i} className={`m-2 w-[${blockWidth}]`}>
        <div key={`${i}+1`} className="h-40 mb-4 bg-gray-300 animate-pulse"></div>
        <div key={`${i}+2`} className="w-full h-6 mb-3 bg-gray-300 animate-pulse"></div>
        <div key={`${i}+3`} className="w-2/4 h-6 mb-2 bg-gray-300 animate-pulse"></div>
        <div key={`${i}+4`} className="w-1/4 h-6 mb-2 bg-gray-300 animate-pulse"></div>
      </div>
    ));
  }, [count]);

  return <div className={`loading-skeleton ${getClassName} min-h-full flex mb-3`}>{type === "card" || type === "list" ? <>{renderSkeletonBlocks}</> : null}</div>;
};

export default LoadingSkeleton;
