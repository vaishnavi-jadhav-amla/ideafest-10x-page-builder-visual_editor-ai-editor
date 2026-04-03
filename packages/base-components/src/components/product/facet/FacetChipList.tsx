"use client";

import { generateQueryString, urlEncodeSpecialCharacters, useTranslationMessages } from "@znode/utils/component";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FacetChipName } from "./FacetChipName";
import { IFacetArray } from "@znode/types/facet-chip-list";
import { useProduct } from "../../../stores";
import { CategoryFacetChip } from "./CategoryFacetChip";

export function FacetChipList() {
  const { activeFacetData, setActiveFacetData, setIsProductLoading, activeCategory } = useProduct();

  const facetChipListTranslations = useTranslationMessages("FacetChipList");
  const facetTranslations = useTranslationMessages("Facet");
  const [facetArray, setFacetArray] = useState<IFacetArray[]>([]);

  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const handleRemoveChips = (brandName: string, chipName: string) => {
    const data = [...facetArray];
    let updatedUrl = window?.location?.search?.split("&") || [];
    if (updatedUrl && updatedUrl.length > 1) {
      updatedUrl = updatedUrl.slice(1);
    }
    const index = data.findIndex((item: IFacetArray) => item.facet === brandName);
    if (index !== -1 && data.length > 0) {
      const brandIndex = data[index]?.attributeCode?.indexOf(chipName);
      if (brandIndex !== -1) {
        data[index].attributeCode.splice(brandIndex, 1);
        if (data[index].attributeCode.length === 0) {
          data.splice(index, 1);
        }

        setFacetArray(data);
        setActiveFacetData(data);
        setIsProductLoading(true, {});
        data?.length > 0
          ? router.push(`${generateQueryString(pathName, searchParams, createFilteredURL(data), "facet")}`, { scroll: false })
          : router.push(`${pathName}?${updatedUrl && updatedUrl.join("&")}`, { scroll: false });
      }
    }
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("categoryCode");
    params.delete("searchCategory");
    params.delete("activeCategory");
    params.delete("facetGroup");

    const newUrl = params.toString() ? `${pathName}?${params.toString()}` : pathName;
    setActiveFacetData([]);
    setIsProductLoading(true, {});
    router.replace(newUrl);
  };
  const createFilteredURL = (selectedAttributes: IFacetArray[]) => {
    const facetURL =
      selectedAttributes &&
      selectedAttributes?.map((selectedData: IFacetArray) => {
        const generateValues = (selectedAttributeCodes: string[]) => {
          if (selectedAttributeCodes?.length > 1) {
            const attributeValues = selectedAttributeCodes.map((selectedCode: string) => selectedCode).join("~");
            return urlEncodeSpecialCharacters(attributeValues);
          } else {
            return urlEncodeSpecialCharacters(selectedAttributeCodes[0] || "");
          }
        };
        return `${selectedData.facet}|${generateValues(selectedData?.attributeCode)}`;
      });

    return facetURL;
  };
  const setSessionDataInState = async () => {
    setFacetArray(activeFacetData);
  };

  useEffect(() => {
    setSessionDataInState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFacetData]);

  return (
    <div>
      {facetArray?.length > 0 || activeCategory ? (
        <div className="mb-3 ml-2 flex items-center justify-start">
          <span className="font-semibold pr-1 text-sm">{facetChipListTranslations("filterBy")} :</span>
          {activeCategory && <CategoryFacetChip activeCategory={activeCategory} />}

          <div className="flex items-center justify-start flex-wrap">
            {(facetArray || []).map((chips, index: number) => (
              <FacetChipName
                facetName={chips?.facetName || ""}
                facet={chips?.facet || ""}
                attributeCode={chips?.attributeCode || []}
                key={index}
                removeChip={handleRemoveChips}
                data-test-selector={`facetChip-${chips?.facet}`}
              />
            ))}
            <div className="text-linkColor capitalize text-sm ml-2 cursor-pointer underline" data-test-selector="divClearAllFacet" onClick={handleClearAll}>
              {facetTranslations("clearAll")}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

