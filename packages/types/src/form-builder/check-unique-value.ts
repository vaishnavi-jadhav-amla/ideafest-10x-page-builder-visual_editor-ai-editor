export interface ICheckUniqueRequest {
  formBuilderId: number;
  globalAttributeCodeValueList: {
    attributeCode: string;
    attributeValues: string;
  }[];
}

export interface ICheckUniqueResponse {
  attributeValues: {
    attributeName: string;
    isValueExist: boolean;
  }[];
}
