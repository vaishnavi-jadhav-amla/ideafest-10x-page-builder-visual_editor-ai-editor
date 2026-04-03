import { IApplyDiscountRequest, IDiscountedDetailsResponseModel } from "@znode/types/cart";
import { httpRequest } from "../base";

export const applyDiscount = async (applyDiscountRequest: IApplyDiscountRequest): Promise<IDiscountedDetailsResponseModel> => {
  const response = await httpRequest<IDiscountedDetailsResponseModel>({ endpoint: "/api/apply-discount", method: "POST", body: applyDiscountRequest });
  return response;
};

export const removeDiscount = async (removeDiscountRequestModel: IApplyDiscountRequest): Promise<IDiscountedDetailsResponseModel> => {
  const response = await httpRequest<IDiscountedDetailsResponseModel>({ endpoint: "/api/remove-discount", method: "DELETE", body: removeDiscountRequestModel });
  return response;
};
