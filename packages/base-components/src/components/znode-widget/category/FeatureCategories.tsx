import { Category } from "./Category";
import { IFeatureCategoriesData } from "@znode/types/category";
import { SwiperWrapper } from "../../common/swiper-wrapper";

interface IFeatureCategoriesProps {
  swapperConfig: {
    spaceBetween: number;
    slidesPerView: number;
    hasPaginationEnable: boolean;
    hasNavigationEnable: boolean;
    hasGrid: boolean;
  };
  categories: Array<IFeatureCategoriesData>;
}

const breakpoints = {
  320: { slidesPerView: 2, spaceBetween: 10 },
  480: { slidesPerView: 3, spaceBetween: 20 },
  768: { slidesPerView: 4, spaceBetween: 20 },
  1024: { slidesPerView: 6, spaceBetween: 10 },
  1280: { slidesPerView: 7, spaceBetween: 10 },
};

export function FeatureCategories(props: Readonly<IFeatureCategoriesProps>) {
  const { categories, swapperConfig } = props;
  return (
    <div className="min-h-auto min-h-[3.12rem]">
      <SwiperWrapper
        spaceBetween={swapperConfig.spaceBetween}
        slidesPerView={swapperConfig.slidesPerView}
        hasNavigationEnable={swapperConfig.hasNavigationEnable}
        hasPaginationEnable={swapperConfig.hasPaginationEnable}
        hasGrid={swapperConfig.hasGrid}
        breakpoints={breakpoints}
        position={`${categories.length > 6 ? "left" : "center"}`}
      >
        {categories.map((item) => {
          return (
            <SwiperWrapper.SwiperSlider key={item.id}>
              <Category seoUrl={item.seoUrl} name={item.name} imgSrc={item.imageSmallPath} categoryId={item.categoryId} />
            </SwiperWrapper.SwiperSlider>
          );
        })}
      </SwiperWrapper>
    </div>
  );
}
