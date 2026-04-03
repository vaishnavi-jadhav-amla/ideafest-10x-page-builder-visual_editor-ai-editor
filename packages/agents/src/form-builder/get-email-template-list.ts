import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterTuple } from "@znode/clients/v2";
import { EmailTemplate_emailTemplateList } from "@znode/clients/v2/form-builder/email-template";
import { IEmailTemplateResponse } from "@znode/types/form-builder/email-template-list";
import { FilterOperators } from "@znode/utils/server";

export async function getEmailTemplateList(
  filter: Array<{ filterName: string; filterValue: string }> | undefined,
  sort: { [key: string]: string } | undefined,
  pageIndex: number | undefined,
  pageSize: number | undefined
): Promise<IEmailTemplateResponse | null> {
  try {
        const filters: FilterTuple[] | undefined =
          filter?.map((i) => ({
            FilterName: i.filterName,
            FilterOperator: FilterOperators.Contains,
            FilterValue: i.filterValue,
          })) || undefined;

    const response = await EmailTemplate_emailTemplateList(filters, sort, pageIndex, pageSize);

    if (!response.EmailTemplates) {
      const errorMessage: string = "ErrorMessage" in response && response?.ErrorMessage ? String(response?.ErrorMessage) : "Unexpected response structure.";

      logServer.error(AREA.FORM_BUILDER.EMAIL_TEMPLATE_LIST, errorMessage);
      return null;
    }

    const emailTemplates = response.EmailTemplates || [];
    const paginationDetail = response?.PaginationDetail;

    const formattedEmailTemplates = emailTemplates.map((item) => ({
      emailTemplateId: item.EmailTemplateId,
      emailTemplateLocaleId: item.EmailTemplateLocaleId,
      templateName: item.TemplateName,
      descriptions: item.Descriptions,
      subject: item.Subject,
    }));

    const result = {
      emailTemplates: formattedEmailTemplates,
      paginationDetail: {
        pageIndex: paginationDetail?.PageIndex ?? 0,
        pageSize: paginationDetail?.PageSize ?? 0,
        totalPages: paginationDetail?.TotalPages ?? 0,
        totalResults: paginationDetail?.TotalResults ?? 0,
      },
    };

    return result as IEmailTemplateResponse;
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.EMAIL_TEMPLATE_LIST, errorMessage);
    return null;
  }
}
