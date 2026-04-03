import { objectToQueryString } from "@znode/utils/component";
import { IQuoteDetailsResponse } from "@znode/types/account/quote";
import { httpRequest } from "../../base";
import { IOrderDetailsProps } from "@znode/types/account";

export const quoteOrderDetails = async (props: IOrderDetailsProps) => {
  const queryString: string = objectToQueryString(props);
  const orderDetails = await httpRequest<IQuoteDetailsResponse>({ endpoint: `/api/account/quote/quote-details?${queryString}` });
  return orderDetails;
};
