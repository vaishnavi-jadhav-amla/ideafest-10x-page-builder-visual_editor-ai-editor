import { httpRequest } from "../../base";

export const isOrderTemplateNameAlreadyExist = async (templateName: string): Promise<boolean> => {
  const isTemplateNameExist = await httpRequest<boolean>({
    endpoint: "/api/account/order-template/is-exist",
    method: "POST",
    body: { templateName: templateName },
  });
  return isTemplateNameExist;
};
