import { LoadingSpinner } from "../icons";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";

interface LoaderProps {
  isLoading: boolean;
  isLoadingTextShow?: boolean;
  height?: string;
  width?: string;
  color?: string;
  containerHeight?: boolean;
  loaderText?: string;
  overlay?: boolean;
}

export const LoaderComponent: React.FC<LoaderProps> = ({
  isLoading,
  isLoadingTextShow = false,
  height = "50px",
  width = "50px",
  color,
  containerHeight,
  loaderText,
  overlay = false,
}) => {
  const commonTranslations = useTranslationMessages("Common");

  const isLoadingTextDisplay = (isLoadingTextShow: boolean) => {
    return isLoadingTextShow ? <p className="pl-1.5">{loaderText ? loaderText : commonTranslations("loading")}</p> : null;
  };

  if (!isLoading) return null;

  return overlay ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="flex items-center">
        <LoadingSpinner height={height} width={width} color={color} />
        {isLoadingTextDisplay(isLoadingTextShow)}
      </div>
    </div>
  ) : (
    <div className={`flex items-center justify-center ${containerHeight ? "h-60" : ""}`}>
      <LoadingSpinner height={height} width={width} color={color} />
      {isLoadingTextDisplay(isLoadingTextShow)}
    </div>
  );
};

export default LoaderComponent;
