import { useProduct } from "../../../stores";
import { IFacetArray, IFacets } from "@znode/types/facet";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useUpdateFacet = (initialFacetData: IFacets[]) => {
  const searchParams = useSearchParams();
  const hasSearchParams = searchParams.toString() !== "";
  const { setActiveFacetData ,setActiveCategory} = useProduct();

  useEffect(() => {
    const activeCategory= searchParams.get("activeCategory")||"";
    // contains list of grouped selected attributes like brand, highlight etc
    const facet: IFacetArray[] = [];
    if (hasSearchParams && initialFacetData.length) {
      const attributeMap: { [key: string]: string } = initialFacetData.reduce((acc, { attributeCode, attributeName }) => ({ ...acc, [attributeCode]: attributeName }), {});
      const facetGroup = searchParams.get("facetGroup");
      if (facetGroup) {
        facetGroup.split(",").forEach((attributeData: string) => {
          const [facetCode, facetValues] = attributeData.split("|");
          if (facetCode && facetValues) {
            const selectedValues = facetValues.split("~");

            const obj = {
              facet: facetCode,
              facetName: attributeMap[facetCode],
              attributeCode: selectedValues,
            };
            facet.push(obj);
          }
        });
      }
    }
    setActiveFacetData(facet);
    setActiveCategory(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFacetData]);

  return null;
};
