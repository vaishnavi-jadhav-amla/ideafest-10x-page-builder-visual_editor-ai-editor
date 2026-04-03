import { IProductLayoutProps } from "@znode/types/product";
import TypeaheadProductPrice from "../../layout-components/header/search-box/TypeaheadProductPrice";
import { Heading } from "../heading";
import { CustomImage } from "../image";
import { NavLink } from "../nav-link";
import { useTranslationMessages } from "@znode/utils/component";
import { useCallback, useState } from "react";

export function TypeaheadProductCard({ product, id, globalAttributes, displaySKU = true, key, handleClickOutside }: Readonly<IProductLayoutProps>) {
  const productTranslations = useTranslationMessages("Product");
  const { name, imageSmallPath, seoUrl, znodeProductId, publishProductId, sku } = product || {};
  const [loginRequiredToSeePricing, setLoginRequiredToSeePricing] = useState(false);

  const productId = znodeProductId ? Number(znodeProductId) : publishProductId ? Number(publishProductId) : 0;
  const productUrl = seoUrl ? "/" + seoUrl : `/product/${productId}`;

  const productImageElement = useCallback(
    () => (
      <>
        <div data-test-selector={`productImage${productId}Container`} className="flex items-center justify-center w-auto " aria-label={`${name}-${sku}`}>
          <div className={"relative flex justify-center items-center h-28 w-60"}>
            <CustomImage
              src={imageSmallPath}
              alt={name}
              className="object-contain w-auto m-auto h-full"
              width={230}
              height={500}
              id={`${id}-${sku}`}
              dataTestSelector={`imgProduct${productId}`}
              imageWrapperClass="h-full"
            />
          </div>
        </div>
        <Heading name={name} level="h3" customClass="leading-tight cursor-pointer pb-1" dataTestSelector={`hdgProductName${productId}`} />
        {displaySKU && (
          <div className="heading-4" data-test-selector={`divProductSKUContainer${productId}`}>
            <span data-test-selector={`spnProductSkuLabel${productId}`}>{productTranslations("sku")}: </span>
            <span data-test-selector={`spnProductSkuValue${productId}`}>{sku}</span>
          </div>
        )}
      </>
    ),
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [product, displaySKU]
  );

  return (
    <>
      {loginRequiredToSeePricing ? (
        <div
          className={"relative flex flex-col justify-between h-full p-2 mb-1 bg-white xl:mb-0 product-card card hover:shadow-lg first-line:border-solid hover:z-auto md:mt-0"}
          tabIndex={0}
          key={key}
        >
          <div className={"relative flex-none w-auto"} data-test-selector={`divProductCard${productId}`}>
            <NavLink url={productUrl} dataTestSelector={`linkProductInfo${productId}`} onClick={handleClickOutside}>
              {productImageElement()}
            </NavLink>
            <TypeaheadProductPrice
              priceDetails={product?.productPricingDetails}
              productId={productId}
              loginToSeePricing={globalAttributes?.loginToSeePricingAndInventory ?? "false"}
              setLoginRequiredToSeePricing={setLoginRequiredToSeePricing}
            />
          </div>
        </div>
      ) : (
        <NavLink
          className={"relative flex flex-col justify-between h-full p-2 mb-1 bg-white xl:mb-0 product-card card hover:shadow-lg first-line:border-solid hover:z-auto md:mt-0"}
          url={productUrl}
          key={key}
          dataTestSelector={`linkProductCard${productId}`}
          onClick={handleClickOutside}
        >
          <div className={"relative flex-none w-auto"} data-test-selector={`divProductCard${productId}`}>
            {productImageElement()}
            <TypeaheadProductPrice
              priceDetails={product?.productPricingDetails}
              productId={productId}
              loginToSeePricing={globalAttributes?.loginToSeePricingAndInventory ?? "false"}
              setLoginRequiredToSeePricing={setLoginRequiredToSeePricing}
            />
          </div>
        </NavLink>
      )}
    </>
  );
}
