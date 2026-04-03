import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../../../base";
import { IOrderDetails } from "@znode/types/account/order";

export const pendingOrderDetails = async (props: { orderType: string; orderNumber: string }) => {
  const queryString: string = objectToQueryString(props);
  const orderDetails = await httpRequest<IOrderDetails>({ endpoint: `/api/account/pending-order/order-details?${queryString}` });
  return orderDetails;
};
