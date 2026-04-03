"use client";

import { IBundleProductDetails, IBundleProductProps } from "@znode/types/product-details";

import { BundleProductInventory } from "./BundleProductInventory";
import { Heading } from "../../../../common/heading";
import Image from "next/image";
import React from "react";
import TypicalLeadTiming from "../../../../typical-lead-timing/TypicalLeadTiming";
import { useTranslationMessages } from "@znode/utils/component";

export const BundleProduct = ({ bundleProducts, productType, isParentObsolete, loginRequired, stockNotification, productUrl, productInventoryMessage }: IBundleProductProps) => {
  const productTranslations = useTranslationMessages("Product");

  const renderBundleAttributes = (bundleProduct: IBundleProductDetails) => {
    return (
      <>
        <td className="flex flex-col gap-2 px-1 py-5 text-sm bg-white md:px-5 " data-test-selector={`rowBundleProduct${bundleProduct?.publishProductId}`}>
          <Heading name={bundleProduct.bundleProductName} customClass="pt-0 font-medium" level="h4" dataTestSelector={`divBundleProduct${bundleProduct?.publishProductId}`} />
          <div className="flex flex-row gap-2 md:gap-10 ">
            <Image
              className="w-16 h-16"
              src={bundleProduct.imageThumbNailPath}
              alt="Product Image"
              width={230}
              height={500}
              data-test-selector={`imgProductImage${bundleProduct?.publishProductId}`}
            />
            <div className="flex flex-col space-y-2">
              <div className="flex gap-4 md:gap-5">
                <p className="w-1/3 py-0 font-medium heading-4 lg:w-16" data-test-selector={`paraProductSKULabel${bundleProduct?.publishProductId}`}>
                  {productTranslations("sku")}:
                </p>
                <p className="text-sm" data-test-selector={`paraSku${bundleProduct?.publishProductId}`}>
                  {bundleProduct.bundleProductSKU}
                </p>
              </div>
              {isParentObsolete === false && (
                <>
                  <BundleProductInventory
                    loginRequired={loginRequired}
                    productType={productType || ""}
                    bundleProduct={bundleProduct}
                    bundleProductsData={bundleProducts}
                    stockNotification={stockNotification || false}
                    childSku={bundleProduct.bundleProductSKU}
                    productUrl={productUrl}
                    productInventoryMessage={productInventoryMessage}
                  />
                  {!isNaN(bundleProduct.typicalLeadTime) && (
                    <div className="flex gap-5 text-xs">
                      <TypicalLeadTiming typicalLeadTime={bundleProduct.typicalLeadTime} productType={bundleProduct.childProductType || ""} customLabelWidth="w-28" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </td>
        <td className="px-1 py-5 text-sm bg-white md:px-5 ">
          <div className="flex flex-row items-center justify-center" data-test-selector={`divBundleProductQuantity${bundleProduct?.publishProductId}`}>
            {bundleProduct.bundleProductQuantity}
          </div>
        </td>
      </>
    );
  };

  const renderBundleProducts = ({ bundleProducts }: IBundleProductProps) => {
    return bundleProducts.map((bundleProduct: IBundleProductDetails) => {
      return (
        <tr className="border-t border-gray-200 border-x" key={bundleProduct.publishProductId}>
          {renderBundleAttributes(bundleProduct)}
        </tr>
      );
    });
  };

  return (
    <div className="inline-block min-w-full mt-3 mb-6 overflow-hidden shadow-md rounded-cardBorderRadius" data-test-selector="tblBundleProducts">
      <table className="w-full overflow-scroll leading-normal table-auto" role="presentation">
        <tr className="border border-b-2 border-gray-200" data-test-selector="rowBundleGridHeading">
          <td
            className="w-5/6 px-1 py-3 font-medium tracking-wider text-left text-gray-700 uppercase bg-gray-100 heading-4 md:px-5 md:w-2/3"
            data-test-selector="hdgIncludedProducts"
          >
            {productTranslations("includedProducts")}
          </td>
          <td
            className="w-1/6 px-1 py-3 font-medium tracking-wider text-center text-gray-700 uppercase bg-gray-100 heading-4 md:px-5 md:w-1/3"
            data-test-selector="hdgQuantitiesInBundle"
          >
            {productTranslations("quantitiesInBundle")}
          </td>
        </tr>
        {renderBundleProducts({ bundleProducts, productType, isParentObsolete, loginRequired, stockNotification })}
      </table>
    </div>
  );
};
