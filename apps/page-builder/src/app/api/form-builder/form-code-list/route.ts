import { sendError, sendSuccess } from "@znode/utils/server";

import { getFormCodeList } from "@znode/agents/form-builder";
import { IFormCodeListResponse } from "@znode/types/form-builder/form-code-list";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pageIndexVal = parseInt(url.searchParams.get("pageIndex") as string, 10);
    const pageSizeVal = parseInt(url.searchParams.get("pageSize") as string, 10);
    const searchKey = url.searchParams.get("searchKey");
    const searchValue = url.searchParams.get("searchValue");
    const sortKey = url.searchParams.get("sortKey") ?? "FormName";
    const sortValue = url.searchParams.get("sortValue") ?? "asc";

    const filter =
      searchKey && searchValue
        ? [
            {
              filterName: searchKey || "",
              filterValue: searchValue || "",
            },
          ]
        : undefined;

    const sort: { [key: string]: string } | undefined = {
      [sortKey]: sortValue,
    };

    const data: IFormCodeListResponse | null = await getFormCodeList(filter, sort, isNaN(pageIndexVal) ? undefined : pageIndexVal, isNaN(pageSizeVal) ? undefined : pageSizeVal);

    if (data !== null && "formCodeList" in data && data?.formCodeList) {
      return sendSuccess(data, "form code list retrieved successfully");
    }

    return sendError("Internal server error.", 500);
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
