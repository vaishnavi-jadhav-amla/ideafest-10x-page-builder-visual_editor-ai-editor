"use client";

import { Dispatch, SetStateAction } from "react";

import { Heading } from "../../common/heading";
import { IFacets } from "@znode/types/facet";
import { SETTINGS } from "@znode/constants/settings";
import { Separator } from "../../common/separator";
import { ZIcons } from "../../common/icons";

interface IFacetName {
  filtersData: IFacets;
  activeTab: { [key: string]: boolean };
  setActiveTab: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
}

export function FacetName({ filtersData, activeTab, setActiveTab }: Readonly<IFacetName>) {
  const handleFacetAttributeClick = () => {
    setActiveTab({ ...activeTab, [filtersData.attributeCode]: !activeTab[filtersData.attributeCode] });
  };

  return (
    <>
      <div className="flex items-center justify-between cursor-pointer accordion-title" onClick={() => handleFacetAttributeClick()}>
        <Heading customClass="uppercase" name={filtersData?.attributeName} level="h2" dataTestSelector={`hdgFacet${filtersData?.attributeCode}`}></Heading>
        <div className="mr-2.5">
          {activeTab[filtersData.attributeCode] ? (
            <ZIcons name="minus" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector={"svgMinus"} />
          ) : (
            <ZIcons name="plus" strokeWidth={"3px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector={"svgPlus"} />
          )}
        </div>
      </div>
      <Separator customClass="mt-0" />
    </>
  );
}
