import { httpRequest } from "../../base";
import { IOrderTemplateListModel, IOrderTemplateList } from "@znode/types/account/order-templates";

export const getOrderTemplateList = async (props: IOrderTemplateListModel): Promise<IOrderTemplateList> => {
  const { classType, pageSize, pageIndex, sortValue, currentFilters } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&currentFilters=${JSON.stringify(currentFilters)}`;
  if (classType) sortQueryString += `&status=${classType}`;
  const queryString = `${sortQueryString}`;
  const orderTemplateList = await httpRequest<IOrderTemplateList>({ endpoint: `/api/account/order-template/list?${queryString}` });
  return orderTemplateList;
};
