"use client";

import { IProductList, IProductListCard } from "@znode/types/product";

import { FacetChipList } from "@znode/base-components/components/product/facet";
import { Heading } from "@znode/base-components/common/heading";
import { MODE } from "@znode/constants/mode";
import { NoRecordFound } from "@znode/base-components/common/no-record-found/NoRecordFound";
import { ProductCard } from "../product-card";
import { ProductListFilter } from "@znode/base-components/components/product/product-list/product-list-filter/ProductListFilter";
import { useState } from "react";
import { useTranslationMessages } from "@znode/utils/component";

export function ProductViews({ productData, isFromSearch, ...rest }: Readonly<{ productData: IProductList; isFromSearch?: boolean }>) {
  const [selectedMode, setSelectedMode] = useState(MODE.GRID_MODE);
  const { productList, loginToSeePricingAndInventory, displayAllWarehousesStock } = productData;
  const globalAttributes = {
    loginToSeePricingAndInventory: loginToSeePricingAndInventory ?? "false",
    displayAllWarehousesStock: displayAllWarehousesStock ?? "false",
  };
  const commonTranslations = useTranslationMessages("Common");

  const changeView = (mode: string) => {
    setSelectedMode(mode);
  };

  const renderProductsView = () => {
    return productList.map((product: IProductListCard, i: number) => {
      const props = { product, id: i, globalAttributes, selectedMode, ...rest };
      return <ProductCard {...props} key={i + product.sku} />;
    });
  };

  return (
    <>
      <ProductListFilter productData={productData} viewChange={changeView} selectedMode={selectedMode} />
      <FacetChipList />
      {productList && productList.length > 0 ? (
        <div className={selectedMode === MODE.GRID_MODE ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2" : "grid grid-cols-1 gap-4"}>
          {renderProductsView()}
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
        <NoRecordFound text={`${commonTranslations("noRecordsFound")}`} customClass="my-20" />
      )}
    </>
  );
}
