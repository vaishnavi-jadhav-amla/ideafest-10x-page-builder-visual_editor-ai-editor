import { IAttributeValues, IFacetArray, IFacets } from "@znode/types/facet";
import { useEffect, useState } from "react";
import { FacetData } from "./FacetData";
import Button from "../../common/button/Button";
import { useProduct } from "../../../stores";
import { useTranslationMessages } from "@znode/utils/component";

export const FacetAttribute = ({ facet, updateFinalFacet }: { facet: IFacets; updateFinalFacet: (_data: IFacetArray) => void }) => {
  const facetTranslations = useTranslationMessages("Facet");
  const { activeFacetData } = useProduct();

  const [selectedFaceData, setSelectedFacetData] = useState<IFacetArray>({
    facet: facet.attributeCode,
    facetName: facet.attributeName,
    attributeCode: [],
  });

  const resetFilters = () => {
    const updatedFacetData = { ...selectedFaceData, attributeCode: [] };
    setSelectedFacetData(updatedFacetData);
    updateFinalFacet(updatedFacetData);
  };

  const setSessionDataInState = () => {
    const facetData = activeFacetData;
    const data = facetData.find((data: IFacetArray) => data.facet === selectedFaceData.facet);
    setSelectedFacetData({ ...selectedFaceData, attributeCode: data?.attributeCode || [] });
  };

  useEffect(() => {
    setSessionDataInState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFacetData]);

  return (
    <>
      <div className="custom-scroll max-h-56 overflow-hidden hover:overflow-auto">
        {facet.attributeValues.map((data: IAttributeValues, i: number) => {
          return (
            <FacetData
              key={`${facet.attributeCode + data.attributeValue + i}`}
              data-test-selector={`facetData-${facet.attributeCode + data.attributeValue + i}`}
              facetAttributeValue={data}
              selectedFaceData={selectedFaceData}
              setSelectedFacetData={setSelectedFacetData}
              updateFinalFacet={updateFinalFacet}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-end flex-wrap gap-2 mt-4">
        <Button type="text" size="small" className="text-linkColor underline" dataTestSelector={`btn-${facet.attributeCode}`} onClick={resetFilters}>
          {facetTranslations("clear")}
        </Button>
      </div>
    </>
  );
};
