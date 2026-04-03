export interface IFormCodeListResponse {
  formCodeList?: IFormCodeItem[] | undefined;
  formCodeListPaginationDetail?: IFormCodePaginationDetail;
}

export interface IFormCodeItem {
  formCodeId?: number;
  formCode?: string;
  formName: string;
  formCodeDescription?: string | undefined;
}

export interface IFormCodePaginationDetail {
  pageIndex?: number | undefined;
  pageSize?: number | undefined;
  totalPages?: number | undefined;
  totalResults?: number | undefined;
}