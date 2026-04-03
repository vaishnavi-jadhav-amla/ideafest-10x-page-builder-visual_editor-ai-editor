"use client";

import { IConfigurableProduct, IProductDetails, IQueryParams } from "@znode/types/product-details";
import { useEffect, useState } from "react";
import { useModal, useProduct } from "../../../../stores";

import { IQuery } from "@znode/types/product";
import { LoaderComponent } from "../../loader-component";
import ProductBasicInfo from "../../../product/product-details/product-information/ProductBasicInfo";
import { getConfigProductDataForQuickView } from "../../../../http-request/product";
import { getQuickDetails } from "../../../../http-request";
import { useQuickViewVariant } from "../../../../stores/quick-view-config";
import { useSearchParams } from "next/navigation";

function QuickViewDetails() {
  const {
    product: { quickViewData },
    setQuickViewData,
  } = useProduct();
  const { closeModal } = useModal();
  const searchParams = useSearchParams();
  const { quickViewVariant, setQuickViewVariant } = useQuickViewVariant();
  const [isLoading, setIsLoading] = useState(false);
  const productInformation = quickViewData?.productBasicDetails;
  const productId = productInformation?.znodeProductId
    ? Number(productInformation.znodeProductId)
    : productInformation?.publishProductId
    ? Number(productInformation.publishProductId)
    : 0;
  const getQuickViewInformation = async (queryParams: IQueryParams) => {
    const productInfo = await getQuickDetails(productId, queryParams);
    setQuickViewData(productInfo);
  };

  const getQueryParams = () => {
    const requiredParams = ["parentProductId", "codes", "values", "parentProductSKU", "sku", "selectedCodes", "selectedValues"];
    const queryParams: IQueryParams | null = requiredParams.every((param) => searchParams.get(param))
      ? {
          parentProductId: searchParams.get("parentProductId") || "",
          codes: searchParams.get("codes") || "",
          values: searchParams.get("values") || "",
          parentProductSKU: searchParams.get("parentProductSKU") || "",
          sku: searchParams.get("sku") || "",
          selectedCodes: searchParams.get("selectedCodes") || "",
          selectedValues: searchParams.get("selectedValues") || "",
        }
      : null;

    return queryParams;
  };

  useEffect(() => {
    const queryParams = getQueryParams();
    queryParams && getQuickViewInformation(queryParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchConfigurableProductData = async () => {
    setIsLoading(true);
    const fetchedProductData = (await getConfigProductDataForQuickView(quickViewVariant)) as IProductDetails;
    setQuickViewData({
      productBasicDetails: fetchedProductData as IProductDetails,
      configurableProducts: (fetchedProductData?.configurableData?.configurableAttributes as IConfigurableProduct[]) ?? [],
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (quickViewVariant?.parentProductId) {
      fetchConfigurableProductData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickViewVariant]);

  return (
    <div className="relative">
      {isLoading && <LoaderComponent isLoading={true} overlay={true} />}
      <ProductBasicInfo
        productData={quickViewData?.productBasicDetails as IProductDetails}
        isQuickView={true}
        configurableProducts={quickViewVariant?.parentProductId ? [] : quickViewData?.configurableProducts}
        closeQuickViewModal={() => {
          closeModal();
          setQuickViewVariant({} as IQuery);
        }}
      />
    </div>
  );
}

export default QuickViewDetails;
