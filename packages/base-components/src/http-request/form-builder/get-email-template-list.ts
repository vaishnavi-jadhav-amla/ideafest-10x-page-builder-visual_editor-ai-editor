import { httpRequest } from "../base";

import { IEmailTemplateResponse } from "@znode/types/form-builder/email-template-list";

export async function getEmailTemplateListAPI(pageIndex = 1, pageSize = 10, searchKey?: string, searchValue?: string, sortKey?: string, sortOrder?: string) {
  const response = await httpRequest<IEmailTemplateResponse>({
    endpoint: "/api/form-builder/email-template-list",
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
