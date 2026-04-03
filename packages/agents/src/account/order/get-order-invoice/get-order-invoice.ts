import { AREA, errorStack, logServer } from "@znode/logger/server";
import { getProductSpecificDescription, isGroupedOrConfigurableProduct } from "../../../cart";

import { CommerceCollections_multipleClassDetailsByClassType } from "@znode/clients/cp";
import { ICommerceCollectionClassDetail as IOrderDetails } from "@znode/types/order";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertCamelCase } from "@znode/utils/server";
import { convertDate } from "@znode/utils/component";
import { getAttributeValue } from "@znode/utils/common";
import { getCostFactorByType } from "../../../cart/cart-helper";
import { getGeneralSettingList } from "../../../general-setting";
import { getPortalDetails } from "../../../portal";
import { IAddressDetails } from "@znode/types/address";

export async function getOrderInvoiceDetails(classNumbers: string) {
  try {
    if (!classNumbers) return handleGetOrderInvoiceDetailsFailure();

    const invoiceOrdersDetails = await CommerceCollections_multipleClassDetailsByClassType(ORDER_DATA_TYPE.ORDER, classNumbers);
    const data = convertCamelCase(invoiceOrdersDetails?.CommerceCollectionClassDetailList);
    if (data?.hasError) return [];
    return mapOrderInvoiceDetails(data);
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return [];
  }
}

export function handleGetOrderInvoiceDetailsFailure() {
  logServer.error(AREA.ORDER, "Failed to retrieve invoice details.");
  return [];
}

async function mapOrderInvoiceDetails(invoiceData: IOrderDetails[]) {
  const { currencyCode } = await getPortalDetails();
  const generalSetting = await getGeneralSettingList();
  return invoiceData.map((item: IOrderDetails) => orderDetails(item, generalSetting, currencyCode)).filter(Boolean);
}

function orderDetails(orderData: IOrderDetails, generalSetting: { dateFormat: string; displayTimeZone: string }, currencyCode: string | undefined) {
  const { dateFormat, displayTimeZone } = generalSetting;

  const {
    classNumber,
    createdDate,
    createdByFullName,
    paymentDetails,
    orderShipments,
    address,
    lineItemDetails,
    total,
    subTotal,
    costFactorResponse: costs,
    additionalInstructions,
    inHandDate,
  } = orderData;
  const shippingCost = getCostFactorByType(costs, "ShippingCost") || 0;
  const handlingFee = getCostFactorByType(costs, "HandlingFee") || 0;
  const taxCost = getCostFactorByType(costs, "TaxCost");
  const importDuty = getCostFactorByType(costs, "ImportDuty");
  const totalDiscount = getCostFactorByType(costs, "TotalDiscount");
  const csrDiscount = getCostFactorByType(costs, "CSRDiscount");
  const voucherAmount = getCostFactorByType(costs, "VoucherAmount");
  const shippingMethod = orderShipments?.shippingMethodName ;
  const shippingDiscount = getCostFactorByType(costs, "ShippingDiscount");

  const productData = lineItemDetails?.map((item) => {
    const productType: string = getAttributeValue(item.attributes || [], "ProductType", "attributeValue") as string;
    if (isGroupedOrConfigurableProduct(productType, item) && item.childItemList && item.childItemList.length > 0) {
      return {
        item: item.childItemList[0].productName,
        description: getProductSpecificDescription(productType, item.childItemList[0]),
        quantity: item.childItemList[0].quantity,
        price: item.childItemList[0].itemPrice,
        total: item.childItemList[0].totalPrice,
      };
    }
    return {
      item: item.productName,
      description: getProductSpecificDescription(productType, item),
      quantity: item.quantity,
      price: item.unitPrice,
      total: item.totalPrice,
    };
  });

  const billingAddressDetails = (address || []).find((data) => data.isBilling);
  const shippingAddressDetails = (address || []).find((data) => data.isShipping);
  const { firstName, lastName, companyName, address1, address2, phoneNumber } = billingAddressDetails || {};
  const {
    firstName: ship_firstName,
    lastName: ship_lastName,
    companyName: ship_companyName,
    address1: ship_address1,
    address2: ship_address2,
    phoneNumber: ship_phoneNumber,
  } = shippingAddressDetails || {};

  return {
    currencyCode,
    orderDate: convertDate(createdDate || "", dateFormat, displayTimeZone),
    orderNumber: classNumber,
    detailsColumn: [
      {
        name: "date",
        value: convertDate(createdDate || "", dateFormat, displayTimeZone),
      },
      {
        name: "name",
        value: createdByFullName,
      },
      {
        name: "order",
        value: classNumber,
      },
      {
        name: "payment",
        value: paymentDetails?.paymentName,
      },
      {
        name: "trackingNumber",
        value: orderShipments?.trackingNumber,
      },
      {
        name: "jobName",
        value: additionalInstructions?.name || "",
      },
    ],
    billingColumn: !billingAddressDetails
      ? []
      : [
          {
            value: firstName + " " + lastName || "",
          },
          {
            value: companyName || "",
          },
          {
            value: address1,
          },
          {
            value: address2,
          },
          {
            value: constructAddress(billingAddressDetails),
          },
          { name: "phoneNumber", value: phoneNumber },
        ],
    shippingColumn: !shippingAddressDetails
      ? []
      : [
          {
            value: ship_firstName + " " + ship_lastName || "",
          },
          {
            value: ship_companyName || "",
          },
          {
            value: ship_address1,
          },
          {
            value: ship_address2,
          },
          {
            value: constructAddress(shippingAddressDetails),
          },
          { name: "phoneNumber", value: ship_phoneNumber },
        ],
    shippingColumn2: [
      {
        name: "inHandDate",
        value: convertDate(inHandDate || "", dateFormat, displayTimeZone) || "",
      },
      {
        name: "shippingConstraints",
        value: orderShipments?.shippingConstraintCode || "",
      },
    ],
    productDetails: productData,
    productPricing: [
      {
        name: "subTotal",
        value: subTotal,
      },
      {
        name: "shipping",
        value: {shippingCost, shippingMethod},
      },
      {
        name: "handlingCharges",
        value: handlingFee,
      },
      {
        name:"importDuty",
        value: importDuty,
      },
      {
        name: "tax",
        value: taxCost,
      },
      {
        name: "discountSubTotal",
        value: totalDiscount,
      },
      {
        name: "csrDiscount",
        value: csrDiscount || 0,
      },
      {
        name: "voucherAmount",
        value: voucherAmount,
      },
      {
        name: "shippingDiscount",
        value: shippingDiscount,
      },
    ],
    orderTotal: [
      {
        name: "orderTotal",
        value: total,
      },
    ],
    hideBillingAddress: [
      {
        name: "isBillingAddressOptional",
        value: paymentDetails?.isBillingAddressOptional,
      },
    ],
  };
}

function constructAddress({ cityName, stateName, countryName, postalCode }: IAddressDetails) {
  const addressParts = [];
  cityName && addressParts.push(cityName);
  stateName && addressParts.push(stateName);
  if (countryName && postalCode) {
    addressParts.push(`${countryName} ${postalCode}`);
  } else {
    countryName && addressParts.push(countryName);
    postalCode && addressParts.push(postalCode);
  }
  return addressParts.join(", ");
}
