import { TypeAheadEnum } from "./enums";

export interface ITypeAheadList {
  typeAheadList: ITypeAhead[];
}
export interface ITypeAhead {
  id: number;
  name: string;
  displayText: string;
}

export interface ITypeAheadRequest {
  searchTerm: string;
  type?: TypeAheadEnum;
  typeName?: string;
  mappingId?: number;
  pageSize?: number;
}