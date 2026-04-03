"use client";

import { useEffect, useState } from "react";

import { useFormatter } from "next-intl";

export function usePriceFormatter(price: number, currencyCode: string, priceRoundOff:number) {
  const format = useFormatter();
  const [formattedPrice, setFormattedPrice] = useState<string>("");
const formatPrice = async () => {
  if (price !== undefined && price != null && currencyCode) {
    const result = await format.number(price, {
      style: "currency",
      roundingPriority: "auto",
      currency: currencyCode || "USD",
      minimumFractionDigits: priceRoundOff, 
      maximumFractionDigits: priceRoundOff, 
    });
    setFormattedPrice(result ? result.toString() : "");
  } else {
    setFormattedPrice("");
  }
};

  useEffect(() => {
    formatPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, currencyCode, format, priceRoundOff]);

  return formattedPrice;
}
