"use client";

import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import { ICartSummary } from "@znode/types/cart";
import LoaderComponent from "../../common/loader-component/LoaderComponent";
import { Separator } from "../../common/separator";
import { useTranslations } from "next-intl";

const CartSummary = ({ isLoading, cartSummary }: { isLoading: boolean; cartSummary: ICartSummary | undefined }) => {
  const checkoutTranslations = useTranslations("Checkout");
  const commonTranslations = useTranslations("Common");
  const { subTotal = 0, shippingCost = 0, handlingFee = 0, hasDiscount = false, total = 0, totalDiscount = 0, currencyCode = "USD" } = cartSummary || {};
  return (
    <div>
      <Heading customClass="uppercase" level="h2" dataTestSelector="hdgOrderSummary" name={checkoutTranslations("orderSummary")} showSeparator />
      {isLoading ? (
        <div className="py-6">
          <LoaderComponent isLoading={isLoading} width="40px" height="40px" />
        </div>
      ) : (
        <>
          <div className="flex justify-between font-semibold px-2 py-2.5" data-test-selector="divCartOrderSummaryContainer">
            <p data-test-selector="paraSubTotalLabel">{checkoutTranslations("subTotal")}</p>
            <p data-test-selector="paraSubTotalAmount">
              <FormatPriceWithCurrencyCode price={subTotal} currencyCode={currencyCode} />
            </p>
          </div>
          {shippingCost > 0 && (
            <div className="flex justify-between font-semibold px-2 py-2.5">
              <p data-test-selector="paraShippingLabel">{checkoutTranslations("shipping")}</p>
              <p data-test-selector="paraShippingCost">
                + <FormatPriceWithCurrencyCode price={shippingCost} currencyCode={currencyCode} />
              </p>
            </div>
          )}
          {handlingFee > 0 && (
            <div className="flex justify-between font-semibold px-2 py-2.5">
              <p data-test-selector="paraHandlingChargesLabel">{checkoutTranslations("handlingCharges")}</p>
              <p data-test-selector="paraShippingHandlingCharges">
                + <FormatPriceWithCurrencyCode price={handlingFee} currencyCode={currencyCode} />
              </p>
            </div>
          )}
          {hasDiscount && (
            <div className="flex justify-between font-semibold px-2 py-2.5">
              <p data-test-selector="paraDiscountLabel">
                {commonTranslations("discount")} ({commonTranslations("on")} {checkoutTranslations("subTotal")})
              </p>
              <p data-test-selector="paraDiscount">
                - <FormatPriceWithCurrencyCode price={totalDiscount} currencyCode={currencyCode} />
              </p>
            </div>
          )}
          <Separator customClass="mb-0" />
          <div className="flex justify-between p-2 text-lg font-semibold">
            <p data-test-selector="paraOrderTotalLabel">{checkoutTranslations("orderTotal")}</p>
            <p data-test-selector="paraOrderTotalAmount">
              <FormatPriceWithCurrencyCode price={total} currencyCode={currencyCode} />
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSummary;
