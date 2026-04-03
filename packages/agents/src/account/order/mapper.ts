import { ICalculateSummary, ICommerceCollectionClassDetail, IOrder, IOrderDiscount, IOrderLineItem, IOrderLineItems, IOrdersList, IPaymentHistory } from "@znode/types/account";
import { ORDER_DISCOUNT, ORDER_RECEIPT } from "@znode/constants/order";
import { convertDate, convertDateTime } from "@znode/utils/component";

import { IAddress } from "@znode/types/address";
import { IGeneralSetting } from "@znode/types/general-setting";
import { IPortalDetail } from "@znode/types/portal";
import { getGlobalAttributeValue } from "../../cart";

export const mapOrderLineItems = (orderItem: IOrderLineItem) => {
  return {
    id: orderItem.omsOrderLineItemsId as number,
    price: orderItem.price,
    name: orderItem.productName as string,
    productName: orderItem.productName as string,
    quantity: orderItem.quantity,
    total: orderItem.total,
    sku: orderItem.sku,
    productType: orderItem.productType,
    description: orderItem.description,
    currencyCode: orderItem.currencyCode,
    trackingNumber: orderItem.trackingNumber,
    orderLineItemState: orderItem.orderLineItemState,
    personaliseValuesDetail: orderItem.personaliseValuesDetail,
    parentOmsOrderLineItemsId: orderItem.parentOmsOrderLineItemsId,
    personaliseValueList: orderItem.personaliseValueList,
    shippingAddressHtml: orderItem.shippingAddressHtml,
  };
};

export const mapToOrdersList = (order: IOrder, generalSetting: IGeneralSetting): IOrdersList => {
  return {
    orderNumber: order.classNumber || "",
    statusCode: order.statusCode,
    paymentStatus: order.paymentStatus,
    orderState: order.classStatus,
    orderDate: convertDateTime(order.orderDate as string, generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone),
    total: order.total,
    paymentDisplayName: order.paymentName,
    subTypeCode: order.subTypeCode,
    remainingOrderAmount: order.remainingOrderAmount,
  };
};

