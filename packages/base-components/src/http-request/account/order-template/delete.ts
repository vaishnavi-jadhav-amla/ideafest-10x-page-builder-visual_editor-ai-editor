import { httpRequest } from "../../base";

export const deleteOrderTemplates = async (classNumber: string): Promise<boolean> => {
  const queryString = `classNumber=${encodeURIComponent(classNumber)}`;

  const deleteOrderTemplateResponse = await httpRequest<boolean>({
    endpoint: `/api/account/order-template/delete?${queryString}`,
    method: "DELETE",
  });

  return deleteOrderTemplateResponse;
};
