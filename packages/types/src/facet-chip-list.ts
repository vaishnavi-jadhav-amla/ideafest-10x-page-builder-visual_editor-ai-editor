/* eslint-disable no-unused-vars */
export interface IFacetChipNameProps {
  facet: string;
  facetName: string;
  attributeCode: string[];
  key?: number;
  removeChip: (chipsList: string, name: string) => void;
  filterBy?: string;
  firstFacetFlag?: boolean;
}

export interface IFacetArray {
  facet: string;
  facetName: string;
  attributeCode: string[];
}
