import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterTuple, FormBuilders_formBuildersList } from "@znode/clients/v2";
import { IFormCodeListResponse } from "@znode/types/form-builder/form-code-list";
import { FilterOperators } from "@znode/utils/server";

export async function getFormCodeList(
  filter: Array<{ filterName: string; filterValue: string }> | undefined,
  sort: { [key: string]: string } | undefined,
  pageIndex: number | undefined,
  pageSize: number | undefined
): Promise<IFormCodeListResponse | null> {
  try {
    const filters: FilterTuple[] | undefined =
      filter?.map((i) => ({
        FilterName: i.filterName,
        FilterOperator: FilterOperators.Contains,
        FilterValue: i.filterValue,
      })) || undefined;

    const formBuildersListResponse = await FormBuilders_formBuildersList(filters, sort, pageIndex, pageSize);

    if (!formBuildersListResponse?.FormBuilderList) {
      const errorMessage: string =
        "ErrorMessage" in formBuildersListResponse && formBuildersListResponse?.ErrorMessage ? String(formBuildersListResponse?.ErrorMessage) : "Unexpected response structure.";

      logServer.error(AREA.FORM_BUILDER.FORM_CODE_LIST, errorMessage);
      return null;
    }

    const formBuilderList = formBuildersListResponse.FormBuilderList || [];
    const paginationDetail = formBuildersListResponse?.PaginationDetail;

    const formCodeList = formBuilderList.map((item) => ({
      formCodeId: item.FormBuilderId,
      formCode: item.FormCode,
      formCodeDescription: item.FormDescription,
      formName: item.FormName ?? "",
    }));

    const formCodeListResponse: IFormCodeListResponse = {
      formCodeList: formCodeList,
      formCodeListPaginationDetail: {
        pageIndex: paginationDetail?.PageIndex,
        pageSize: paginationDetail?.PageSize,
        totalPages: paginationDetail?.TotalPages,
        totalResults: paginationDetail?.TotalResults,
      },
    };

    return formCodeListResponse;
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.FORM_CODE_LIST, errorMessage);
    return null;
  }
}
