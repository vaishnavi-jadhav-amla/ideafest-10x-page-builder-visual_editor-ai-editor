"use client";

import { LoadingSpinner, ZIcons } from "../../common/icons";
import { useCartDetails, useCheckout, useUser } from "../../../stores";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { SETTINGS } from "@znode/constants/settings";
import { Separator } from "../../common/separator";
import TaxSummaryList from "../../tax-summary/TaxSummaryList";
import { getCartNumber } from "../../../http-request/cart";
import { getCartSummary } from "../../../http-request/cart";
import { useTranslationMessages } from "@znode/utils/component";

interface ITotalTableProps {
  isFromQuote?: boolean;
  currencyCode: string;
}

//Note: Avalara Tax Implementation Pending, do not remove the commented code.

const TotalTable = ({ isFromQuote, currencyCode }: ITotalTableProps) => {
  const checkoutTranslations = useTranslationMessages("Checkout");
  const { cartSummaryRefresher } = useCartDetails();
  const { orderSummaryData, setOrderSummaryData, isTaxExempt } = useCheckout();
  const { user } = useUser();

  const [isOrderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [isTaxSummaryShow, setTaxSummaryShow] = useState(false);

  const handledImpersonatedUser = () => {
    if (user?.crsName !== "" && (user?.isTaxExempt || isTaxExempt)) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    reviewCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSummaryRefresher]);

  const reviewCart = async () => {
    setOrderSummaryLoading(true);
    const cartNumber = await getCartNumber();
    const isTax = handledImpersonatedUser();
    const orderSummaryData = await getCartSummary(cartNumber, undefined, undefined, isFromQuote, isTax);
    setOrderSummaryData(orderSummaryData);
    setOrderSummaryLoading(false);
  };

  const handleArrowClick = () => {
    if (isTaxSummaryShow) {
      setTaxSummaryShow(false);
    } else {
      setTaxSummaryShow(true);
    }
  };

  return (
    <div>
      <div className={`py-2 ${isOrderSummaryLoading ? "border-t" : ""}`}>
        {isOrderSummaryLoading ? (
          <div className="flex items-center justify-center h-48 pt-5 pb-5">
            <LoadingSpinner width="50px" height="50px" />
          </div>
        ) : orderSummaryData ? ( // Add this condition
          <div>
            <div className="font-semibold">
              <Separator />
              <div className="flex justify-between py-1" data-test-selector="divSubTotal">
                <p data-test-selector="paraSubTotalLabel">{checkoutTranslations("subTotal")}</p>
                <p data-test-selector="paraSubTotalAmount">
                  <FormatPriceWithCurrencyCode price={orderSummaryData.subTotal || 0} currencyCode={currencyCode} />
                </p>
              </div>
              {
                <div className="flex justify-between py-1" data-test-selector="divShippingCost">
                  <p data-test-selector="paraShippingCostLabel">{checkoutTranslations("shipping")}</p>
                  <p data-test-selector="paraShippingCost">
                    +<FormatPriceWithCurrencyCode price={orderSummaryData.shippingCost || 0} currencyCode={currencyCode} />
                  </p>
                </div>
              }
              {orderSummaryData.handlingFee && orderSummaryData.handlingFee > 0 ? (
                <div className="flex justify-between py-1">
                  <p data-test-selector="paraHandlingChargeLabel">{checkoutTranslations("handlingCharges")}</p>
                  <p data-test-selector="paraHandlingCharges">
                    +<FormatPriceWithCurrencyCode price={orderSummaryData.handlingFee} currencyCode={currencyCode} />
                  </p>
                </div>
              ) : null}
              {orderSummaryData?.importDuty && orderSummaryData?.importDuty > 0 ? (
                <div className="flex justify-between py-1">
                  <p data-test-selector="paraImportDutyLabel">{checkoutTranslations("importDuty")}</p>
                  <p data-test-selector="paraImportDuty">
                    +<FormatPriceWithCurrencyCode price={orderSummaryData?.importDuty} currencyCode={currencyCode} />
                  </p>
                </div>
              ) : null}
              {orderSummaryData.taxCost !== undefined && orderSummaryData.taxCost > 0 && (
                <>
                  <div className="flex justify-between py-1" data-test-selector="divTax">
                    <p className="flex items-center" data-test-selector="paraTaxLabel">
                      <span data-test-selector="spnTax">{checkoutTranslations("tax")} </span>
                      {orderSummaryData?.taxSummaryList && orderSummaryData?.taxSummaryList?.length > 0 && (
                        <Button
                          type="text"
                          size="small"
                          dataTestSelector="btnDownArrow"
                          className={`ml-3 ${isTaxSummaryShow ? "rotate-180" : ""}`}
                          startIcon={<ZIcons name="chevron-down" height="25px" width="25px" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />}
                          onClick={() => handleArrowClick()}
                        ></Button>
                      )}
                    </p>
                    <p data-test-selector="paraTax">
                      +<FormatPriceWithCurrencyCode price={orderSummaryData.taxCost} currencyCode={currencyCode} />
                    </p>
                  </div>
                  {isTaxSummaryShow && orderSummaryData?.taxSummaryList && orderSummaryData.taxSummaryList?.length > 0 && (
                    <TaxSummaryList taxSummaryList={orderSummaryData?.taxSummaryList} taxMessageList={orderSummaryData?.taxMessageList} />
                  )}
                </>
              )}
              {orderSummaryData.shippingDiscount && orderSummaryData.shippingDiscount > 0 ? (
                <div className="flex justify-between py-2" data-test-selector="divShippingDiscount">
                  <p data-test-selector="paraShippingDiscountLabel">{checkoutTranslations("shippingDiscount")}</p>
                  <p data-test-selector="paraShippingDiscount">
                    -<FormatPriceWithCurrencyCode price={orderSummaryData.shippingDiscount} currencyCode={currencyCode} />
                  </p>
                </div>
              ) : null}
              {orderSummaryData.totalDiscount !== undefined && orderSummaryData.totalDiscount > 0 && (
                <div className="flex justify-between py-2" data-test-selector="divDiscount">
                  <p data-test-selector="paraDiscountLabel">{checkoutTranslations("discountSubTotal")}</p>
                  <p data-test-selector="paraDiscount">
                    -<FormatPriceWithCurrencyCode price={orderSummaryData.totalDiscount} currencyCode={currencyCode} />
                  </p>
                </div>
              )}
              {Number(orderSummaryData.csrDiscountAmount || 0) > 0 && user?.crsName !== "" && (
                <div className="flex justify-between mb-2">
                  <div className="w-25" data-test-selector="divCsrDiscountLabel">
                    {checkoutTranslations("csrDiscount")}
                  </div>
                  <div className="w-25 text-right" data-test-selector="divCsrDiscount">
                    {" "}
                    - <FormatPriceWithCurrencyCode price={Number(orderSummaryData.csrDiscountAmount)} currencyCode={currencyCode || "USD"} />
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex justify-between py-1 text-lg font-semibold " data-test-selector={isFromQuote ? "divQuoteTotalContainer" : "divOrderTotalContainer"}>
                <p data-test-selector="paraOrderTotalLabel">{isFromQuote ? checkoutTranslations("quoteTotal") : checkoutTranslations("orderTotal")}</p>
                <p data-test-selector="paraOrderTotalAmount">
                  <FormatPriceWithCurrencyCode price={orderSummaryData.total || 0} currencyCode={currencyCode} />
                </p>
              </div>
              {orderSummaryData.giftCardAmount !== 0 && (
                <div>
                  <div className="flex justify-between py-2">
                    <p data-test-selector="paraVoucherAmountLabel">{checkoutTranslations("voucherAmount")}</p>
                    <p data-test-selector="paraVoucherAmount">
                      - <FormatPriceWithCurrencyCode price={orderSummaryData.giftCardAmount || 0} currencyCode={currencyCode} />
                    </p>
                  </div>
                  <div className="flex justify-between py-2">
                    <p data-test-selector="paraAmountToBePaidLabel">({checkoutTranslations("amountToBePaid")}</p>
                    <p data-test-selector="paraAmountToBePaid">
                      <FormatPriceWithCurrencyCode price={orderSummaryData.orderTotalWithoutVoucher || 0} currencyCode={currencyCode} />)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default TotalTable;