export const mappedOrderDetails = (
  commerceCollectionClassDetail: ICommerceCollectionClassDetail,
  calculateSummary: ICalculateSummary,
  portalData: IPortalDetail,
  generalSetting: IGeneralSetting,
  paymentHistoryList?: IPaymentHistory[]
) => {
  const shippingConstraintAttributeValue = getGlobalAttributeValue(portalData, ORDER_RECEIPT.SHOW_SHIPPING_CONSTRAINT);
  const getDiscountCode = (discounts: IOrderDiscount[], discountTypeName: string): string[] => {
    return discounts?.filter(({ discountType }) => discountType.toLocaleLowerCase() === discountTypeName.toLocaleLowerCase()).map(({ discountCode }) => discountCode) ?? [];
  };

  return {
    accountName: commerceCollectionClassDetail?.accountName,
    storeName: portalData?.storeName || "",
    userId: commerceCollectionClassDetail.userId || 0,
    classNumber: commerceCollectionClassDetail?.classNumber || "",
    finalClassNumber: commerceCollectionClassDetail?.finalClassNumber || "",
    userName: commerceCollectionClassDetail?.userName || "",
    additionalInstructions: commerceCollectionClassDetail?.additionalInstructions?.information ?? "",
    jobName: commerceCollectionClassDetail?.additionalInstructions?.name || "",
    address:
      commerceCollectionClassDetail?.address?.map((address: IAddress) => ({
        isBilling: address.isBilling,
        isShipping: address.isShipping,
        street: address.street,
        city: address.cityName,
        state: address.state,
        zipCode: address.zipCode,
        address1: address.address1,
        address2: address.address2,
        addressId: address.addressId,
        companyName: address.companyName,
        countryName: address.countryName,
        displayName: address.displayName,
        firstName: address.firstName,
        lastName: address.lastName,
        postalCode: address.postalCode,
        stateName: address?.stateName,
        cityName: address?.cityName,
        phoneNumber: address?.phoneNumber,
      })) || [],
    orderLineItems:
      commerceCollectionClassDetail?.lineItemDetails?.map((item: IOrderLineItems) => ({
        itemName: item.itemName || "",
        quantity: item.quantity || 0,
        availableQuantity: item.availableQuantity || 0,
        price: item.itemPrice || 0,
        id: item?.cartItemId,
        name: item?.productName,
        total: item?.totalPrice,
        sku: item?.sku,
        description: item?.productDescription,
        shippingCost: item?.shippingCost,
        orderLineItemState: item?.orderLineItemState,
        orderLineItemStateName: item?.orderLineItemStateName,
      })) || [],
    cultureCode: commerceCollectionClassDetail?.cultureCode || "USD",
    orderNumber: commerceCollectionClassDetail?.classNumber || "",
    shippingConstraintCode: commerceCollectionClassDetail?.orderShipments?.shippingConstraintCode || "",
    isShippingConstraint: shippingConstraintAttributeValue,
    inHandDate: convertDate(commerceCollectionClassDetail?.orderShipments?.inHandDate as string, generalSetting?.dateFormat),
    createdDate: convertDate(commerceCollectionClassDetail?.createdDate as string, generalSetting?.dateFormat, generalSetting?.displayTimeZone),
    shippingTypeName: commerceCollectionClassDetail?.orderShipments?.shippingMethodName || "",
    costFactorResponse: calculateSummary.costFactorResponse,
    calculateSummary: {
      subTotal: calculateSummary?.subTotal || 0,
      taxCost: calculateSummary?.taxCost || 0,
      shippingCost: calculateSummary?.shippingCost || 0,
      total: calculateSummary?.total,
      csrDiscountAmount: calculateSummary?.csrDiscount,
      returnCharges: calculateSummary?.returnCharges,
      giftCardAmount: calculateSummary?.giftCardAmount,
      handlingFee: calculateSummary?.handlingFee,
      totalDiscount: calculateSummary?.totalDiscount,
      shippingDiscount: calculateSummary?.shippingDiscount,
      taxSummaryList: calculateSummary?.taxSummaryList,
      importDuty: calculateSummary?.importDuty || 0,
    },
    remainingOrderAmount: commerceCollectionClassDetail?.paymentDetails?.remainingOrderAmount || 0,
    paymentDate: commerceCollectionClassDetail.paymentDate || "",
    configurationSetCode: commerceCollectionClassDetail?.paymentDetails?.configurationSetCode,
    paymentStatusCode: commerceCollectionClassDetail?.paymentDetails?.paymentStatusCode,
    paymentSubTypeCode: commerceCollectionClassDetail?.paymentDetails?.paymentSubTypeCode,
    paymentDisplayName: commerceCollectionClassDetail?.paymentDetails?.paymentName,
    trackingNumber: commerceCollectionClassDetail?.orderShipments?.trackingNumber,
    amount: commerceCollectionClassDetail.amount || 0,
    priceRoundOff: generalSetting.priceRoundOff,
    currencyCode: commerceCollectionClassDetail.currencyCode || "USD",
    orderState: commerceCollectionClassDetail.classStateName || "",
    couponCode: getDiscountCode(commerceCollectionClassDetail.orderDiscounts ?? [], ORDER_DISCOUNT.COUPONCODE) ?? "",
    voucherNumber: getDiscountCode(commerceCollectionClassDetail.orderDiscounts ?? [], ORDER_DISCOUNT.VOUCHERNUMBER) ?? "",
    billingAddress: commerceCollectionClassDetail?.address?.find((x) => x.isBilling === true) || {},
    shippingAddress: commerceCollectionClassDetail?.address?.find((x) => x.isShipping === true) || {},
    total: commerceCollectionClassDetail.total,
    statusCode: commerceCollectionClassDetail.statusCode,
    isGuestUser: commerceCollectionClassDetail.isGuestUser,
    convertedClassNumber: commerceCollectionClassDetail?.convertedClassNumber,
    isBillingAddressOptional: commerceCollectionClassDetail?.paymentDetails?.isBillingAddressOptional,
    paymentList:
      paymentHistoryList?.map((paymentHistory: IPaymentHistory) => ({
        paymentDate: convertDate(paymentHistory.paymentDate, generalSetting?.dateFormat, generalSetting?.displayTimeZone),
        transactionStatus: paymentHistory?.paymentStatusName,
        subTypeDisplayName: paymentHistory?.subTypeDisplayName,
        paidAmount: paymentHistory?.paidAmount,
        remainingOrderAmount: paymentHistory?.remainingOrderAmount,
      })) || [],
  };
};
