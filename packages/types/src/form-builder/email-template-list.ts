export interface IEmailTemplateResponse {
  emailTemplates?: IEmailTemplateItem[] | undefined;
  paginationDetail?: IEmailTemplatePaginationDetail;
}

export interface IEmailTemplateItem {
  emailTemplateId?: number;
  emailTemplateLocaleId?: number;
  templateName?: string | undefined;
  descriptions?: string | undefined;
  subject?: string | undefined;
}

export interface IEmailTemplatePaginationDetail {
  pageIndex?: number | undefined;
  pageSize?: number | undefined;
  totalPages?: number | undefined;
  totalResults?: number | undefined;
}
