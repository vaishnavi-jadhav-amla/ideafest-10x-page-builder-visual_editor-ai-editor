import { BrandCard } from "../../common/brand-card";
import { SwiperWrapper } from "../../common/swiper-wrapper";
import { IBrandList } from "@znode/types/brand";

interface IBrandsCarouselProps {
  swapperConfig: {
    spaceBetween: number;
    slidesPerView: number;
    hasPaginationEnable: boolean;
    hasNavigationEnable: boolean;
    hasGrid: boolean;
  };
  brandData: IBrandList;
}

export function BrandsCarousel(props: Readonly<IBrandsCarouselProps>) {
  const { brandData, swapperConfig } = props;

  if (!brandData || !Array.isArray(brandData.brands) || brandData.brands.length === 0) {
    return null;
  }
  const brandListData = brandData?.brands || [];

  return (
    <div className="min-h-auto lg:min-h-[240px]">
      <SwiperWrapper
        spaceBetween={swapperConfig.spaceBetween}
        slidesPerView={swapperConfig.slidesPerView}
        hasNavigationEnable={swapperConfig.hasNavigationEnable}
        hasPaginationEnable={swapperConfig.hasPaginationEnable}
        hasGrid={swapperConfig.hasGrid}
        position={brandListData.length > swapperConfig.slidesPerView ? "left" : "center"}
      >
        {brandListData.map((brand) => (
          <SwiperWrapper.SwiperSlider key={brand.brandId}>
            <BrandCard name={brand.brandName} img={brand.imageSmallPath} code={brand.brandCode} brandId={brand.brandId} seoUrl={brand.seoFriendlyPageName} seoTitle={brand.seoTitle} />
          </SwiperWrapper.SwiperSlider>
        ))}
      </SwiperWrapper>
    </div>
  );
}
