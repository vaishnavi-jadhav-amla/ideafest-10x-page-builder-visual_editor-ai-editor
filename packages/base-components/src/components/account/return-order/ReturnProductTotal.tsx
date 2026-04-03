import { FormatPriceWithCurrencyCode } from "../../common/format-price/FormatPrice";
import { IReturnProductTotal } from "@znode/types/order";
import React from "react";
import { Tooltip } from "../../common/tooltip/ToolTip";
import { ZIcons } from "../../common/icons/ZIcons";
import { useTranslationMessages } from "@znode/utils/component";

function ReturnProductTotal({ calculateDetails, currencyCode, isReceipt = false, priceRoundOff }: IReturnProductTotal) {
  const returnOrderTranslations = useTranslationMessages("ReturnOrder");

  return (
    <div className="flex flex-col items-end mt-2">
      <div className="font-semibold w-full md:w-1/3 px-2">
        <div className="border-b">
          <div className="flex justify-between mb-2">
            <div className="w-25" data-test-selector="divSubTotalLabel">
              {returnOrderTranslations("subTotals")}
            </div>
            <div className="w-25 text-right" data-test-selector="divReturnSubTotal">
              <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.returnSubTotal as number} currencyCode={currencyCode || "USD"} />
            </div>
          </div>
          {calculateDetails?.returnShippingCost ? (
            <div className="flex justify-between mb-2">
              <div className="w-25" data-test-selector="divShippingLabel">
                {returnOrderTranslations("shipping")}
              </div>
              <div className="w-25 text-right" data-test-selector="divReturnShippingCost">
                {" "}
                + <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.returnShippingCost} currencyCode={currencyCode || "USD"} />
              </div>
            </div>
          ) : (
            ""
          )}

          <div className="flex justify-between mb-2">
            <div className="w-25" data-test-selector="divTaxLabel">
              {returnOrderTranslations("tax")}
            </div>
            <div className="w-25 text-right" data-test-selector="divReturnTaxCost">
              {" "}
              + <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.returnTaxCost ?? 0} currencyCode={currencyCode || "USD"} />
            </div>
          </div>

          {calculateDetails?.discount ? (
            <div className="flex justify-between mb-2">
              <div className="w-25" data-test-selector="divShippingDiscountLabel">
                {returnOrderTranslations("discount")} ({returnOrderTranslations("onSubTotal")})
              </div>
              <div className="w-25 text-right" data-test-selector="divReturnShippingDiscount">
                {" "}
                - <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.discount} currencyCode={currencyCode || "USD"} />
              </div>
            </div>
          ) : (
            ""
          )}
          {calculateDetails?.returnShippingDiscount ? (
            <div className="flex justify-between mb-2">
              <div className="w-25" data-test-selector="divCsrDiscountLabel">
                {returnOrderTranslations("returnShippingDiscount")}
              </div>
              <div className="w-25 text-right" data-test-selector="divReturnCsrDiscount">
                {" "}
                - <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.returnShippingDiscount} currencyCode={currencyCode || "USD"} />
              </div>
            </div>
          ) : (
            ""
          )}
          {calculateDetails?.csrDiscount ? (
            <div className="flex justify-between mb-2">
              <div className="w-25" data-test-selector="divCsrDiscountLabel">
                {returnOrderTranslations("csrDiscount")}
              </div>
              <div className="w-25 text-right" data-test-selector="divReturnCsrDiscount">
                {" "}
                - <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.csrDiscount} currencyCode={currencyCode || "USD"} />
              </div>
            </div>
          ) : (
            ""
          )}
          {calculateDetails?.returnCharges ? (
            <div className="flex justify-between mb-2">
              <div className={isReceipt && calculateDetails?.returnCharges > 0 ? "w-25" : "w-full"} data-test-selector="divReturnCharges">
                {returnOrderTranslations("returnCharges")} ({returnOrderTranslations("nonRefundedAmount")})
              </div>
              <div className="flex justify-end items-center w-full">
                {" "}
                <div className="w-full text-right" data-test-selector="divReturnCharges">
                  {" "}
                  - <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.returnCharges} currencyCode={currencyCode || "USD"} />
                </div>
                {isReceipt && calculateDetails?.returnCharges > 0 ? (
                  <Tooltip messageContainerClass="w-[200px]" message={returnOrderTranslations("returnOrderChargesTip")} cssClasses="ml-1" placement="left">
                    <ZIcons name="circle-help" width={13} height={13} data-test-selector={`svgReturnCharges${calculateDetails.returnCharges}`} />
                  </Tooltip>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="flex justify-between pt-2 pb-2">
          <div className="w-25 font-bold" data-test-selector="divReturnTotalLabel">
            {returnOrderTranslations("returnTotal")}
          </div>
          <div className="w-25 text-right font-bold" data-test-selector="divReturnTotal">
            <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={calculateDetails?.returnTotal as number} currencyCode={currencyCode || "USD"} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnProductTotal;
