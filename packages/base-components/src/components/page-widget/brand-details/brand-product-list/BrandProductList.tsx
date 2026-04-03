"use client";

import { useEffect, useState } from "react";

import { CompareProductList } from "../../../../components/product";
import { DynamicPagination } from "../../../common/pagination";
import { FacetList } from "../../../product/facet";
import { IProductList } from "@znode/types/product";
import { IWidget } from "@znode/types/widget";
import { LoadingSpinnerComponent } from "../../../common/icons";
import { NoRecordFound } from "../../../common/no-record-found/NoRecordFound";
import { ProductViews } from "../../../product/product-list/product-views";
import { getBrandProductsData } from "../../../../http-request/brand";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function BrandProductList(props: Omit<IWidget, "portalId" | "localeId">) {
  const commonTranslations = useTranslations("Common");
  const [brandProductData, setBrandProductData] = useState<IProductList>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnableCompare, setIsEnableCompare] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const facetGroup = searchParams?.get("facetGroup");
  const search = searchParams?.get("fromSearch") === "true";
  const sortData = searchParams?.get("sort");
  const pageNumber = searchParams?.get("pageNumber");
  const pageSizeData = searchParams?.get("pageSize");

  const brandSearchParam = {
    facetGroup: facetGroup,
    fromSearch: search,
    sort: sortData,
    pageNumber: pageNumber,
    pageSize: pageSizeData,
  };

  const fetchBrandProductsData = async () => {
    setIsLoading(true);
    try {
      const brandProductList = await getBrandProductsData(props, brandSearchParam);
      const brandProducts = brandProductList.data;
      setBrandProductData(brandProducts);
      setIsEnableCompare(brandProducts.isEnableCompare);
    } catch (error) {
      setBrandProductData({ totalProducts: 0, productList: [], searchProfileId: 0, totalCmsPages: 0, pageNumber: 0, pageSize: 0 });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandProductsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <>
      {isLoading && <LoadingSpinnerComponent />}
      <div className="flex justify-center">
        {!isLoading && brandProductData && brandProductData.totalProducts === 0 && <NoRecordFound text={commonTranslations("noRecordsFound")} data-test-selector="divNoRecord" />}
      </div>
      {!isLoading && brandProductData && brandProductData.totalProducts > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-4 mb-3 lg:col-span-1 lg:mb-0">
            <FacetList facetData={brandProductData.facetData || []} facetTerm={{ brandCode: props.brandCode }} pageSize={brandProductData?.pageSize} />
            {isEnableCompare && <CompareProductList />}
          </div>

          <div className="col-span-4">
            <ProductViews productData={brandProductData} isEnableCompare={isEnableCompare} {...props} />
            <DynamicPagination
              totalProducts={brandProductData.totalProducts}
              pageList={brandProductData?.pageList || []}
              pageSize={brandProductData?.pageSize}
              isProductsPagination={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
