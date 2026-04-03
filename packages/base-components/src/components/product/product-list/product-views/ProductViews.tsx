"use client";

import { IProductList, IProductListCard } from "@znode/types/product";
import { memo, useCallback, useEffect, useMemo, useState, useRef } from "react";

import { Virtuoso } from "react-virtuoso";

import { FacetChipList } from "../../facet";
import { Heading } from "../../../common/heading";
import { MODE } from "@znode/constants/mode";
import { Modal } from "../../../common/modal";
import { NoRecordFound } from "../../../common/no-record-found/NoRecordFound";
import { ProductCard } from "../../../common/product-card";
import ProductComparePopup from "../../compare-product/compare-product-popup/CompareProductPopUp";
import { ProductListFilter } from "../product-list-filter/ProductListFilter";
import QuickViewDetails from "../../../common/product-card/quick-view/QuickViewDetails";

import { debounce } from "lodash";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../../stores/user-store";
import { useProduct } from "../../../../stores";
import { LoadingSpinnerComponent } from "../../../common/icons";
import { useWishListStore } from "../../../../stores/wishlist";

import AddToCartNotification from "../../../add-to-cart-notification/AddToCartNotification";

const MemoizedProductCard = memo(ProductCard);

interface IDynamicProductList {
  productList: IProductListCard[];
  globalAttributes: { loginToSeePricingAndInventory: string; displayAllWarehousesStock: string };
  showButton?: boolean;
  selectedMode?: string;
  displayReview?: boolean;
  displaySKU?: boolean;
  isEnableCompare?: boolean;
  showWishlist?: boolean;
  breadCrumbsDetails?: { breadCrumbsTitle: string; isCategoryFlow: boolean };
}

const GridView = ({ productList, globalAttributes, selectedMode, breadCrumbsDetails, isEnableCompare, ...rest }: IDynamicProductList) => {
  const [columns, setColumns] = useState(4);

  const updateColumns = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1280) setColumns(4);
    else if (width >= 768) setColumns(3);
    else if (width >= 500) setColumns(2);
    else setColumns(1);
  }, []);

  const debouncedResizeHandler = useMemo(() => debounce(updateColumns, 250), [updateColumns]);

  useEffect(() => {
    updateColumns();

    window.addEventListener("resize", debouncedResizeHandler);
    return () => {
      window.removeEventListener("resize", debouncedResizeHandler);
      debouncedResizeHandler.cancel(); // Clean up debounce timeout
    };
  }, [debouncedResizeHandler, updateColumns]);

  const rowCount = Math.ceil(productList.length / columns);

  return (
    <Virtuoso
      useWindowScroll
      totalCount={rowCount}
      itemContent={(rowIndex) => {
        const items = [];
        for (let i = 0; i < columns; i++) {
          const product = productList[rowIndex * columns + i];
          if (product) {
            items.push(
              <div key={product.sku} className="p-2">
                <MemoizedProductCard
                  product={product}
                  id={rowIndex}
                  key={product.sku}
                  globalAttributes={globalAttributes}
                  selectedMode={selectedMode}
                  breadCrumbsDetails={breadCrumbsDetails}
                  isEnableCompare={isEnableCompare}
                  {...rest}
                />
              </div>
            );
          } else {
            items.push(<div key={`empty-${i}`} className="p-2" />);
          }
        }
        return <div className={`grid grid-cols-${columns} gap-4`}>{items}</div>;
      }}
    />
  );
};

const ListView = ({ productList, globalAttributes, selectedMode, breadCrumbsDetails, isEnableCompare, ...rest }: IDynamicProductList) => {
  return (
    <Virtuoso
      useWindowScroll
      totalCount={productList.length}
      itemContent={(index) => {
        const product = productList[index];
        return (
          <div key={product.sku} className="p-2">
            <MemoizedProductCard
              product={product}
              id={index}
              globalAttributes={globalAttributes}
              selectedMode={selectedMode}
              breadCrumbsDetails={breadCrumbsDetails}
              isEnableCompare={isEnableCompare}
              {...rest}
            />
          </div>
        );
      }}
    />
  );
};

