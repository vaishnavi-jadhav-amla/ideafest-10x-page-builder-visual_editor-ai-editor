import { PAYMENT_PLUGIN } from "@znode/constants/payment";
import { IPaymentPlugin } from "@znode/types/payment";


export function PaymentPlugin({ pluginScript, pluginName, clientToken, setInitiatePlaceOrderAction,
  setInitiateCancelAction, setErrorResponse, setClientResponse, setInitiateDeleteSavedCard, setIsSaveCreditCard, setIsSavedPayment, paymentRequest }: IPaymentPlugin) {
  const PaymentComponent = window.PaymentManager.default;
    return (
      <div>
        {PaymentComponent ? (
          <PaymentComponent
            pluginScript={pluginScript}
            pluginName={pluginName + PAYMENT_PLUGIN.PAYMENT_PLUGIN_SUFFIX}
            clientToken={clientToken}
            setInitiatePlaceOrderAction={setInitiatePlaceOrderAction}
            setInitiateCancelAction={setInitiateCancelAction}
            setErrorResponse={setErrorResponse}
            setClientResponse={setClientResponse}
            setInitiateDeleteSavedCard={setInitiateDeleteSavedCard}
            setIsSaveCreditCard={setIsSaveCreditCard}
            setIsSavedPayment={setIsSavedPayment}
            paymentRequest={paymentRequest}
          />
        ) : null}
      </div>
    );
}