"use client";
import { ANALYTICS_EVENTS } from "@znode/constants/analytics-event";
import { IProductDetails } from "@znode/types/product-details";
import { sendAnalyticsEvent } from "@znode/utils/component";
import { useEffect, useRef } from "react";

interface IProductData {
  productData: IProductDetails;
}

const ProductAnalytics = (product: IProductData) => {
  const productDetails = {
    id: product.productData.sku,
    name: product.productData.name,
    category: product.productData.categoryName,
    brand: product.productData.brandName,
    price: product.productData.retailPrice,
  };

  // To prevent double execution
  const isAnalyticsSent = useRef(false);

  const getSelectedProductData = async () => {
    if (!isAnalyticsSent.current) {
      sendAnalyticsEvent({
        event: ANALYTICS_EVENTS.SELECT_ITEM,
        ecommerce: {
          currencyCode: product.productData.currencyCode,
          impression: [],
          click: {
            products: [productDetails],
          },
        },
      });
      isAnalyticsSent.current = true; 
    }
  };

  useEffect(() => {
    if (!isAnalyticsSent.current) {
      getSelectedProductData();
      sendAnalyticsEvent({
        event: ANALYTICS_EVENTS.VIEW_ITEM,
        ecommerce: {
          currencyCode: product.productData.currencyCode,
          detail: {
            products: [productDetails],
          },
        },
      });
      isAnalyticsSent.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default ProductAnalytics;
