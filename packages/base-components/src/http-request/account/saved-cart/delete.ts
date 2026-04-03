import { httpRequest } from "../../base";

export const deleteSavedCart = async (classNumber: string): Promise<boolean> => {
  const queryString = `classNumber=${encodeURIComponent(classNumber)}`;

  const deleteSavedCartResponse = await httpRequest<boolean>({
    endpoint: `/api/account/saved-cart/delete?${queryString}`,
    method: "DELETE",
  });

  return deleteSavedCartResponse;
};
