/* eslint-disable max-lines-per-function */
import { DISCOUNT_TYPE, STATUSCODE } from "@znode/constants/checkout";
import { IAdditionalInstruction, IConvertToOrder, IConvertedToOrderResponse, IPaymentOptionsProps, ISubmitOrder, ISubmitPaymentModel } from "@znode/types/checkout";
import { ICardDetails, IPaymentAddress, IPaymentConfigurationSetDetails, IPaymentOption, IPaymentPluginRequest, IPluginErrorResponse, ISavedCardDetailsResponse } from "@znode/types/payment";
import { ORDER, ORDER_DATA_TYPE, ORDER_RECEIPT, TARGET_ORDER_DATA_TYPE } from "@znode/constants/order";
import { PAYMENT_PLUGIN, PAYMENT_STATUS, PAYMENT_SUBTYPE, PAYMENT_SETTING } from "@znode/constants/payment";
import { PENDING_APPROVAL_STATUS } from "@znode/constants/pending-order";
import { getSavedUserSession } from "@znode/utils/common";
import {
  clientToken,
  create,
  deleteSavedCreditCard,
  generateFinalizeNumber,
  getAddressDetailsById,
  getCartNumber,
  getPaymentConfigurationsByCode,
  processOrder,
  savedCardDetails,
  updateOfflinePayments,
} from "../../../../http-request";
import { copyOrderDetails, getCartSummary, updateOrderStatus } from "../../../../http-request";
import { deleteCookie, getCookie, getGuestUserDetails, removeLocalStorageData, setCookie, useTranslationMessages } from "@znode/utils/component";
import { useCheckout, useModal, usePayment, useToast, useUser } from "../../../../stores";
import { useEffect, useState } from "react";

import { ADDRESS } from "@znode/constants/address";
import Button from "../../../common/button/Button";
import { CART_COOKIE } from "@znode/constants/cookie";
import { Heading } from "../../../common/heading";
import { IBaseResponse } from "@znode/types/response";
import { IPaymentDetails } from "@znode/types/payment";
import { ICostDetails, IUpdateOrderPayment } from "@znode/types/order";
import Input from "../../../common/input/Input";
import { LoaderComponent } from "../../../common/loader-component";
import { Modal } from "../../../common/modal";
import { PaymentPlugin } from "../payment-plugin/PaymentPlugin";
import Promo from "../../../common/promotions/Promo";
import PurchaseOrder from "../payment-internal/PurchaseOrder";
import { QUOTE_STATUS } from "@znode/constants/quote";
import { checkStoreApprovalSettings } from "../../../../http-request";
import { errorStack } from "@znode/logger/server";
//TO: DO : Warlords - Remove this and use hook
import { getSavedUserSessionCallForClient } from "@znode/utils/common";
import { logClient } from "@znode/logger";
import { mapPaymentAddress, mapSavedCreditCardDetails } from "@znode/agents/order/order-helper";
import { useProduct } from "../../../../stores";
import { useRouter } from "next/navigation";
import { userActivityLog } from "../../../../http-request/user-activity-log/user-activity-log";
import { USER_ACTIVITY_EVENT } from "@znode/constants/user-activity-event";

