import dynamic from "next/dynamic";
import { IProductList } from "@znode/types/product";
import { ProductCard } from "../../common/product-card";
import { SwiperWrapper } from "../../common/swiper-wrapper";
import { PRODUCT } from "@znode/constants/product";
import { Modal } from "../../common/modal";
import { useModal } from "../../../stores/modal";
//nx-ignore-next-line
const QuickViewDetails = dynamic(() => import("../../common/product-card/quick-view/QuickViewDetails").then((mod) => mod.default), { ssr: false });

interface IProductsCarouselProps {
  swapperConfig: {
    spaceBetween: number;
    slidesPerView: number;
    hasPaginationEnable: boolean;
    hasNavigationEnable: boolean;
    hasGrid: boolean;
  };
  productData: IProductList;
}

export function ProductsCarousel(props: Readonly<IProductsCarouselProps>) {
  const { productData, swapperConfig } = props;
  const { modalActiveId } = useModal();
  const isLoginToSeePricing =
    productData?.globalAttributes?.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase())?.attributeValue || "false";

  const displayAllWarehousesStock =
    (productData.globalAttributes &&
      productData.globalAttributes.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase())?.attributeValue) ||
    "false";

  const productList = productData?.productList || [];
  return (
    <div className="product-carousel-widget">
      <Modal size="5xl" modalId="QuickView" maxHeight="lg" customClass="overflow-y-auto no-print">
      {(modalActiveId && modalActiveId === "QuickView") && <QuickViewDetails />}      </Modal>
      <div className="min-h-auto lg:min-h-[420px]">
      <SwiperWrapper
        spaceBetween={swapperConfig.spaceBetween}
        slidesPerView={swapperConfig.slidesPerView}
        hasNavigationEnable={swapperConfig.hasNavigationEnable}
        hasPaginationEnable={swapperConfig.hasPaginationEnable}
        hasGrid={swapperConfig.hasGrid}
        position={productList.length > swapperConfig.slidesPerView ? "left" : "center"}
      >
        {productList?.map((product, index) => {
          return (
            <SwiperWrapper.SwiperSlider key={product.sku}>
              <ProductCard
                product={product}
                globalAttributes={{
                  loginToSeePricingAndInventory: isLoginToSeePricing as string,
                  displayAllWarehousesStock: displayAllWarehousesStock as string,
                }}
                id={index} // it should be id rather than pass key
              />
            </SwiperWrapper.SwiperSlider>
          );
        })}
      </SwiperWrapper>
      </div>
    </div>
  );
}
