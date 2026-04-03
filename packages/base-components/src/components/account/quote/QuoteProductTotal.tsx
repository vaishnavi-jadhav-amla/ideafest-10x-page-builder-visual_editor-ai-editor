"use client";

import React, { useCallback, useEffect, useState } from "react";

import { FormatPriceWithCurrencyCode } from "../../common/format-price/";
import { ICalculateSummary } from "@znode/types/account";
import { ICartSettings } from "@znode/types/cart";
import { IPortalDetail } from "@znode/types/portal";
import { Separator } from "../../common/separator";
import TaxSummaryList from "../../tax-summary/TaxSummaryList";
import { cartPageSettings } from "../../../http-request/cart/cart-page-settings";
import { useTranslationMessages } from "@znode/utils/component";

export const QuoteProductTotal = ({ quoteProductTotalData }: { quoteProductTotalData: ICalculateSummary; classNumber?: string }) => {
  const [quoteSetting, setQuoteSettings] = useState<ICartSettings>();
  const commonTranslations = useTranslationMessages("Common");
  const quoteTranslations = useTranslationMessages("Quote");
  const [currencyCode, setCurrencyCode] = useState<string>();

  const getCurrencyData = useCallback(async (currentPortal?: IPortalDetail) => {
    currentPortal?.currencyCode && setCurrencyCode(currentPortal?.currencyCode);
  }, []);

  useEffect(() => {
    !quoteSetting && getCurrencyData(quoteSetting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteSetting]);

  const getPortalPageSettings = async () => {
    const pageSettings = await cartPageSettings();
    setQuoteSettings(pageSettings);
  };

  useEffect(() => {
    getPortalPageSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-end mt-2">
      <div className="font-semibold w-full pr-2 md:w-1/3">
        <div className="mt-2">
          <div className="flex justify-between pb-3">
            <p className="w-25" data-test-selector="paraSubTotalLabel">
              {commonTranslations("subTotal")}
            </p>
            <p data-test-selector="paraSubTotalAmount">
              <FormatPriceWithCurrencyCode price={Number(quoteProductTotalData?.subTotal) || 0} currencyCode={currencyCode || "USD"} />
            </p>
          </div>
          <div className="flex justify-between pb-3">
            <p data-test-selector="paraShippingCostLabel">{commonTranslations("shipping")}</p>
            <p data-test-selector="paraShippingCost">
              + <FormatPriceWithCurrencyCode price={Number(quoteProductTotalData?.shippingCost) || 0} currencyCode={currencyCode || "USD"} />
            </p>
          </div>
          {Number(quoteProductTotalData?.handlingFee) > 0 && (
            <div className="flex justify-between pb-3">
              <p data-test-selector="paraShippingHandlingChargesLabel">{commonTranslations("shippingHandlingCharges")}</p>
              <p data-test-selector="paraShippingHandlingCharges">
                + <FormatPriceWithCurrencyCode price={Number(quoteProductTotalData?.handlingFee) || 0} currencyCode={currencyCode || "USD"} />
              </p>
            </div>
          )}
          {quoteProductTotalData?.importDuty !== undefined && quoteProductTotalData?.importDuty > 0 && (
            <div className="flex justify-between pb-3">
              <p data-test-selector="paraImportLabel">{commonTranslations("importDuty")}</p>
              <p data-test-selector="paraImport">
                + <FormatPriceWithCurrencyCode price={quoteProductTotalData?.importDuty || 0} currencyCode={currencyCode || "USD"} />
              </p>
            </div>
          )}
          <div className="flex justify-between mb-1">
            <p data-test-selector="paraTaxLabel">{commonTranslations("tax")}</p>
            <p className="text-right w-25" data-test-selector="paraTax">
              {" "}
              + <FormatPriceWithCurrencyCode price={Number(quoteProductTotalData?.taxCost) || 0} currencyCode={currencyCode || "USD"} />
            </p>
          </div>
          {quoteProductTotalData?.taxSummaryList && quoteProductTotalData?.taxSummaryList.length > 0 && <TaxSummaryList taxSummaryList={quoteProductTotalData?.taxSummaryList} />}
        </div>
        <Separator />
        <div className="flex justify-between pb-2">
          <p className="text-lg" data-test-selector="paraQuoteTotalLabel">
            {quoteTranslations("quoteTotal")}
          </p>
          <p data-test-selector="paraQuoteTotal">
            <FormatPriceWithCurrencyCode price={Number(quoteProductTotalData?.total) || 0} currencyCode={currencyCode || "USD"} />
          </p>
        </div>
      </div>
    </div>
  );
};
