import { IReviewRequest } from "@znode/types/review";

export const sanitizeHTML = (htmlContent: string): string => {
  const sanitizedHTML = htmlContent ? htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "") : "";

  return sanitizedHTML;
};

export const sanitizeFields = (reviewModel: IReviewRequest) => {
  reviewModel.headline = sanitizeHTML(reviewModel.headline);
  reviewModel.comments = sanitizeHTML(reviewModel.comments);
  reviewModel.userName = sanitizeHTML(reviewModel.userName);
  reviewModel.userLocation = sanitizeHTML(reviewModel.userLocation);
};

export const validateField = (field: string, errorKey: string, translationFn: (_key: string) => string, fieldErrors: Record<string, string>) => {
  if (isEmptyOrWhitespace(field)) {
    fieldErrors[errorKey] = translationFn(errorKey);
  }
};

export const isEmptyOrWhitespace = (str: string): boolean => {
  return !str?.trim();
};
