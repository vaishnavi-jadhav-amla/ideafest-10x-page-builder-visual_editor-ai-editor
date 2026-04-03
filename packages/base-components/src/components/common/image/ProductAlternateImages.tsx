import { CustomImage } from "./CustomImage";
import { IVideos } from "../../product/product-image/ProductImage";
import React from "react";
import downloadImage from "../../../../assets/download.png";
interface ProductAlternateImagesProps {
  alternateImageData: IVideos;
  index: number;
}
const ProductAlternateImages: React.FC<ProductAlternateImagesProps> = ({ alternateImageData, index }) => {
  const getAlternateImagesSource = (imageData: IVideos) => {
    if (imageData?.attributeCode) {
      return downloadImage;
    }
    return imageData?.imageLargePath;
  };
  if (!alternateImageData) return null;
  return (
    <CustomImage
      alt={`Product Alternate Image ${index}`}
      src={getAlternateImagesSource(alternateImageData) ?? ""}
      dataTestSelector={`imgProductAlternateImage${index}`}
      className="object-contain"
      imageWrapperClass="max-h-[112px] flex"
    />
  );
};
export default ProductAlternateImages;
