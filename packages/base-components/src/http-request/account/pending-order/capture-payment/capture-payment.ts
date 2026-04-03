import { IUpdateBillingDetailsResponseModel } from "@znode/types/payment";
import { httpRequest } from "../../../base";

export const capturePayment = async (props: { configurationSetCode: string; orderType: string; orderNumber: string }) => {
    const response = await httpRequest<IUpdateBillingDetailsResponseModel>({
        endpoint: "/api/account/pending-order/capture-payment",
        method: "POST",
        body: props,
    });
    return response;
};