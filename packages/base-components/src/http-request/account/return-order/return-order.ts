import { IReturnOrderProductList } from "@znode/types/order";

export const getReturnOrderList = async (props: {
  pageSize: number;
  pageIndex: number;
  sortValue: { [key: string]: string };
  currentFilters?: { key: string; value: string; type: string; columns: { status: string; date: string } }[];
}) => {
  const { sortValue, pageIndex, pageSize, currentFilters } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&currentFilters=${JSON.stringify(currentFilters)}`;

  const queryString = `${sortQueryString}`;
  const returnOrderList = await fetch(`/api/account/return-order?${queryString}`, { cache: "no-store" });
  const response = await returnOrderList.json();
  return response;
};

export const getReturnOrderProductList = async (orderNumber: string): Promise<IReturnOrderProductList[]> => {
  const returnOrderList = await fetch(`/api/return-order/product-list?orderNumber=${orderNumber}`, { cache: "no-store" });
  const response = await returnOrderList.json();
  return response.data;
};
