import { httpRequest } from "../../base";
import { ISavedCartListModel, ISavedCartList } from "@znode/types/account/saved-cart";

export const getSavedCartList = async (props: ISavedCartListModel): Promise<ISavedCartList> => {
  const { classType, pageSize, pageIndex, sortValue, currentFilters } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&currentFilters=${JSON.stringify(currentFilters)}`;
  if (classType) sortQueryString += `&status=${classType}`;
  const queryString = `${sortQueryString}`;
  const savedCartList = await httpRequest<ISavedCartList>({ endpoint: `/api/account/saved-cart/saved-cart-list?${queryString}` });
  return savedCartList;
};
