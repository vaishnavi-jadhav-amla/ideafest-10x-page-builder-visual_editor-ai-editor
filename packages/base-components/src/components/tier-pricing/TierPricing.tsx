"use client";

import { IOfferPrice, IOfferPricingProps } from "@znode/types/product";

import { FormatPriceWithCurrencyCode } from "../common/format-price";
import { Heading } from "../common/heading";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../stores/user-store";

const TierPricing = ({ offerPricing, productPrice, currencyCode, loginRequired }: IOfferPricingProps) => {
  const commonMessage = useTranslationMessages("Common");
  const productMessage = useTranslationMessages("Product");
  const { user } = useUser();

  const calculateDiscount = (tierPrice: number) => {
    return productPrice && tierPrice ? Math.round(100 - (100 / productPrice) * tierPrice) : 0;
  };

  const renderTierPricing = () => {
    return (
      offerPricing &&
      offerPricing.map((tierPricing: IOfferPrice, i: number) => {
        if (tierPricing) {
          const { minQuantity, price } = tierPricing;
          const discount = calculateDiscount(price as number);
          return (
            <div className="flex gap-2 pb-1 leading-5" key={i} data-test-selector={`divTierPricing${i}`}>
              <p className="text-md" data-test-selector={`paraBuyQuantity${i}`}>
                Buy {minQuantity} or more
              </p>
              <p className="text-md" data-test-selector={`paraPrice${i}`}>
                <FormatPriceWithCurrencyCode price={price || 0} currencyCode={currencyCode || "USD"} />
                /item
              </p>
              {price && (
                <p className="font-semibold text-md" data-test-selector={`paraDiscount${i}`}>
                  {commonMessage("save")} {discount}%
                </p>
              )}
            </div>
          );
        }
      })
    );
  };

  return (
    (!loginRequired || user) && (
      <div className="text-sm xs:mb-2 md:mb-0 mt-2" data-test-selector="divSpecialPriceOffersLabel">
        <Heading name={productMessage("specialPriceOffers")} dataTestSelector="hdgSpecialPriceOffers" customClass="pt-0 tracking-wide font-medium" level="h4" />
        {renderTierPricing()}
      </div>
    )
  );
};

export default TierPricing;
