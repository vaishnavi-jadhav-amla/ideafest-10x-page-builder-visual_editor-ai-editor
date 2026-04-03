"use client";

import { IFacetArray, IFacets } from "@znode/types/facet";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { FacetName } from "./FacetName";
import { SETTINGS } from "@znode/constants/settings";
import { ZIcons } from "../../common/icons";
import { useTranslations } from "next-intl";
import { generateQueryString, urlEncodeSpecialCharacters } from "@znode/utils/component";
import { FacetAttribute } from "./FacetAttribute";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGINATION } from "@znode/constants/pagination";
import { useProduct } from "../../../stores";

export function Facet({ facetData, ...rest }: Readonly<{ facetData: IFacets[]; pageSize?: number | null }>) {
  const { activeFacetData, setActiveFacetData, setIsProductLoading } = useProduct();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const facetTranslations = useTranslations("Facet");
  const [facetArray, setFacetArray] = useState<IFacetArray[]>([]);
  const [activeTab, setActiveTab] = useState<{ [key: string]: boolean }>({});
  const [showFilter, setShowFilter] = useState<boolean>(true);

  useEffect(() => {
    const activeTabList: { [key: string]: boolean } = {};
    facetData
      .filter((data) => data?.attributeValues?.length)
      .forEach((item: IFacets, i: number) => {
        activeTabList[item.attributeCode] = i === 0;
      });
    setActiveTab(activeTabList);
    if (window.innerWidth < 1024) {
      setShowFilter(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSessionDataInState = () => {
    const facetData = activeFacetData;

    const hasFacetGroup = searchParams?.get("facetGroup");
    setFacetArray(!hasFacetGroup ? [] : facetData || []);
  };

  useEffect(() => {
    setSessionDataInState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFacetData]);

  const updateQueryParams = (filterData: IFacetArray[]) => {
    const pageSize = rest?.pageSize?.toString() || PAGINATION.DEFAULT_PAGINATION;
    const sort = searchParams.get("sort");
    const createFilteredURL = (selectedAttributes: IFacetArray[]) => {
      const facetURL =
        selectedAttributes &&
        selectedAttributes?.map((selectedData: IFacetArray) => {
          const generateValues = (selectedAttributeCodes: string[]) => {
            if (selectedAttributeCodes?.length > 1) {
              const attributeValues = selectedAttributeCodes?.map((selectedCode: string) => selectedCode).join("~");
              return urlEncodeSpecialCharacters(attributeValues);
            } else {
              return urlEncodeSpecialCharacters(selectedAttributeCodes?.[0] || "");
            }
          };
          return `${selectedData.facet}|${generateValues(selectedData?.attributeCode)}`;
        });

      return facetURL;
    };
    const filterQueryData = createFilteredURL(filterData);
    filterQueryData?.length > 0 || pageSize || sort
      ? router.push(`${generateQueryString(pathName, searchParams, filterQueryData, "facet", pageSize)}`, { scroll: false })
      : router.push(`${pathName}`);
  };

  const updateFinalFacet = (incomingFacet: IFacetArray) => {
    let updatedFacet = [];
    const facetData = facetArray.filter((data) => data.facet !== incomingFacet.facet);
    if (incomingFacet?.attributeCode?.length === 0) updatedFacet = facetData;
    else updatedFacet = [...facetData, incomingFacet];
    const appliedFacetData = activeFacetData.find((data) => data.facet === incomingFacet.facet);
    const appliedFacetLength = appliedFacetData?.attributeCode?.length || 0;
    const incomingFacetLength = incomingFacet?.attributeCode?.length || 0;

    //product loading
    let loading = false;
    if (appliedFacetLength !== incomingFacetLength) loading = true;
    else if (appliedFacetData && appliedFacetLength === incomingFacetLength) loading = appliedFacetData.attributeCode.some((data) => !incomingFacet.attributeCode.includes(data));
    else loading = incomingFacetLength > 0;
    setIsProductLoading(loading, { [incomingFacet.facet]: loading });
    setFacetArray(updatedFacet);
    setActiveFacetData(updatedFacet);
    updateQueryParams(updatedFacet);
  };

  const renderFacetAttributes = (facet: IFacets) => {
    return <FacetAttribute key={facet.attributeCode} facet={facet} updateFinalFacet={updateFinalFacet} {...rest} />;
  };

  const renderFacet = (facetDetails: IFacets[]) => {
    return (
      facetDetails &&
      facetDetails?.map(
        (filtersData: IFacets) =>
          filtersData?.attributeValues.length !== 0 && (
            <div className="mb-4" data-test-selector={`div-${filtersData.attributeCode}`} key={filtersData?.attributeCode}>
              <FacetName filtersData={filtersData} activeTab={activeTab} setActiveTab={setActiveTab} />
              {activeTab[filtersData?.attributeCode] && renderFacetAttributes(filtersData)}
            </div>
          )
      )
    );
  };

  return (
    <>
      <div className="flex items-center justify-center mb-4 lg:mb-0">
        <Button
          type="secondary"
          size="small"
          className="p-2 mb-2 mt-3 lg:hidden xs:hover:bg-white xs:hover:text-textColor"
          dataTestSelector="sortFilterBtn"
          endIcon={
            <>
              <ZIcons name="chevron-up" className={showFilter ? "block" : "hidden"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgFacetArrowUp" />
              <ZIcons
                name="chevron-down"
                strokeWidth={"1.5px"}
                className={!showFilter ? "block" : "hidden"}
                color={`${SETTINGS.DEFAULT_ICONS_COLOR}`}
                data-test-selector="svgFacetArrowDown"
              />
            </>
          }
          onClick={() => setShowFilter((prev) => !prev)}
          ariaLabel="facet sort and filter button"
        >
          {facetTranslations("filter")}
        </Button>
      </div>
      {showFilter && facetData?.length > 0 && renderFacet(facetData)}
    </>
  );
}
