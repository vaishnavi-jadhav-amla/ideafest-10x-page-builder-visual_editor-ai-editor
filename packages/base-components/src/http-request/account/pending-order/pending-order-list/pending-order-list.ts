import { IListProps, IPendingOrderList } from "@znode/types/account/pending-order";
import { httpRequest } from "../../../base";

export const getPendingOrderHistory = async (props: IListProps): Promise<IPendingOrderList> => {
  const { sortValue, pageIndex, pageSize, currentFilters, status } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&currentFilters=${JSON.stringify(currentFilters)}`;
  if (status) sortQueryString += `&status=${status}`;
  const queryString = `${sortQueryString}`;
  const pendingOrderList = await httpRequest<IPendingOrderList>({ endpoint: `/api/account/pending-order/pending-order-list?${queryString}` });
  return pendingOrderList;
};