export function PaymentOptions({
  paymentOptions,
  total,
  jobName,
  additionalInstruction,
  setPaymentProcessing,
  setIsDisabled,
  isFromQuote = false,
  quoteNumber,
  currencyCode,
  setIsPaymentSelected,
  isOfflinePayment,
  isOABFlagOn,
  approvalType,
  enableApprovalRouting,
  approvalSetting,
  isApprovalPaymentStatus,
  setIsBillingAddressOptional,
  voucherAmount,
  orderLimit,
  generalSetting
}: IPaymentOptionsProps) {
  const [configurationSet, setConfigurationSet] = useState<IPaymentConfigurationSetDetails>();
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<IPaymentOption>();
  const [initiatePlaceOrderAction, setInitiatePlaceOrderAction] = useState<boolean>(false);
  const [errorResponse, setErrorResponse] = useState<IPluginErrorResponse>({} as IPluginErrorResponse);
  const [initiateCancelAction, setInitiateCancelAction] = useState<boolean>(false);
  const [loadPluginUI, setLoadPluginUI] = useState<boolean>(false);
  const [showPayAndSubmit, setShowPayAndSubmit] = useState<boolean>(false);
  const [orderTotal, setOrderTotal] = useState<number>();
  const [paymentClientToken, setPaymentClientToken] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<IPaymentPluginRequest>({} as IPaymentPluginRequest);
  const [isDisabledConvertQuote, setIsDisabledConvertQuote] = useState<boolean>(false);
  const [isPaymentOptionSelected, setIsPaymentOptionSelected] = useState<boolean>(false);
  //TODO - Warlords - Payment plugin do not have fixed response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentClientResponse, setPaymentClientResponse] = useState<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initiateDeleteSavedCard, setInitiateDeleteSavedCard] = useState<any>();
  const [isSaveCreditCard, setIsSaveCreditCard] = useState<boolean>(false);
  const [isSavedPayment, setIsSavedPayment] = useState<boolean>(false);
  const [isDeletingCard, setIsDeletingCard] = useState<boolean>(false);
  const paymentTranslations = useTranslationMessages("Payment");
  const checkoutTranslations = useTranslationMessages("Checkout");
  const { shippingOptionId, billingAddressId, shippingAddressId, shippingConstraintCode, setBillingAddressId, setShippingAddressId } = useCheckout();
  const { user, loadUser } = useUser();
  const { openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const { error, success, isActiveToast } = useToast();
  const router = useRouter();
  const { payment, setPaymentDetails } = usePayment();
  const { updateCartCount } = useProduct();

  useEffect(() => {
    if (!user?.userId) loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  useEffect(() => {
    if (initiatePlaceOrderAction) setPaymentProcessing(true);
    if (!initiateCancelAction && paymentClientResponse && isOfflinePayment && payment.invoiceOrderNumber) createOnlinePayment(payment.invoiceOrderNumber, total);
    if (!initiateCancelAction && paymentClientResponse && !isOfflinePayment && !isFromQuote) createOnlinePaymentOrder();
    if (!initiateCancelAction && paymentClientResponse && isFromQuote) submitOrder();
    if (initiateCancelAction) {
      closeModal();
      setLoading(false);
      setPaymentProcessing(false);
      setInitiatePlaceOrderAction(false);
      setPaymentClientResponse(null);
      setInitiateCancelAction(false);
    }
    if (errorResponse.hasError) closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initiatePlaceOrderAction, paymentClientResponse, initiateCancelAction, errorResponse]);

  useEffect(() =>{
    if(initiateDeleteSavedCard) deleteSavedCard(initiateDeleteSavedCard?.paymentToken?.paymentToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initiateDeleteSavedCard]);

  useEffect(() => {
    return () => setPaymentDetails(null, null, null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const createOrder = async (paymentRequestModel: IUpdateOrderPayment) => {
    const cartNumber = await getCartNumber();
    let orderResponse;
    const requestBody = {
      shippingAddressId: shippingAddressId,
      billingAddressId: billingAddressId,
      shippingOptionId: shippingOptionId,
      shippingConstraintCode: shippingConstraintCode,
      jobName: jobName,
      additionalInstruction: additionalInstruction,
      total: orderTotal,
      cartNumber: cartNumber,
      paymentDetails: {
        configurationSetCode: configurationSet?.configurationSetCode,
        isCapture: configurationSet?.isCapture,
        paymentSubTypeCode: paymentRequestModel?.paymentDetails?.paymentSubTypeCode,
        paymentName: configurationSet?.configurationSetDisplayName,
        paymentTransactionToken: paymentRequestModel?.paymentDetails?.paymentTransactionToken,
        externalTransactionId: paymentRequestModel?.paymentDetails?.externalTransactionId,
        paymentStatusCode: paymentRequestModel?.paymentDetails?.paymentStatusCode,
        creditCardVerification: configurationSet?.creditCardVerification
      } as IPaymentDetails,
    };
    if (cartNumber) {
      orderResponse = await placeOrderResponse(requestBody as ISubmitOrder);
    }
    return orderResponse;
  };

  const getFinalizedOrderNumber = async (cartNumber: string) => {
    const finalizeNumber = await generateFinalizeNumber(cartNumber);
    return finalizeNumber?.finalClassNumber ?? null;
  };

  const deleteSavedCard = async (paymentMethodToken: string) => {
    try{
      setIsDeletingCard(true);
      const customerGuid = user?.aspNetUserId ?? "";
      const deleteCardResponse  = await deleteSavedCreditCard({ customerGuid: customerGuid, configurationSetCode: configurationSet?.configurationSetCode ?? "", paymentMethodToken: paymentMethodToken });      
      if(deleteCardResponse?.isSuccess){
        setInitiateDeleteSavedCard("");
        //to reset payment request.
        const savedPaymentDetails = await savedCardDetails({ configurationSetCode: configurationSet?.configurationSetCode ?? "", customerGuid: user?.aspNetUserId ?? "" });      
        const mapped = await mapSavedCreditCardDetails(savedPaymentDetails);
        setPaymentRequest(prev => ({
          ...prev,
          savedPaymentMethods: mapped
        }));
        setIsDeletingCard(false);
        success(paymentTranslations("paymentDeletedSuccessfully"));
      } 
      else{
        setIsDeletingCard(false);
        setInitiateDeleteSavedCard("");
        error(paymentTranslations("errorFailedToDeleteCard"));
      } 
    }
    catch(error){
      setIsDeletingCard(false);
      logClient.error("Error in method - createOnlinePayment " + errorStack(error));
      setInitiateDeleteSavedCard("");
    }
  };

  const placeOrderResponse = async (submitOrderModel: ISubmitOrder) => {
    //TO: DO : Warlords- Remove this and use hook
    const userModel = await getSavedUserSessionCallForClient();
    let userId = userModel?.userId;
    if (!userId) {
      const cartNumber = await getCartNumber();
      const guestUserDetails = await getGuestUserDetails(cartNumber);
      userId = guestUserDetails?.guestUserId;
    }
    const additionalInstruction: IAdditionalInstruction = {
      name: submitOrderModel.jobName ?? "",
      information: submitOrderModel.additionalInstruction ?? "",
    };
    const convertToOrderRequestModel: IConvertToOrder = {
      userId: userId ?? 0,
      orderStateId: 0,
      statusCode: STATUSCODE.IN_PROGRESS,
      accountCode: "",
      additionalInstruction: additionalInstruction ?? "",
    };
    convertToOrderRequestModel.paymentDetails = submitOrderModel.paymentDetails;
    if (requiresApproval) {
      convertToOrderRequestModel.targetClassType = ORDER_DATA_TYPE.APPROVAL_ROUTING;
    }
    const orderResponse: IConvertedToOrderResponse = await processOrder(convertToOrderRequestModel, String(submitOrderModel.cartNumber), ORDER_DATA_TYPE.ORDER);
    return orderResponse;
  };

  const createOnlinePaymentOrder = async () => {
    closeModal();
    setPaymentProcessing(true);

    if (!isOfflinePayment) {
      const cartNumber = await getCartNumber();
      const finalClassNumber = await getFinalizedOrderNumber(cartNumber);

      if (finalClassNumber && finalClassNumber !== "") {
        const paymentResponse = await createOnlinePayment(String(finalClassNumber), orderTotal ?? 0);

        if (paymentResponse && paymentResponse?.paymentDetails?.paymentTransactionToken) {
          const order = await createOrder(paymentResponse);
          const userModel = await getSavedUserSessionCallForClient();
          let userId = userModel?.userId;
          if (!userId) {
            const guestUserDetails = await getGuestUserDetails(cartNumber);
            userId = guestUserDetails?.guestUserId;
          }

          if (order?.isSuccess) {
            removeLocalStorageData(ADDRESS.ONETIME_ADDRESS_IDS);
            setPaymentProcessing(false);
            deleteCookie(CART_COOKIE.CART_NUMBER);
            deleteCookie(CART_COOKIE.CART_ID);
            updateCartCount(0);
            if (requiresApproval) {
              setCookie(ORDER.USER_PENDING_ORDER_RECEIPT_ORDER_ID, String(order?.orderNumber));
              success(checkoutTranslations("successPlacedOrderForApproval"));
              router.push("/pending-order/receipt");
            }
            else {
              userActivityLog({
                eventName: USER_ACTIVITY_EVENT.ORDER_PLACED,
                orderId: order?.orderNumber,
                orderTotal: total,
                currency: currencyCode,
                ...(!userModel?.userId && { userData: { userId } }),
              });
              setCookie(ORDER.USER_ORDER_RECEIPT_ORDER_ID, String(order?.orderNumber));
              success(checkoutTranslations("placeOrderSuccessfully"));
              router.push("/order/receipt");
            }
          } else if (order?.status) {
            error(checkoutTranslations("paymentRefundToMessage"));
            router.push("/checkout");
            resetPaymentErrorState();
          } 
          else if(!order?.isSuccess && isSaveCreditCard){
            await deleteSavedCreditCard({ customerGuid: user?.aspNetUserId ?? "", configurationSetCode: configurationSet?.configurationSetCode ?? "", paymentMethodToken: paymentClientResponse?.paymentToken }); 
            error(checkoutTranslations("errorFailedToCreate"));
            resetPaymentErrorState();
          }
          else {
            error(checkoutTranslations("errorFailedToCreate"));
            resetPaymentErrorState();
          }
        } else if (paymentResponse?.isDeclined === true) {
          resetPaymentErrorState();
          error(checkoutTranslations("paymentDeclined"));
        }
        else if (paymentResponse?.isPaymentVerified === false) {
          resetPaymentErrorState();
          error(checkoutTranslations("paymentVerificationFailed"));
        }
        else if (paymentResponse?.isPaymentAuthorized === false || paymentResponse?.isPaymentCaptured === false) {
          resetPaymentErrorState();
          error(checkoutTranslations("paymentFailed"));
        } else {
          error(checkoutTranslations("errorFailedToCreate"));
          resetPaymentErrorState();
        }
      } else {
        error(checkoutTranslations("errorFailedToCreate"));
        resetPaymentErrorState();
      }
    }
  };

  const resetPaymentErrorState = () => {
  setLoading(false);
  setInitiatePlaceOrderAction(false);
  setPaymentClientResponse(null);
  setPaymentProcessing(false);
};

  const createOnlinePayment = async (orderNumber: string, total: number) => {
    try {
      if (isOfflinePayment) closeModal();
      setPaymentProcessing(true);
      setLoading(true);
      let cardDetails = {};
      if (configurationSet?.pluginName && configurationSet?.pluginName?.toLowerCase() !== PAYMENT_PLUGIN.SPREEDLY.toLowerCase()) {
        cardDetails = {
          cardExpirationMonth: Number(paymentClientResponse?.cardDetails?.cardExpirationMonth),
          cardExpirationYear: Number(paymentClientResponse?.cardDetails?.cardExpirationYear),
          cardLastFourDigit: paymentClientResponse?.cardDetails?.cardLastFourDigit,
          cardHolderFirstName: paymentClientResponse?.cardDetails?.cardHolderFirstName,
        } as ICardDetails;
      }

      if (requiresApproval === true && configurationSet && configurationSet.creditCardVerification) {
        if (configurationSet.creditCardVerification.toLowerCase() === PAYMENT_SETTING.AUTHORIZE_AND_CAPTURE.toLowerCase()) {
          configurationSet.creditCardVerification = PAYMENT_SETTING.AUTHORIZE_ONLY;
        }
        else if (configurationSet.creditCardVerification.toLowerCase() === PAYMENT_SETTING.VERIFY_AUTHORIZE_AND_CAPTURE.toLowerCase()) {
          configurationSet.creditCardVerification = PAYMENT_SETTING.VERIFY_AND_AUTHORIZE;
        }
      }

      const submitPaymentModel = {
        paymentSubTypeCode: configurationSet?.subType ?? "",
        configurationSetCode: configurationSet?.configurationSetCode ?? "",
        cardDetails: cardDetails,
        isCapture: requiresApproval ? false : configurationSet?.isCapture ?? false,
        isSaveCreditCard: isSaveCreditCard,
        paymentPluginName: configurationSet?.pluginName ?? "",
        orderNumber: orderNumber,
        total: total,
        isOfflinePayment: isOfflinePayment,
        billingAddress: paymentRequest.billingAddress,
        creditCardVerification: configurationSet?.creditCardVerification ?? "",
        customerGuid: user?.aspNetUserId,
        isSavedPaymentMethod: isSavedPayment
      } as ISubmitPaymentModel;
      if (submitPaymentModel?.paymentSubTypeCode?.toLowerCase() === PAYMENT_SUBTYPE.CREDIT_CARD.toLowerCase())
        submitPaymentModel.paymentMethodToken = paymentClientResponse?.paymentToken ?? "";
      else if (submitPaymentModel?.paymentSubTypeCode?.toLowerCase() === PAYMENT_SUBTYPE.ACH.toLowerCase())
        submitPaymentModel.paymentDetailsToken = paymentClientResponse?.paymentToken ?? "";
      const paymentRequestModel = await create(submitPaymentModel);
      if (paymentRequestModel?.paymentDetails?.paymentStatusCode === PAYMENT_STATUS.DECLINED && isOfflinePayment) {
        resetPaymentErrorState();
        error(paymentTranslations("errorFailedPayment"));
        return paymentRequestModel;
      } else if (paymentRequestModel?.paymentDetails?.paymentTransactionToken && isOfflinePayment) {
        paymentRequestModel.paymentDetails.configurationSetCode = configurationSet?.configurationSetCode ?? "";
        paymentRequestModel.costDetails = { paidAmount: total } as ICostDetails;
        paymentRequestModel.paymentDetails.paymentStatusCode = PAYMENT_STATUS.PENDING;
      }
      let offlinePayments;
      if (paymentRequestModel != null && paymentRequestModel?.paymentDetails?.paymentTransactionToken !=null && isOfflinePayment) {
        offlinePayments = await updateOfflinePayments(paymentRequestModel);
        if (offlinePayments?.isSuccess) {
          success(paymentTranslations("thanksForPayment"));
          setPaymentProcessing(false);
          setLoading(false);
          window.location.href = `/account/order/details/${orderNumber}?receiptModule=true&isOfflinePayment=true`;
          return paymentRequestModel;
        } else {
          resetPaymentErrorState();
          error(paymentTranslations("errorFailedPayment"));
          return paymentRequestModel;
        }
      } 
      else if (!isOfflinePayment) return paymentRequestModel;
      else{
        resetPaymentErrorState();
        error(paymentTranslations("errorFailedPayment"));
        return paymentRequestModel;
      }
    } catch (error) {
      logClient.error("Error in method - createOnlinePayment " + errorStack(error));
      resetPaymentErrorState();
    }
  };

  useEffect(() => {
    if (document) {
      //Exposing PM_URI
      const script = document.createElement("script");
      script.src = String(process.env.NEXT_PUBLIC_PAYMENT_MANAGER_URL);
      script.async = true;
      document.head.append(script);
      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);
  const getConfigurationSet = async (configurationSetCode: string) => {
    const configurationSet: IPaymentConfigurationSetDetails = await getPaymentConfigurationsByCode({ configurationSetCode: configurationSetCode });
    return configurationSet;
  };
  const createPaymentRequest = async () => {
    if (!isOfflinePayment) {
      const cartNumber = await getCartNumber();
      const cartSummaryData = await getCartSummary(cartNumber);
      setOrderTotal(
        cartSummaryData.total && voucherAmount && voucherAmount > 0 && cartSummaryData.total !== voucherAmount ? cartSummaryData.total - voucherAmount : cartSummaryData.total
      );
    }
    let userId = user?.userId ?? 0;
    let isRegisteredUser = userId > 0;
    const shippingAddress = {} as IPaymentAddress;
    let billingAddress = {} as IPaymentAddress;
    if (!userId) {
      const cartNumber = await getCartNumber();
      const guestUserDetails = await getGuestUserDetails(cartNumber);
      userId = guestUserDetails?.guestUserId ?? 0;
      isRegisteredUser = false;
      setBillingAddressId(guestUserDetails?.billingAddressId ?? 0);
      setShippingAddressId(guestUserDetails?.shippingAddressId ?? 0);
      billingAddress = await mapPaymentAddress(guestUserDetails?.billingAddress ?? {});
    }
    let savedPaymentDetails = {} as ISavedCardDetailsResponse;
    if(!isFromQuote && !isOfflinePayment)
      savedPaymentDetails = await savedCardDetails({ configurationSetCode: configurationSet?.configurationSetCode ?? "", customerGuid: user?.aspNetUserId ?? "" });      

    const paymentRequest = {
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      isGuestUser: isRegisteredUser ? false : true,
      paymentMethodType: configurationSet?.subType,
      total: isOfflinePayment ? String(total) : orderTotal,
      isSavedPaymentMethod: isSavedPayment,
      savedPaymentMethods: await mapSavedCreditCardDetails(savedPaymentDetails),
    } as IPaymentPluginRequest;
    await setAddressDetailsForPayment(paymentRequest);
    return paymentRequest;
  };

  const handlePayAndSubmit = async () => {
    setLoading(true);
    if (configurationSet) {
      const paymentRequest = await createPaymentRequest();
      if (paymentRequest.paymentMethodType.toLowerCase() === PAYMENT_SUBTYPE.CREDIT_CARD.toLowerCase()) {
        const clientTokenResponse = await clientToken({ configurationSetCode: configurationSet.configurationSetCode, customerGuid: "" });
        setPaymentClientToken(clientTokenResponse.paymentGatewayToken);
      }
      setPaymentRequest(paymentRequest);
      setLoadPluginUI(true);
      setLoading(false);
      openModal(configurationSet?.pluginName);
    }
  };

  const handleInputChange = async (paymentOption: IPaymentOption) => {
    setIsDisabled && setIsDisabled(true);
    setIsDisabledConvertQuote && setIsDisabledConvertQuote(true);
    setLoadPluginUI(false);
    setSelectedPaymentOption(paymentOption);
    if (paymentOption.paymentCode) {
      const configurationSet = await getConfigurationSet(paymentOption.paymentCode);
      setIsBillingAddressOptional && setIsBillingAddressOptional(configurationSet?.isBillingAddressOptional ?? false);
      if (!isFromQuote && isOABFlagOn) {
        isOABFlagOn(configurationSet.isOAB || false);
      }
      if (!shippingOptionId && !isFromQuote && !isOfflinePayment) {
        setShowPayAndSubmit(false);
        setPaymentDetails(null, null, null, false);
        setSelectedPaymentOption({} as IPaymentOption);
        setConfigurationSet({} as IPaymentConfigurationSetDetails);
        setIsPaymentSelected && setIsPaymentSelected(false);
        setIsPaymentOptionSelected && setIsPaymentOptionSelected(false);
        if (!isActiveToast("selectShippingOption")) error(checkoutTranslations("selectShippingOption"), { toastId: "selectShippingOption" });
        return;
      }
      setConfigurationSet(configurationSet);
      setIsPaymentSelected && setIsPaymentSelected(true);
      setIsPaymentOptionSelected && setIsPaymentOptionSelected(true);
      const session = await getSavedUserSession();
      if (enableApprovalRouting && approvalType === PENDING_APPROVAL_STATUS.PAYMENT && session) {
        const isApprovalFlagOn = await checkStoreApprovalSettings({ paymentCode: paymentOption.paymentCode });
        if (!isFromQuote && isApprovalPaymentStatus) {
          isApprovalPaymentStatus(isApprovalFlagOn);
        }
      }
      setPaymentDetails(configurationSet.subType, configurationSet.configurationSetCode, configurationSet.configurationSetDisplayName, isOfflinePayment);
      if (
        (isOfflinePayment && configurationSet) ||
        (isFromQuote &&
          configurationSet &&
          configurationSet.subType.toLowerCase() !== PAYMENT_SUBTYPE.CHARGE_ON_DELIVERY.toLowerCase() &&
          configurationSet.subType.toLowerCase() !== PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() &&
          configurationSet.subType.toLowerCase() !== PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase())
      ) {
        const paymentRequest = await createPaymentRequest();
        const savedPaymentDetails = await savedCardDetails({ configurationSetCode: configurationSet?.configurationSetCode ?? "", customerGuid: user?.aspNetUserId ?? "" });      
        paymentRequest.savedPaymentMethods = await mapSavedCreditCardDetails(savedPaymentDetails);
        if (configurationSet.subType.toLowerCase() === PAYMENT_SUBTYPE.CREDIT_CARD.toLowerCase()) {
          const clientTokenResponse = await clientToken({ configurationSetCode: configurationSet.configurationSetCode, customerGuid: "" });
          setPaymentClientToken(clientTokenResponse.paymentGatewayToken);
        }
        paymentRequest.paymentMethodType = configurationSet?.subType;
        setPaymentRequest(paymentRequest);
        setLoadPluginUI(true);
      } else {
        const paymentSubType = configurationSet.subType;
        if (
          paymentSubType.toLowerCase() === PAYMENT_SUBTYPE.CHARGE_ON_DELIVERY.toLowerCase() ||
          paymentSubType.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() ||
          paymentSubType.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase()
        ) {
          setShowPayAndSubmit(false);
          if (paymentSubType.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase()) {
            setIsDisabled && setIsDisabled(true);
            setIsDisabledConvertQuote && setIsDisabledConvertQuote(true);
          } else {
            setIsDisabled && setIsDisabled(false);
            setIsDisabledConvertQuote && setIsDisabledConvertQuote(false);
          }
        } else {
          setShowPayAndSubmit(true);
          setIsDisabled && setIsDisabled(true);
          setIsDisabledConvertQuote && setIsDisabledConvertQuote(true);
        }
      }
    }
  };

  const requiresApproval =
    enableApprovalRouting &&
    (((approvalType === PENDING_APPROVAL_STATUS.PAYMENT && approvalSetting) || (approvalType === PENDING_APPROVAL_STATUS.STORE) || (approvalType === PENDING_APPROVAL_STATUS.USERS)) &&
      total >= (orderLimit || 0));

  const setAddressDetailsForPayment = async (paymentRequest: IPaymentPluginRequest) => {
    if (billingAddressId) {
      const checkoutBillingAddress = await getAddressDetailsById(billingAddressId);
      const billingAddress = await mapPaymentAddress(checkoutBillingAddress);
      if (billingAddress) paymentRequest.billingAddress = billingAddress;
    }
    if (shippingAddressId) {
      const checkoutShippingAddress = await getAddressDetailsById(shippingAddressId);
      const shippingAddress = await mapPaymentAddress(checkoutShippingAddress);
      if (shippingAddressId) paymentRequest.shippingAddress = shippingAddress;
    }
  };
  useEffect(() => {
    if ((!isOfflinePayment && total <= 0) || voucherAmount === total) {
      setShowPayAndSubmit(false);
      setIsPaymentSelected && setIsPaymentSelected(false);
      setPaymentDetails(null, null, null, false);
      setConfigurationSet({} as IPaymentConfigurationSetDetails);
      setSelectedPaymentOption({} as IPaymentOption);
    }
  }, [total, voucherAmount, isOfflinePayment, setPaymentDetails, setIsPaymentSelected]);
  const renderPaymentMethods = (paymentConfigurationSets: IPaymentOption[]) => {
    if (paymentConfigurationSets.length > 0) {
      return paymentConfigurationSets?.map((paymentConfigurationSet: IPaymentOption) => {
        return (
          <div className="flex items-center" data-test-selector={`divPaymentOptions${paymentConfigurationSet?.paymentCode}`} key={paymentConfigurationSet?.paymentId}>
            <Input
              type="radio"
              className={total <= 0 || voucherAmount === total ? "h-4 form-radio xs:w-4 text-gray-500" : "h-4 form-radio xs:w-4 accent-accentColor"}
              disabled={total <= 0 || voucherAmount === total}
              id={`${paymentConfigurationSet?.paymentCode}-${paymentConfigurationSet?.paymentId}`}
              checked={total > 0 && String(paymentConfigurationSet.paymentCode) === selectedPaymentOption?.paymentCode}
              dataTestSelector={`txt${paymentConfigurationSet?.paymentCode}`}
              onChange={() => handleInputChange(paymentConfigurationSet)}
              ariaLabel={paymentConfigurationSet?.paymentName}
            />
            <label
              className={total <= 0 || voucherAmount === total ? "font-normal ml-4 text-gray-500" : "font-normal ml-4 cursor-pointer"}
              htmlFor={`${paymentConfigurationSet?.paymentCode}-${paymentConfigurationSet?.paymentId}`}
              data-test-selector={`lblPayment${paymentConfigurationSet?.paymentCode}`}
            >
              {paymentConfigurationSet?.paymentName}
            </label>
          </div>
        );
      });
    }
  };

  const handleError = () => {
    setLoading(false);
    error(checkoutTranslations("unableToPlaceOrder"));
  };

  const submitOrder = async () => {
    try {
      setLoading(true);
      closeModal();
      const existingCookie = getCookie(CART_COOKIE.COPIED_CART_NUMBER);
      // Check if the existing cookie is either non-existent or has an empty value
      if (!existingCookie || existingCookie === "undefined" || existingCookie === null || existingCookie.trim() === "") {
        const copyData = await copyOrderDetails({ orderType: ORDER_DATA_TYPE.QUOTE, orderNumber: quoteNumber ?? "" });
        setCookie("CopiedCartNumber", copyData.copiedQuoteNumber || "");
      }
      const userModel = await getSavedUserSessionCallForClient();
      const convertToOrderRequestModel: IConvertToOrder = {
        userId: userModel?.userId || 0,
        targetClassType: TARGET_ORDER_DATA_TYPE.ORDER,
      };
      const paymentDetails = {
        paymentSubTypeCode: selectedPaymentOption?.paymentCode || "",
        configurationSetCode: payment.configurationSetCode || "",
        paymentName: payment.configurationSetDisplayName,
      } as IPaymentDetails;
      if (payment.subTypeCode?.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() && payment.purchaseOrderNumber)
        paymentDetails.purchaseOrderNumber = payment.purchaseOrderNumber;
      if (payment.subTypeCode?.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() && payment.purchaseOrderDocumentPath)
        paymentDetails.purchaseOrderDocumentFilePath = payment.purchaseOrderDocumentPath;
      convertToOrderRequestModel.paymentDetails = paymentDetails;
      const cartNumber = getCookie("CopiedCartNumber");
      if (
        payment.subTypeCode?.toLowerCase() !== PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() &&
        payment.subTypeCode?.toLowerCase() !== PAYMENT_SUBTYPE.CHARGE_ON_DELIVERY.toLowerCase() &&
        payment.subTypeCode?.toLowerCase() !== PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase()
      ) {
        const finalClassNumber = await getFinalizedOrderNumber(String(cartNumber));
        if (finalClassNumber && finalClassNumber !== "") {
          const paymentResponse = await createOnlinePayment(String(finalClassNumber), total ?? 0);
          if (paymentResponse && paymentResponse?.paymentDetails?.paymentTransactionToken) {
            convertToOrderRequestModel.paymentDetails.externalTransactionId = paymentResponse?.paymentDetails?.externalTransactionId;
            convertToOrderRequestModel.paymentDetails.paymentStatusCode = paymentResponse?.paymentDetails?.paymentStatusCode;
            convertToOrderRequestModel.paymentDetails.paymentTransactionToken = paymentResponse?.paymentDetails?.paymentTransactionToken;
            convertToOrderRequestModel.paymentDetails.paymentSubTypeCode = paymentResponse?.paymentDetails?.paymentSubTypeCode;
          }
          else {
            let errorMessage: string;
            if (paymentResponse?.isPaymentVerified === false) {
              errorMessage = checkoutTranslations("paymentVerificationFailed");
            }
            else if (paymentResponse?.isPaymentAuthorized === false || paymentResponse?.isPaymentCaptured === false) {
              errorMessage = checkoutTranslations("paymentFailed");
            }
            else {
              errorMessage = checkoutTranslations("unableToPlaceOrder");
            }
            setLoading(false);
            setPaymentProcessing(false);
            error(errorMessage);
            return convertToOrderRequestModel;
          }
        } else {
          handleError();
        }
      }
      const orderResponse = await processOrder(convertToOrderRequestModel, cartNumber || "", ORDER_DATA_TYPE.QUOTE);
      if (orderResponse?.isSuccess && orderResponse?.orderNumber) {
        success(checkoutTranslations("placeOrderSuccessfully"));
        userActivityLog({ eventName: USER_ACTIVITY_EVENT.ORDER_PLACED, orderId: orderResponse?.orderNumber, orderTotal: total, currency: currencyCode });
        closeModal();
        await updateOrderStatus({ orderType: ORDER_DATA_TYPE.QUOTE, orderNumber: quoteNumber || "", status: QUOTE_STATUS.QUOTE_STATUS_APPROVED });
        setLoading(false);
        setPaymentProcessing(false);
        setCookie(ORDER_RECEIPT.USER_ORDER_RECEIPT_ORDER_ID, orderResponse.orderNumber.toString());
        deleteCookie(CART_COOKIE.CART_NUMBER);
        deleteCookie(CART_COOKIE.COPIED_CART_NUMBER);
        router.push("/order/receipt");
      } else {
        handleError();
      }
    } catch (error) {
      logClient.error("Error in method - submitForApproval " + errorStack(error));
      return { hasError: true } as IBaseResponse;
    }
  };

  return (
    <>
      <LoaderComponent isLoading={loading} overlay={true} />
      <div className="xs:w-full" data-test-selector="divPaymentContainer">
        <Heading level="h2" customClass="uppercase" name={paymentTranslations("paymentMethod")} dataTestSelector="hdgPaymentMethod" showSeparator />
      </div>
      {paymentOptions && (
        <div className="mt-3 xs:w-full">
          {!isFromQuote && !isOfflinePayment && (
            <div className="mb-3">
              <Promo generalSetting={generalSetting} type={DISCOUNT_TYPE.GIFT_CARD} currencyCode={currencyCode} />
            </div>
          )}
          <Heading customClass="uppercase" level="h3" name={paymentTranslations("paymentType")} dataTestSelector="hdgPaymentType" showSeparator />
          <div className="space-y-1.5">{paymentOptions && renderPaymentMethods(paymentOptions)}</div>
        </div>
      )}
      {showPayAndSubmit && !isOfflinePayment && !isFromQuote && (
        <Button
          htmlType="submit"
          size="small"
          onClick={() => handlePayAndSubmit()}
          type="primary"
          className="mt-10"
          dataTestSelector="btnPayAndSubmit"
          ariaLabel="pay and submit button"
          disabled={!shippingOptionId}
        >
          {paymentTranslations("payAndSubmit")}
        </Button>
      )}
      {loadPluginUI && (
        <Modal modalId={String(configurationSet?.pluginName)} maxHeight="lg" size="4xl" customClass="overflow-y-auto" >
          <PaymentPlugin
            {...{
              pluginScript: configurationSet?.scriptPath ?? "",
              pluginName: configurationSet?.pluginName ?? "",
              key: paymentRequest.savedPaymentMethods.length,
              clientToken: paymentClientToken ?? "",
              setInitiatePlaceOrderAction: setInitiatePlaceOrderAction,
              setInitiateCancelAction: setInitiateCancelAction,
              setErrorResponse: setErrorResponse,
              setClientResponse: setPaymentClientResponse,
              setInitiateDeleteSavedCard: setInitiateDeleteSavedCard,
              setIsSaveCreditCard: setIsSaveCreditCard,
              setIsSavedPayment: setIsSavedPayment,
              paymentRequest: paymentRequest,
            }}
          ></PaymentPlugin>
          {isDeletingCard && (
              <LoaderComponent isLoading={true} overlay={true} />
          )}
        </Modal>
      )}
{loadPluginUI && (isOfflinePayment || isFromQuote) && (
  <div className="relative">
    <PaymentPlugin
      {...{
        pluginScript: configurationSet?.scriptPath ?? "",
        pluginName: configurationSet?.pluginName ?? "",
        key: paymentRequest.savedPaymentMethods.length,
        clientToken: paymentClientToken ?? "",
        setInitiatePlaceOrderAction: setInitiatePlaceOrderAction,
        setInitiateCancelAction: setInitiateCancelAction,
        setErrorResponse: setErrorResponse,
        setClientResponse: setPaymentClientResponse,
        setInitiateDeleteSavedCard: setInitiateDeleteSavedCard,
        setIsSaveCreditCard: setIsSaveCreditCard,
        setIsSavedPayment: setIsSavedPayment,
        paymentRequest: paymentRequest,
      }}
    />
    {isDeletingCard && (
      <LoaderComponent isLoading={true} overlay={true} />
    )}
  </div>
)}
      {configurationSet?.subType && configurationSet?.subType?.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() && (
        <div>
          <PurchaseOrder
            configurationSet={configurationSet}
            poDocEnabled={configurationSet.enablePODocumentUpload}
            poDocRequired={false}
            setIsDisabled={setIsDisabled}
            setIsDisabledConvertQuote={setIsDisabledConvertQuote}
          />
        </div>
      )}
      {isFromQuote &&
        ((configurationSet && !configurationSet.subType && total <= 0) ||
          configurationSet?.subType.toLowerCase() === PAYMENT_SUBTYPE.CHARGE_ON_DELIVERY.toLowerCase() ||
          configurationSet?.subType.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() ||
          configurationSet?.subType.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase()) && (
          <div className="flex justify-end gap-5">
            <Button
              onClick={() => {
                submitOrder();
              }}
              type="primary"
              size="small"
              dataTestSelector="btnPlaceOrder"
              ariaLabel="place order button"
              disabled={isDisabledConvertQuote || (!isPaymentOptionSelected && total > 0)}
            >
              {checkoutTranslations("placeOrder")}
            </Button>
          </div>
        )}
    </>
  );
}
