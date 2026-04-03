export interface ISearchFacetsResponse {
  attributeName: string;
  attributeCode: string;
  attributeValues: ISearchFacetsValueResponse[];
  displayOrder?: number;
}

export interface ISearchFacetsValueResponse {
  attributeValue: string;
  facetCount?: number;
  label: string;
  displayOrder?: number;
}

export interface IProductPricingDetailsResponse {
  currencySuffix?: string;
  currencyCode?: string;
  salesPrice?: number;
  retailPrice?: number;
  sku?: string;
}

export interface ITypeaheadHoveredValuesRef {
  hoveredSearchKeyword: string;
  hoveredValue: string | { attributeCode: string; attributeValue: string };
}
