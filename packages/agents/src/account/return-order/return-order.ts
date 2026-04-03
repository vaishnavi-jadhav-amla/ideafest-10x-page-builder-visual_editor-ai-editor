import {
  CommerceCollections_classDetailsByClassType,
  Logs_logDetailsByClassType,
  Returns_approvedDetailsV1ByOrderNumber,
  Returns_barcodeDetailsByReturnNumber,
  Returns_returnOrders,
  Returns_returns,
  Returns_validateReturn,
  Returns_validation,
} from "@znode/clients/cp";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase } from "@znode/utils/server";
import {
  IAddressResponse,
  ICreateReturnResponse,
  ILineItemDetailsResponseModel,
  INoteDetails,
  IRequestProductReturnDetails,
  IReturnCalculateResponse,
  IReturnOrderProductList,
  IReturnProductList,
  IReturnReceiptData,
} from "@znode/types/order";
import { RETURN_ORDER, RETURN_ORDER_STATUS } from "@znode/constants/return-order";
import { convertDate, convertTimeOnly } from "@znode/utils/component";
import { getAttributeValue, getSavedUserSession } from "@znode/utils/common";

import { IAddress } from "@znode/types/address";
import { IPaymentAddress } from "@znode/types/payment";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { getCostFactorByType } from "../../cart/cart-helper";
import { getGeneralSettingList } from "../../general-setting/general-setting";
import { getProductSpecificDescription } from "../../cart/mapper";
import { getReasonList } from "../order";
import { getReturnOrderCalculationDetails } from "./get-return-list";

export async function mapPaymentAddress(checkoutAddress: IAddress) {
  const paymentAddress = {
    state: checkoutAddress.stateName,
    country: checkoutAddress.countryName,
    city: checkoutAddress.cityName,
    firstName: checkoutAddress.firstName,
    lastName: checkoutAddress.lastName,
    addressLine1: checkoutAddress.address1,
    addressLine2: checkoutAddress.address2,
    zipCode: checkoutAddress.postalCode,
  } as IPaymentAddress;
  return paymentAddress;
}

function formatAddress(addresses: IAddressResponse[]): {
  billing?: string;
  shipping?: string;
} {
  const result: { billing?: string; shipping?: string } = {};

  for (const address of addresses) {
    const formatted = `<b>${address.DisplayName}</b>,<br />
    ${address.FirstName} ${address.LastName},<br />
    ${address.CityName}, ${address.StateName}<br />
  ${address.Address1}${address.Address2 ? `, ${address.Address2}` : ""}<br />
  ${address.CityName}, ${address.StateName}, ${address.CountryName} ${address.PostalCode}<br />
  Phone Number : ${address.PhoneNumber}`;

    if (address.IsBilling) {
      result.billing = formatted;
    }
    if (address.IsShipping) {
      result.shipping = formatted;
    }
  }

  return result;
}

