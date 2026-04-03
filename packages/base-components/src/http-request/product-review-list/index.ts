import { ICustomerReviewResponse } from "@znode/types/product";
import { httpRequest } from "../base";

export const getProductReviewList = async (props: { productId: string; pageNumber: number; pageSize: string | number; sortBy: string }) => {
  const { productId, pageNumber, pageSize, sortBy } = props;
  let reviewQueryString = `productId=${productId}`;
  reviewQueryString += `&pageSize=${pageSize}`;
  reviewQueryString += `&pageNumber=${pageNumber}`;
  reviewQueryString += `&sortBy=${sortBy}`;
  const queryString = `${reviewQueryString}`;
  const getForm: ICustomerReviewResponse = await httpRequest<ICustomerReviewResponse>({ endpoint: "/api/product-review-list?" + queryString });
  return getForm;
};
