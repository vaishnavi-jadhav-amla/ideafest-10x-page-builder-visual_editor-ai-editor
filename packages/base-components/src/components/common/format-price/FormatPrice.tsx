"use client";

import { GENERAL_SETTINGS } from "@znode/constants/app";
import { usePriceFormatter } from "@znode/utils/component";

interface IFormatPrice {
  price: number;
  priceRoundOff?: number;
  currencyCode: string;
}

export const FormatPriceWithCurrencyCode = (prop: IFormatPrice) => {
  const { price, currencyCode, priceRoundOff = GENERAL_SETTINGS.PRICE_ROUND_OFF } = prop;
  const formattedValue = usePriceFormatter(price, currencyCode, priceRoundOff);
  return <>{formattedValue}</>;
};
