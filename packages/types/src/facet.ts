import { Dispatch, SetStateAction } from "react";

export interface IAttributeValues {
  label: string;
  attributeValue: string;
  facetCount?: number | undefined;
}

export interface IFacets {
  attributeName: string;
  attributeCode: string;
  attributeValues: IAttributeValues[];
  controlTypeId?: number;
  displayOrder?: number;
  controlType?: string | undefined;
}

export interface IFacetArray {
  facet: string;
  facetName: string;
  attributeCode: string[];
}

export interface IFacetData {
  facetAttributeData: IAttributeValues;
  facetGroup: IFacets;
  facetArray: IFacetArray[];
  setFacetArray: Dispatch<SetStateAction<IFacetArray[]>>;
  checkedListArray: string[];
  setCheckedListArray: Dispatch<SetStateAction<string[]>>;
  pageSize?: number;
}

export interface ISearchCategoryDetails {
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  count: number;
}
export interface IUpdateCategory {
  categories: ISearchCategoryDetails[];
  parentCategories: ISearchCategoryDetails[];
  isProductInheritanceEnabled: boolean;
}
