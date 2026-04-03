import { Input } from "../../common/input";
import { IAttributeValues, IFacetArray } from "@znode/types/facet";
import { formatTestSelector } from "@znode/utils/common";
import { removeWhiteSpaces } from "@znode/utils/component";
import { Dispatch, SetStateAction } from "react";

export const FacetData = ({
  facetAttributeValue,
  selectedFaceData,
  setSelectedFacetData,
  updateFinalFacet,
}: // hasSingleAttribute,
{
  facetAttributeValue: IAttributeValues;
  selectedFaceData: IFacetArray;
  setSelectedFacetData: Dispatch<SetStateAction<IFacetArray>>;
  updateFinalFacet: (_data: IFacetArray) => void;
  // hasSingleAttribute: boolean;
}) => {
  const { attributeValue, facetCount, label } = facetAttributeValue;
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let data;
    if (e.target.checked) data = { ...selectedFaceData, attributeCode: [...selectedFaceData.attributeCode, attributeValue] };
    else {
      const clonedFacetData = structuredClone(selectedFaceData);
      clonedFacetData.attributeCode = clonedFacetData.attributeCode.filter((data) => data !== attributeValue);
      data = clonedFacetData;
    }
    setSelectedFacetData(data);
    // if (hasSingleAttribute) updateFinalFacet(data);
    updateFinalFacet(data);
  };
  return (
    <div className="flex justify-between mb-2" data-test-selector={`div-${selectedFaceData.facet + attributeValue}Container`} key={selectedFaceData.facet + attributeValue}>
      <div className="flex items-center ">
        <Input
          type="checkbox"
          onChange={handleOnChange}
          className="xs:w-4 h-4 accent-accentColor cursor-pointer"
          id={removeWhiteSpaces(selectedFaceData.facet + attributeValue)}
          checked={selectedFaceData.attributeCode.includes(attributeValue)}
          dataTestSelector={`chkFacetValue${attributeValue.split(" ").join("")}`}
          ariaLabel={`facet-${removeWhiteSpaces(attributeValue)}`}
        />
        <label
          className="cursor-pointer break-all pl-5"
          htmlFor={removeWhiteSpaces(selectedFaceData.facet + attributeValue)}
          data-test-selector={`lblFacetValue${attributeValue.split(" ").join("")}`}
        >
          {label}
        </label>
      </div>
      {typeof facetCount === "number" && (
        <div className="px-3 bg-gray-300 flex justify-center items-center cursor-default w-10 ml-1 rounded" data-test-selector={formatTestSelector("div", `FacetCount${attributeValue}`)}>
          {facetCount}
        </div>
      )}
    </div>
  );
};
