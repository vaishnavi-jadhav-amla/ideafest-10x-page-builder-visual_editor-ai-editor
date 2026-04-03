import { IAddToCartApiResponse, IAddToCartRequestBody, IOrderDetailsProps, IOrderHistoryResponse, IOrderListRequest, IOrderListResponse, IValidationInventoryBody } from "@znode/types/account";

import { httpRequest } from "../../base";
import { objectToQueryString } from "@znode/utils/component";

export const getOrderType = async (params: IOrderListRequest): Promise<IOrderHistoryResponse> => {
  const { sortValue, pageIndex, pageSize, currentFilters = {}, orderType,accountId } = params;

  let queryString = Object.keys(sortValue).length > 0 ? `sortValue=${encodeURIComponent(JSON.stringify(sortValue))}` : "sortValue={}";

  queryString += `&orderType=${encodeURIComponent(orderType ?? "")}`;
  queryString += `&pageIndex=${pageIndex}`;
  queryString += `&pageSize=${pageSize}`;
  queryString += `&currentFilters=${encodeURIComponent(JSON.stringify(currentFilters))}`;
  queryString += `&accountId=${accountId||""}`;

  const listData = await fetch(`/api/account/order/order-type?${queryString}`, { cache: "no-store" });
  const response: IOrderListResponse = await listData.json();

  return response.data;
};

export const getOrderTypeDetails = async (props: IOrderDetailsProps) => {
  const queryString: string = objectToQueryString(props);
  const orderDetails = await fetch(`/api/account/order/order-type-details?${queryString}`, {
    cache: "no-store",
  });
  const response = await orderDetails.json();
  return response;
};

export const getPreviousPurchasesData = async (props: { filterDays: string; pageSize: number; pageIndex: number; search: string; sortValue: { [key: string]: string } }) => {
  const { sortValue, pageIndex, pageSize, search, filterDays } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&search=${search}`;
  sortQueryString += `&filterDays=${filterDays}`;

  const queryString = `${sortQueryString}`;
  const previousPurchasesList = await fetch(`/api/account/previous-purchases?${queryString}`, { cache: "no-store" });
  const response = await previousPurchasesList.json();
  return response;
};

export const validateProductInventory = async (requestBody: IValidationInventoryBody[]) => {
  const response = await httpRequest<{productId:string; isSuccess: boolean; message: string }[]>({
    endpoint: "/api/account/previous-purchases/check-inventory",
    body: requestBody,
  });
  return response;
};

export const addToCartPreviousPurchases = async (requestBody: IAddToCartRequestBody) => {
  const response = await httpRequest<IAddToCartApiResponse>({
    endpoint: "/api/account/previous-purchases/add-to-cart",
    body: requestBody,
  });
  return response;
};