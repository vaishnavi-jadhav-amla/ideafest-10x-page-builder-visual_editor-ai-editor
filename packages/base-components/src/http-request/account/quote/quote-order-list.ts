import { IQuoteHistoryProps, IQuoteResponse } from "@znode/types/account";

import { httpRequest } from "../../base";

export const getQuoteList = async (props: IQuoteHistoryProps): Promise<IQuoteResponse> => {
  const { sortValue, pageIndex, pageSize, currentFilters, status,accountId } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&currentFilters=${JSON.stringify(currentFilters)}`;
  sortQueryString += `&accountId=${accountId||""}`;

  if (status) sortQueryString += `&status=${status}`;
  const queryString = `${sortQueryString}`;
  const quoteHistoryData = await httpRequest<IQuoteResponse>({
    endpoint: `/api/account/quote/quote-order-list?${queryString}`,
  });
  return quoteHistoryData;
};
