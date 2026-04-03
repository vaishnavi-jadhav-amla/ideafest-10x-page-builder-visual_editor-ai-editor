import { IOfferBanners } from "@znode/types/offer-banner";
import { OfferBanner } from "./OfferBanner";
import { SwiperWrapper } from "../../common/swiper-wrapper";
import { isEmpty } from "@znode/utils/common";

interface IOfferBannersProps {
  swapperConfig: {
    spaceBetween: number;
    slidesPerView: number;
    hasPaginationEnable: boolean;
    hasNavigationEnable: boolean;
    hasGrid: boolean;
  };
  offerBanners: IOfferBanners;
}

const breakpoints = {
  320: { slidesPerView: 1, spaceBetween: 10 },
  480: { slidesPerView: 1, spaceBetween: 20 },
  768: { slidesPerView: 2, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 10 },
  1280: { slidesPerView: 3, spaceBetween: 10 },
};

export function OfferBanners(props: Readonly<IOfferBannersProps>) {
  const { offerBanners = [], swapperConfig } = props || {};

  const { hasNavigationEnable, hasPaginationEnable, slidesPerView, spaceBetween, hasGrid } = swapperConfig;

  if (isEmpty(offerBanners)) {
    return null;
  }

  return (
    <div>
      <SwiperWrapper
        hasGrid={hasGrid}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        hasPaginationEnable={hasPaginationEnable}
        hasNavigationEnable={hasNavigationEnable}
        breakpoints={breakpoints}
        customClass="flex w-full lg:w-[90%]"
      >
        {offerBanners.map((item) => {
          return (
            <SwiperWrapper.SwiperSlider key={item.mediaPath}>
              <OfferBanner key={item.mediaPath} mediaPath={item.mediaPath} title={item.title} description={item.description} buttonLink={item.buttonLink} />
            </SwiperWrapper.SwiperSlider>
          );
        })}
      </SwiperWrapper>
    </div>
  );
}