export function ProductViews({
  productData,
  isFromSearch,
  isEnableCompare,
  breadCrumbsDetails,
  ...rest
}: Readonly<{
  productData: IProductList;
  isFromSearch?: boolean;
  isEnableCompare?: boolean;
  breadCrumbsDetails?: {
    breadCrumbsTitle: string;
    isCategoryFlow: boolean;
  };
}>) {
  const [selectedMode, setSelectedMode] = useState(MODE.GRID_MODE);
  const commonTranslations = useTranslationMessages("Common");
  const { setIsProductLoading, isProductLoading } = useProduct();
  const containerRef = useRef<HTMLDivElement>(null);
  const { productList, loginToSeePricingAndInventory, displayAllWarehousesStock } = productData;
  const { user } = useUser();
  const fetchWishList = useWishListStore((state) => state.fetchWishList);

  useEffect(() => {
    user?.userName && productData && productData.productList && productData.productList.length > 0 && fetchWishList(productData.productList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData]);

  const globalAttributes = {
    loginToSeePricingAndInventory: loginToSeePricingAndInventory ?? "false",
    displayAllWarehousesStock: displayAllWarehousesStock ?? "false",
  };

  useEffect(() => {
    const savedMode = sessionStorage.getItem("selectedMode") || MODE.GRID_MODE;
    setSelectedMode(savedMode);
  }, []);

  useEffect(() => {
    setIsProductLoading(false, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData]);

  useEffect(() => {
    if (isProductLoading && containerRef.current) {
      const header = document.getElementById("webstore-header");
      const headerHeight = header?.clientHeight || 0;
      const elementPosition = containerRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, [isProductLoading]);

  const changeView = (mode: string) => {
    setSelectedMode(mode);
    sessionStorage.setItem("selectedMode", mode);
  };

  return (
    <>
      <Modal size="5xl" modalId="QuickView" maxHeight="lg" customClass="overflow-y-auto no-print">
        <QuickViewDetails />
      </Modal>
      <AddToCartNotification />
      <Modal size="5xl" modalId="ProductCompare" maxHeight="lg" customClass="overflow-y-auto no-print p-3" noDefaultClass="m-0 p-0">
        <ProductComparePopup />
      </Modal>
      <div ref={containerRef}>
        <ProductListFilter productData={productData} viewChange={changeView} selectedMode={selectedMode} />
      </div>
      <FacetChipList />
      {isProductLoading ? (
        <LoadingSpinnerComponent />
      ) : productList && productList.length > 0 ? (
        <div className="w-full relative dynamic-product-list min-h-screen">
          {selectedMode === MODE.GRID_MODE ? (
            <GridView
              key="grid-view"
              productList={productList}
              globalAttributes={globalAttributes}
              selectedMode={selectedMode}
              breadCrumbsDetails={breadCrumbsDetails}
              isEnableCompare={isEnableCompare}
              {...rest}
            />
          ) : (
            <ListView
              key="list-view"
              productList={productList}
              globalAttributes={globalAttributes}
              selectedMode={selectedMode}
              breadCrumbsDetails={breadCrumbsDetails}
              isEnableCompare={isEnableCompare}
              {...rest}
            />
          )}
        </div>
      ) : isFromSearch ? (
        <div className="w-full lg:w-[70%] text-sm pb-4">
          <Heading name={commonTranslations("noProductMatch")} level="h3" customClass="font-normal" dataTestSelector="hdgNoProductMatch" />
          <Heading name={`${commonTranslations("trySomethingLike")}:`} level="h4" customClass="font-semibold py-0" dataTestSelector="hdgTrySomethingLike" />
          <ul className="pl-3 ml-3 list-disc">
            <li>
              <Heading name={commonTranslations("usingGeneralTerms")} level="h4" customClass="py-0" dataTestSelector="hdgUsingGeneralTerms" />
            </li>
            <li>
              <Heading name={commonTranslations("checkSpelling")} level="h4" customClass="py-0" dataTestSelector="hdgCheckSpelling" />
            </li>
          </ul>
        </div>
      ) : (
        <NoRecordFound text={`${commonTranslations("noRecordsFound")}`} customClass="my-2" />
      )}
    </>
  );
}