export function mergeOrderAndReturnProductsFormatted(
  orderList: ILineItemDetailsResponseModel[],
  returnList: ILineItemDetailsResponseModel[],
  currencyCode: string
): IReturnProductList[] {
  const mergedMap = new Map<string, IReturnProductList>();

  const returnResponse = {
    lineItemDetails: returnList || [],
    currencyCode: currencyCode ?? "",
  };

  const toReturnProduct = (item: ILineItemDetailsResponseModel): IReturnProductList => {
    const itemId = item.itemId ?? "";
    const productType = getAttributeValue(item.attributes ?? [], "ProductType", "attributeValue") ?? "";

    return {
      productName: item.productName ?? "",
      sku: item.sku ?? "",
      availableQty: Number(item.availableQuantity ?? item.quantity ?? 0),
      editQty: Number(item.quantity ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
      imageUrl: item.productImagePath ?? "",
      productId: itemId,
      productType: item.productType ?? "",
      productDescription: getProductSpecificDescription(productType as string, item),
      seoUrl: item.seoUrl ?? "",
      status: item.statusCode ?? "",
      currencyCode: returnResponse.currencyCode,
      statusName: item.statusName ?? "",
      reasonCode: item.reasonForCode ? String(item.reasonCode) : "",
      reasonForReturn: item.reasonForReturn ?? "",
    };
  };

  // Step 1: Add return products to map (prefer return info)
  for (const returned of returnList) {
    const isBundle = getAttributeValue(returned.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL;
    const isGroupProduct = getAttributeValue(returned.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL;
    if (returned.childItemList && returned.childItemList.length > 0 && !isBundle) {
      for (const child of returned.childItemList) {
        const product = toReturnProduct(child);
        mergedMap.set(product.sku, {
          ...product,
          productName: isGroupProduct
            ? `<div><div data-test-selector="divParentProductName${returned.sku}">${returned.productName ?? "-"}</div>
                <div data-test-selector="divChildProduct${child.sku}">${child.productName}</div> </div>`
            : (child.productName as string),
        });
      }
    } else {
      const product = toReturnProduct(returned);
      mergedMap.set(product.sku, product);
    }
  }

  // Step 2: Merge ordered products (only if not already present, or to update availableQty)
  for (const order of orderList) {
    const isBundle = getAttributeValue(order.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL;
    const isGroupProduct = getAttributeValue(order.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL;
    if (order.childItemList && order.childItemList.length > 0 && !isBundle) {
      for (const child of order.childItemList) {
        const key = child.sku ?? "";
        if (mergedMap.has(key)) {
          // Only update availableQty
          const existing = mergedMap.get(key)!;
          mergedMap.set(key, {
            ...existing,
            calculateId: child.itemId ?? "",
            availableQty: Number(child.availableQuantity ?? 0) + Number(existing.editQty),
            productName: isGroupProduct
              ? `<div><div data-test-selector="divParentProductName${order.sku}">${order.productName ?? "-"}</div>
                  <div data-test-selector="divChildProduct${child.sku}">${child.productName}</div> </div>`
              : (child.productName as string),
          });
        } else {
          const product = toReturnProduct(child);
          product.editQty = 0;
          product.calculateId = child.itemId ?? "";
          product.availableQty = Number(child.availableQuantity ?? 0);
          mergedMap.set(key, product);
        }
      }
    } else {
      const key = order.sku ?? "";
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!;
        mergedMap.set(key, {
          ...existing,
          calculateId: order.itemId ?? "",
          availableQty: Number(order.availableQuantity ?? 0) + Number(existing.editQty),
        });
      } else {
        const product = toReturnProduct(order);
        product.editQty = 0;
        product.calculateId = order.itemId ?? "";
        product.availableQty = Number(order.availableQuantity ?? 0);
        mergedMap.set(key, product);
      }
    }
  }
  return Array.from(mergedMap.values());
}

export function isStatusValid(status: string): boolean {
  const invalidStatuses = RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_LINE_ITEM_STATUS;
  return !invalidStatuses.includes(status?.toUpperCase() ?? "");
}

export async function getDetailsByClassNumber(classType: string, classNumber: string, isValidNumber?: string) {
  try {
    const response = await CommerceCollections_classDetailsByClassType(classType, classNumber);
    const productResponse =
      response.StatusCode === RETURN_ORDER.NOT_SUBMITTED ? await CommerceCollections_classDetailsByClassType("Orders", response.LinkedClassNumber as string) : null;
    const returnResponse = convertCamelCase(response);
    const reasonList = await getReasonList();
    const productList =
      response.StatusCode === RETURN_ORDER.NOT_SUBMITTED
        ? mergeOrderAndReturnProductsFormatted(convertCamelCase(productResponse?.LineItemDetails), convertCamelCase(response.LineItemDetails), returnResponse.currencyCode)
        : [];
    const productDetails: IReturnProductList[] = [];
    if (response.StatusCode !== RETURN_ORDER.NOT_SUBMITTED) {
      if (returnResponse.lineItemDetails && returnResponse.lineItemDetails.length > 0) {
        returnResponse.lineItemDetails.map((item: ILineItemDetailsResponseModel) => {
          const isBundle = getAttributeValue(item.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL;
          const isGroupProduct = getAttributeValue(item.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL;
          if (item.childItemList && item.childItemList.length > 0 && !isBundle) {
            return item.childItemList.map((childItem) => {
              const productType: string = getAttributeValue(childItem.attributes || [], "ProductType", "attributeValue") as string;
              productDetails.push({
                productName: isGroupProduct
                  ? `<div><div class="font-semibold" data-test-selector="divParentProductName${item.sku}">${item.productName ?? "-"}</div>
                      <div data-test-selector="divChildProduct${childItem.sku}">${childItem.productName}</div> </div>`
                  : (childItem.productName as string),
                sku: childItem.sku as string,
                availableQty: Number(childItem.availableQuantity ?? 0),
                unitPrice: childItem.unitPrice as number,
                imageUrl: childItem.productImagePath as string,
                productId: childItem.itemId as string,
                calculateId: childItem.itemId as string,
                productType: childItem.productType as string,
                seoUrl: childItem.seoUrl as string,
                status: childItem.statusCode as string,
                statusName: childItem.statusName as string,
                currencyCode: returnResponse.currencyCode,
                productDescription: getProductSpecificDescription(productType, childItem),
                reasonCode: childItem.reasonForCode ? String(childItem.reasonForCode) : "",
                reason: childItem.reasonForReturn ? String(childItem.reasonForReturn) : "",
                reasonForReturn: childItem.reasonForReturn ? String(childItem.reasonForReturn) : "",
              });
            });
          } else {
            const productType: string = getAttributeValue(item.attributes || [], "ProductType", "attributeValue") as string;
            const statusSourceItem = isBundle && item.childItemList && item.childItemList.length > 0 ? item.childItemList[0] : item;
            productDetails.push({
              productName: item.productName as string,
              sku: item.sku as string,
              availableQty: Number(item.availableQuantity),
              unitPrice: item.unitPrice as number,
              imageUrl: item.productImagePath as string,
              productId: item.itemId as string,
              calculateId: item.itemId as string,
              productType: item.productType as string,
              seoUrl: item.seoUrl as string,
              status: statusSourceItem.statusCode as string,
              statusName: statusSourceItem.statusName as string,
              productDescription: getProductSpecificDescription(productType, item),
              currencyCode: returnResponse.currencyCode,
              reasonCode: item.reasonForCode ? String(item.reasonForCode) : "",
              reason: item.reasonForReturn ? String(item.reasonForReturn) : "",
              reasonForReturn: item.reasonForReturn ? String(item.reasonForReturn) : "",
            });
          }
        });
      }
    }
    const generalSetting = await getGeneralSettingList();
    const productListDetails = response.StatusCode === RETURN_ORDER.NOT_SUBMITTED ? productList : productDetails;
    const validateTheOrderNumber = await validateOrderNumber(response.LinkedClassNumber ?? "", productResponse?.StatusCode ?? "");
    const mapReturnRequestDetails = {
      priceRoundOff: generalSetting.priceRoundOff,
      classNumber: returnResponse.classNumber,
      convertedClassNumber: returnResponse.convertedClassNumber,
      classType: returnResponse.classType,
      orderNumber: returnResponse.classNumber,
      note: response.AdditionalInstructions?.Information,
      orderStatus: returnResponse.orderStatus,
      orderDate: convertDate(returnResponse.createdDate, generalSetting?.dateFormat, generalSetting?.displayTimeZone),
      orderTotal: classType === "Returns" ? productResponse?.Total : returnResponse.total,
      isMatch: response.LinkedClassNumber?.toLowerCase() === isValidNumber?.toLowerCase(),
      currencyCode: returnResponse.currencyCode,
      total: returnResponse.total,
      currencySuffix: returnResponse.currencySuffix,
      productList: productListDetails.map((item) => ({ ...item, isInvalid: !isStatusValid(item.status) })).filter((item) => item.availableQty > 0),
      reasonList: reasonList,
      isEligible: returnResponse.hasError || (productDetails.length === 0 && productList.length === 0) || !isStatusValid(returnResponse.ClassStateName) ? false : true,
      productResponse,
      response,
      isValidOrderNumber: classType === "Returns" ? validateTheOrderNumber.isSuccess : true,
      userId: returnResponse.userId,
    };
    return mapReturnRequestDetails;
  } catch {
    return {
      isEligible: false,
    };
  }
}

export const getReturnReceiptDetails = async (classType: string, classNumber: string, userId: number): Promise<IReturnReceiptData | null> => {
  try {

    const returnReceiptDetails = await CommerceCollections_classDetailsByClassType(classType, classNumber, userId);
    const barCodeDetails = await Returns_barcodeDetailsByReturnNumber(classNumber);
    const noteDetails: INoteDetails[] = [];
    const filterNotes = await returnFilters();
    const returnReceiptNotes = await Logs_logDetailsByClassType(classType, classNumber, filterNotes, undefined, undefined, undefined);
    if (returnReceiptNotes.Notes && returnReceiptNotes.Notes.length > 0) {
      const generalSetting = await getGeneralSettingList();
      const { dateFormat, displayTimeZone, timeFormat } = generalSetting || {};
      returnReceiptNotes.Notes.forEach((item) => {
        noteDetails.push({
          notes: item.Note as string,
          date: convertDate(String(item.CreatedDate), dateFormat, displayTimeZone),
          time: convertTimeOnly(String(item.CreatedDate), timeFormat, displayTimeZone),
          updatedBy: item.CreatedByFullName as string,
        });
      });
    }
    const productDetails: IReturnProductList[] = [];
    const returnResponse = convertCamelCase(returnReceiptDetails.LineItemDetails);
    if (returnResponse && returnResponse.length > 0) {
      returnResponse.map((item: ILineItemDetailsResponseModel) => {
        const isBundle = getAttributeValue(item.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL;
        const isGroupProduct = getAttributeValue(item.attributes ?? [], "ProductType", "attributeValue") === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL;
        if (item.childItemList && item.childItemList.length > 0 && !isBundle) {
          return item.childItemList.map((childItem) => {
            const productType: string = getAttributeValue(childItem.attributes || [], "ProductType", "attributeValue") as string;
            const reasonCode = childItem.reasonCode ? String(childItem.reasonCode) : "";
            const reasonForReturn = childItem.reasonForReturn ? String(childItem.reasonForReturn) : "";
            productDetails.push({
              productName: isGroupProduct
                ? `<div><div data-test-selector="divParentProductName${item.sku}">${item.productName ?? "-"}</div>
                      <div data-test-selector="divChildProduct${childItem.sku}">${childItem.productName}</div> </div>`
                : (childItem.productName as string),
              sku: childItem.sku as string,
              availableQty: childItem.quantity as number,
              unitPrice: childItem.unitPrice as number,
              imageUrl: childItem.productImagePath as string,
              productId: childItem.itemId as string,
              productType: childItem.productType as string,
              productDescription: getProductSpecificDescription(productType, childItem),
              seoUrl: childItem.seoUrl as string,
              status: childItem.statusCode as string,
              statusName: childItem.statusName as string,
              currencyCode: returnResponse.currencyCode,
              shippingCost: childItem.shippingCost,
              confirmedQuantity: Number(childItem.confirmedQuantity),
              isReturnShipping: childItem.isReturnShipping,
              reasonCode,
              reasonForReturn,
            });
          });
        } else {
          const productType: string = getAttributeValue(item.attributes || [], "ProductType", "attributeValue") as string;
          const reasonCode = item.reasonCode ? String(item.reasonCode) : "";
          const reasonForReturn = item.reasonForReturn ? String(item.reasonForReturn) : "";
          const statusSourceItem = isBundle && item.childItemList && item.childItemList.length > 0 ? item.childItemList[0] : item;
          productDetails.push({
            productName: item.productName as string,
            sku: item.sku as string,
            availableQty: item.quantity as number,
            unitPrice: item.unitPrice as number,
            confirmedQuantity: item.confirmedQuantity as number,
            imageUrl: item.productImagePath as string,
            productId: item.itemId as string,
            productType: item.productType as string,
            productDescription: getProductSpecificDescription(productType, item),
            seoUrl: item.seoUrl as string,
            status: statusSourceItem.statusCode as string,
            currencyCode: returnResponse.currencyCode,
            isReturnShipping: item.isReturnShipping,
            shippingCost: item.shippingCost,
            reasonCode,
            statusName: statusSourceItem.statusName as string,
            reasonForReturn,
          });
        }
      });
    }
    const address = formatAddress(returnReceiptDetails.Address as []);
    const wareHouseAddress = returnReceiptDetails.WareHouseAddress ? returnReceiptDetails.WareHouseAddress[0] : {};
    let formatted;
    if (wareHouseAddress) {
      formatted = `${wareHouseAddress.CityName}, ${wareHouseAddress.StateName}<br />
      ${wareHouseAddress.Address1}${wareHouseAddress.Address2 ? `, ${wareHouseAddress.Address2}` : ""}<br />
      ${wareHouseAddress.CityName}, ${wareHouseAddress.StateName}, ${wareHouseAddress.CountryName} ${wareHouseAddress.PostalCode}<br />
      Phone Number : ${wareHouseAddress.PhoneNumber}`;
    }
    const generalSetting = await getGeneralSettingList();
    const filterProductListForCalculations = productDetails.filter((item) => !RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_STATUS.includes(item.status));
    const isConfirmed = filterProductListForCalculations.some((item) => Number(item.confirmedQuantity) > 0);
    const requestBody = {
      classNumber: returnReceiptDetails.ClassNumber as string,
      returnCalculateLineItem: filterProductListForCalculations.map((item) => ({
        lineItemId: item.productId,
        reasonCode: item.reasonCode,
        expectedReturnQuantity: item.availableQty,
        confirmedQuantity: item.confirmedQuantity,
        reasonForReturn: item.reasonForReturn,
        isShippingReturn: item.isReturnShipping ?? false,
      })),
    };
    const calculationReturnOrderReceipt = !RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_STATUS.includes(returnReceiptDetails.StatusCode ?? "")
      ? await getReturnOrderCalculationDetails(requestBody)
      : {
          returnSubTotal: 0,
          returnTaxCost: 0,
          returnShippingCost: 0,
          cultureCode: 0,
          discount: 0,
          csrDiscount: 0,
          returnShippingDiscount: 0,
          returnCharges: 0,
          voucherAmount: 0,
          returnTotal: 0,
        };
    const receiptDetailsResponse: IReturnReceiptData = {
      classNumber: returnReceiptDetails.ClassNumber as string,
      barCodeImage: barCodeDetails ? (barCodeDetails.BarcodeImage as string) : "",
      createdDate: convertDate(String(returnReceiptDetails.CreatedDate), generalSetting?.dateFormat, generalSetting?.displayTimeZone),
      classStateName: returnReceiptDetails.ClassStateName as string,
      linkedClassNumber: returnReceiptDetails.LinkedClassNumber as string,
      currencyCode: returnReceiptDetails.CurrencyCode as string,
      currencySuffix: returnReceiptDetails.CurrencySuffix as string,
      lineItemDetails: productDetails,
      costFactorResponse: convertCamelCase(returnReceiptDetails.CostFactorResponse),
      shippingAddress: formatted as string,
      billingAddress: address.billing as string,
      totalAmount: Number(RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_STATUS.includes(returnReceiptDetails.StatusCode ?? "") ? 0 : returnReceiptDetails.Total),
      totalQty: productDetails
        ?.reduce((total, item) => {
          if (isConfirmed) return total + Number(item.confirmedQuantity);
          return total + (Number(item.confirmedQuantity) ? Number(item.confirmedQuantity) : item.availableQty);
        }, 0)
        .toString(),
      notes: noteDetails,
      calculateSummary: calculationReturnOrderReceipt as IReturnCalculateResponse,
      priceRoundOff: Number(generalSetting.priceRoundOff),
    };
    return receiptDetailsResponse;
  } catch {
    return null;
  }
};
export async function createReturnOrder(requestBody: {
  orderNumber: string;
  returnStateCode: string;
  returnLineItems: IRequestProductReturnDetails[];
  note: string;
}): Promise<ICreateReturnResponse> {
  try {
    const response = await Returns_returns(
      requestBody.orderNumber,
      convertPascalCase({
        statusCode: requestBody.returnStateCode,
        returnLineItems: requestBody.returnLineItems,
        note: requestBody.note,
      })
    );
    if (response.IsSuccess) {
      return {
        classNumber: response.ClassNumber,
        isSuccess: true,
      };
    }
    return {
      isSuccess: false,
    };
  } catch {
    return {
      isSuccess: false,
    };
  }
}

export async function updatedReturnOrderDetails(requestBody: {
  returnNumber: string;
  returnStateCode: string;
  returnLineItems: IRequestProductReturnDetails[];
  note: string;
}): Promise<ICreateReturnResponse> {
  try {
    const response = await Returns_returnOrders(
      requestBody.returnNumber,
      convertPascalCase({
        returnStateCode: requestBody.returnStateCode,
        returnLineItems: requestBody.returnLineItems.filter((item) => item.quantity > 0),
        note: requestBody.note,
      })
    );
    if (response.IsSuccess) {
      return {
        classNumber: response.ClassNumber,
        isSuccess: true,
      };
    }
    return {
      isSuccess: false,
    };
  } catch {
    return {
      isSuccess: false,
    };
  }
}
export async function validateOrderNumberLineItemsDetails(requestBody: {
  orderNumber: string;
  returnStateCode: string;
  returnLineItems: IRequestProductReturnDetails[];
}): Promise<ICreateReturnResponse> {
  try {
    const request = {
      StatusCode: requestBody.returnStateCode,
      LineItemDetails: requestBody.returnLineItems.map((item) => ({ LineItemId: item.lineItemId, Quantity: item.quantity })),
    };
    const response = await Returns_validateReturn(requestBody.orderNumber, request);
    return { isSuccess: response.IsSuccess, classNumber: requestBody.orderNumber };
  } catch {
    return {
      isSuccess: false,
    };
  }
}

export async function getReturnOrderProductList(returnNumber: string): Promise<IReturnOrderProductList[]> {
  try {
    if (returnNumber) {
      const productList = await Returns_approvedDetailsV1ByOrderNumber(returnNumber);
      const generalSetting = await getGeneralSettingList();
      const returnResponse: IReturnOrderProductList[] = [];
      if (productList && productList.ReturnOrderLineItem && productList.ReturnOrderLineItem.length > 0) {
        productList.ReturnOrderLineItem.forEach((item) => {
          const attributes = convertCamelCase(item.Attributes ?? []) || [];
          let productType: string = getAttributeValue(attributes || [], "ProductType", "attributeValue") as string;
          let costs = convertCamelCase(item.LineItemCostFactor) || [];
          let shippingCost = getCostFactorByType(costs, "ShippingCost") || 0;
          let taxCost = getCostFactorByType(costs, "TaxCost");
          const isBundle = item.ProductType === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL;
          const isGroupProduct = item.ProductType === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL;
          if (item.ChildItemList && item.ChildItemList.length > 0 && !isBundle) {
            item.ChildItemList.forEach((childItem) => {
              costs = convertCamelCase(childItem.ChildLineItemCostFactor) || [];
              shippingCost = getCostFactorByType(costs, "ShippingCost") || 0;
              taxCost = getCostFactorByType(costs, "TaxCost");
              productType = getAttributeValue(convertCamelCase(childItem.Attributes) || [], "ProductType", "attributeValue") as string;
              const approvedProduct: IReturnOrderProductList = {
                productName: isGroupProduct
                  ? `<div><div class="font-semibold" data-test-selector="divParentProductName${item.SKU}">${item.ProductName ?? "-"}</div>
                      <div data-test-selector="divChildProduct${childItem.SKU}">${childItem.ProductName}</div> </div>`
                  : (childItem.ProductName as string),
                sku: childItem.SKU as string,
                returnNumber: item.ReturnNumber,
                status: childItem.StatusName as string,
                reasonForReturn: childItem.ReasonForReturn as string,
                trackingNumber: item.TrackingNumber,
                quantity: childItem.ConfirmedQuantity,
                price: Number(childItem.UnitPrice),
                taxCost: Number(taxCost),
                shippingCost: !childItem.IsReturnShipping ? 0 : Number(shippingCost),
                currencyCode: "",
                totalPrice: Number(childItem.TotalPrice),
                productId: String(childItem.ItemId),
                productDescription: getProductSpecificDescription(productType, convertCamelCase(childItem)),
                priceRoundOff: Number(generalSetting.priceRoundOff),
              };
              returnResponse.push(approvedProduct);
            });
          } else {
            const approvedProduct: IReturnOrderProductList = {
              productName: item.ProductName as string,
              sku: item.SKU as string,
              returnNumber: item.ReturnNumber,
              status: isBundle && item.ChildItemList && item.ChildItemList.length > 0 ? (item.ChildItemList[0].StatusName as string) : (item.StatusName as string),
              reasonForReturn: item.ReasonForReturn as string,
              trackingNumber: item.TrackingNumber,
              quantity: item.ConfirmedQuantity,
              price: Number(item.UnitPrice),
              taxCost: Number(taxCost),
              shippingCost: !item.IsShippingReturn ? 0 : Number(shippingCost),
              currencyCode: "",
              totalPrice: Number(item.TotalPrice),
              productId: String(item.LineItemId),
              productDescription: getProductSpecificDescription(String(item.ProductType), convertCamelCase(item)),
              priceRoundOff: generalSetting.priceRoundOff as number,
            };

            returnResponse.push(approvedProduct);
          }
        });
      }
      return returnResponse as IReturnOrderProductList[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function validateOrderNumber(orderNumber: string, stateCode: string, userId: number | null = null): Promise<ICreateReturnResponse> {
  try {
    if (orderNumber) {
      if (!userId) {
        const userDetails = await getSavedUserSession();
        userId = Number(userDetails?.userId);
      }
      const request = {
        StatusCode: stateCode,
        UserId: userId,
        LineItemDetails: [],
      };
      const response = await Returns_validation(orderNumber, request);
      if (response.IsSuccess) {
        return { isSuccess: response.IsSuccess, classNumber: orderNumber };
      }
      return { isSuccess: false };
    }
    return {
      isSuccess: false,
    };
  } catch {
    return {
      isSuccess: false,
    };
  }
}

export async function returnFilters() {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.MessageType, FilterOperators.Equals, "Order Notes");
  return filters.filterTupleArray;
}
