import { httpRequest } from "../base";

import { IFormCodeListResponse } from "@znode/types/form-builder/form-code-list";

export async function getFormCodeListAPI() {
  const response = await httpRequest<IFormCodeListResponse>({
    endpoint: "/api/form-builder/form-code-list",
  });
  return response;
}

export async function getFormCodeListPaginationAPI(pageIndex = 1, pageSize = 10, searchKey?: string, searchValue?: string, sortKey?: string, sortOrder?: string) {
  const response = await httpRequest<IFormCodeListResponse>({
    endpoint: "/api/form-builder/form-code-list",
    queryParams: {
      pageIndex: pageIndex,
      pageSize: pageSize,
      ...(searchKey && { searchKey: searchKey }),
      ...(searchValue && { searchValue: searchValue }),
      ...(sortKey && { sortKey: sortKey }),
      ...(sortOrder && { sortOrder: sortOrder }),
    },
  });
  return response;
}
