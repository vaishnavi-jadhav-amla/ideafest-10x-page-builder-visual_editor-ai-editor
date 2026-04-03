"use client";

import { useEffect, useState } from "react";

import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { IPriceProps } from "@znode/types/product";
import { ValidationMessage } from "../../common/validation-message";
import { useTranslations } from "next-intl";
import { useUser } from "../../../stores/user-store";

export function Price({
  retailPrice,
  currencyCode,
  salesPrice,
  loginRequired,
  isCallForPricing,
  callForPricingMessage,
  productList,
  isObsolete,
  unitOfMeasurement,
  id,
}: IPriceProps) {
  const { user } = useUser();
  const [groupProductStartingPrice, setGroupProductStartingPrice] = useState<number>();
  const t = useTranslations("Price");

  const getGroupProductStartingPrice = () => {
    if (productList?.length) {
      let startingPrice = productList[0]?.salesPrice ? productList[0]?.salesPrice : productList[0]?.retailPrice;

      for (let i = 1; i < productList.length; i++) {
        if (productList[i] && startingPrice) {
          const productPrice = productList[i]?.salesPrice ? productList[i]?.salesPrice : productList[i]?.retailPrice;
          if (productPrice != null && productPrice != undefined) {
            if (productPrice < startingPrice) {
              startingPrice = Number(productList[i]?.salesPrice ? productList[i]?.salesPrice : productList[i]?.retailPrice);
            }
          }
        }
      }
      startingPrice = startingPrice ? startingPrice : 0;
      setGroupProductStartingPrice(startingPrice);
    }
  };

  const getRetailPriceClass = () => {
    const isAvailable = !salesPrice && !isObsolete;
    const hasRetailPrice = Boolean(retailPrice);
    const shouldHighlight = isAvailable && hasRetailPrice;
    return shouldHighlight ? "text-linkColor" : "text-stone-400 line-through";
  };

  useEffect(() => {
    getGroupProductStartingPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-0 text-linkColor heading-2">
      {productList?.length && (!loginRequired || user) && !isCallForPricing && callForPricingMessage === undefined ? (
        <div className="mb-1" data-test-selector={`divStartingPrice${id}`}>
          <span className="pr-3" data-test-selector={`spnStartingPrice${id}`}>
            {t("startingAt")}: {productList[0]?.currencySuffix ?? "$"}
            {groupProductStartingPrice}
          </span>
        </div>
      ) : null}

      {!productList?.length && (!loginRequired || user) && !isCallForPricing && callForPricingMessage === undefined ? (
        <div className="mb-1" data-test-selector={`divSalesPrice${id}`}>
          {salesPrice && salesPrice !== null && salesPrice > 0 ? (
            <span className={` pr-3 ${isObsolete ? "text-stone-400 line-through" : "text-linkColor"} `} data-test-selector={`spnSalesPrice${id}`}>
              <FormatPriceWithCurrencyCode price={salesPrice} currencyCode={currencyCode || "USD"} />
              {salesPrice && unitOfMeasurement && <span>{` / ${unitOfMeasurement}`}</span>}
            </span>
          ) : (
            ""
          )}
          <span className={getRetailPriceClass()} data-test-selector={`spnRetailPrice${id}`}>
            <FormatPriceWithCurrencyCode price={retailPrice} currencyCode={currencyCode || "USD"} />
            {retailPrice && unitOfMeasurement && <span>{` / ${unitOfMeasurement}`}</span>}
          </span>
        </div>
      ) : null}
      {(productList?.length || productList) && (!loginRequired || user) && callForPricingMessage !== undefined ? (
        <ValidationMessage message={callForPricingMessage} dataTestSelector={`callForPricingError${id}`} customClass="mb-3 text-xl font-medium text-errorColor" />
      ) : (null)}
    </div>
  );
}
