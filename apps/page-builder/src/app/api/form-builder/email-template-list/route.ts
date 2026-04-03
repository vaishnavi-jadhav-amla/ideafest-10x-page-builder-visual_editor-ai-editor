import { sendError, sendSuccess } from "@znode/utils/server";
import { getEmailTemplateList } from "@znode/agents/form-builder";
import { IEmailTemplateResponse } from "@znode/types/form-builder/email-template-list";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pageIndexVal = parseInt(url.searchParams.get("pageIndex") as string, 10);
    const pageSizeVal = parseInt(url.searchParams.get("pageSize") as string, 10);

    const searchKey = url.searchParams.get("searchKey");
    const searchValue = url.searchParams.get("searchValue");
    const sortKey = url.searchParams.get("sortKey") ?? "TemplateName";
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

    const data: IEmailTemplateResponse | null = await getEmailTemplateList(
      filter,
      sort,
      isNaN(pageIndexVal) ? undefined : pageIndexVal,
      isNaN(pageSizeVal) ? undefined : pageSizeVal
    );

    if (data !== null && "emailTemplates" in data && data?.emailTemplates) {
      return sendSuccess(data);
    }

    return sendError("Internal server error.", 500);
  } catch (error) {
    return sendError("Internal server error.", 500);
  }
}
