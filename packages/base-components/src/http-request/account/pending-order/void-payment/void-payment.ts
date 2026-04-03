import { httpRequest } from "../../../base";
import { IUpdateBillingDetailsResponseModel } from "@znode/types/payment";

export const voidPayment = async (props: { configurationSetCode: string; orderType: string; orderNumber: string }) => {
    const response = await httpRequest<IUpdateBillingDetailsResponseModel>({
        endpoint: "/api/account/pending-order/void-payment",
        method: "POST",
        body: props,
    });
    return response;
};