"use client";

import "./product-card.css";

import Button from "@znode/base-components/common/button/Button";
import { CustomImage } from "@znode/base-components/common/image";
import { Heading } from "@znode/base-components/common/heading";
import { IProductLayoutProps } from "@znode/types/product";
import { MODE } from "@znode/constants/mode";
import { NavLink } from "@znode/base-components/common/nav-link";
import { useState } from "react";
import { useTranslationMessages } from "@znode/utils/component";

export function ProductCard({ product, id, selectedMode = MODE.GRID_MODE, displaySKU = true }: Readonly<IProductLayoutProps>) {
  const productTranslations = useTranslationMessages("Product");
  const commonTranslations = useTranslationMessages("Common");
  const [, setProductActiveId] = useState<number | null>(null);

  const { name, imageSmallPath, seoUrl, znodeProductId, publishProductId, sku } = product || {};

  const productId = znodeProductId ? Number(znodeProductId) : publishProductId ? Number(publishProductId) : 0;

  const productUrl = seoUrl ? "/" + seoUrl : `/product/${productId}`;

  const isListMode = selectedMode === MODE.LIST_MODE;

  return (
    <div className="flip-card" onMouseEnter={() => setProductActiveId(productId)} onMouseLeave={() => setProductActiveId(null)}>
      <div className="flip-card-inner relative flex flex-col justify-between h-full p-4 mb-4 bg-white xl:mb-0 product-card card hover:shadow-lg first-line:border-solid hover:z-auto md:mt-0">
        {/* Front of the card */}
        <div className="">
          <div className={isListMode ? "grid grid-cols-4" : ""}>
            <div className={isListMode ? "relative col-span-4 sm:col-span-1" : "relative flex-none w-auto"} data-test-selector={`divProductImage${productId}`}>
              <NavLink url={productUrl} className="flex items-center justify-center w-auto" dataTestSelector={`linkProductImage${productId}`} ariaLabel={`${name}-${sku}`}>
                <div className="relative flex h-52 w-52 justify-center">
                  <CustomImage
                    src={imageSmallPath}
                    alt={name}
                    className="object-contain w-auto m-auto w-full h-full"
                    width={230}
                    height={500}
                    id={`${id}-${sku}`}
                    dataTestSelector={`imgProduct${productId}`}
                    imageWrapperClass="w-full"
                  />
                </div>
              </NavLink>
            </div>
            <div className={isListMode ? "flex flex-col m-4 col-span-4 sm:col-span-3" : "flex-none pb-2 mt-4"} data-test-selector={`divProductDetails${productId}`}>
              <NavLink url={productUrl} dataTestSelector={`linkProductName${productId}`} ariaLabel={`${name}-${sku}`} className="flex">
                <Heading name={name} level="h3" customClass="leading-tight cursor-pointer pb-1" dataTestSelector={`hdgProduct${productId}`} />
              </NavLink>
              {displaySKU && (
                <div className="heading-4" data-test-selector={`divProductSKUContainer${productId}`}>
                  <span data-test-selector={`spnProductSkuLabel${productId}`}>{productTranslations("sku")}: </span>
                  <span data-test-selector={`spnProductSkuValue${productId}`}>{sku}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back of the card */}
        <div className="flip-card-back">
          {/* Add additional information for the back, such as product details, description, etc. */}
          <div className="text-center">
            <NavLink url={productUrl} dataTestSelector="linkViewDetails" ariaLabel="View details">
              <Button type="primary" size="small" ariaLabel="view details button" className="w-full" dataTestSelector={`btnViewDetails${productId}`} >
                {commonTranslations("viewDetails")}
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
