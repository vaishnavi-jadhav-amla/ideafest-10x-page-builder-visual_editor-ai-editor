import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IVoucher, IVoucherDetailsResponse, IVoucherList, IVoucherResponse, IVouchers } from "@znode/types/account";
import { Vouchers_historyByVoucherNumber, Vouchers_vouchers } from "@znode/clients/v2";

import { FilterTuple } from "@znode/clients/v1";
import { IFilterTuple } from "@znode/types/filter";
import { IGeneralSetting } from "@znode/types/general-setting";
import { VoucherCard } from "@znode/types/enums";
import { convertCamelCase } from "@znode/utils/server";
import { convertDateTime } from "@znode/utils/component";
import { getGeneralSettingList } from "../../general-setting/general-setting";
import { getPortalData } from "../../product/product";
import { getUserFilters } from "../../common/common";

//Get voucher history list.
export async function getVoucherHistory(pageSize: number, pageIndex: number, sortValue: { [key: string]: string }, userId: number): Promise<IVoucherResponse> {
  try {
    const portalDetails= await getPortalData();
    const filters: IFilterTuple[] = getUserFilters(portalDetails.portalId, undefined, userId, VoucherCard.IsActive);

    const voucherList = await Vouchers_vouchers(filters as FilterTuple[], sortValue, pageIndex, pageSize, String(userId));
    const voucherListResponse = {
      voucherHistoryList: [],
      pageIndex: 0,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
    };
    if (voucherList && voucherList.GiftCardList && voucherList.GiftCardList.length > 0) {
      const voucherListData = await extractRelevantVoucherCardData(voucherList.GiftCardList);
      const paginationDetails = voucherList?.PaginationDetail;
      return {
        voucherHistoryList: voucherListData,
        pageIndex: paginationDetails?.PageIndex as number,
        pageSize: paginationDetails?.PageSize as number,
        totalPages: paginationDetails?.TotalPages as number,
        totalResults: paginationDetails?.TotalResults as number,
      };
    }
    return voucherListResponse;
  } catch (error) {
    logServer.error(AREA.VOUCHER, errorStack(error));
    return {
      voucherHistoryList: [],
      pageIndex: 0,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
    };
  }
}
async function extractRelevantVoucherCardData(giftCardList: IVoucher[]): Promise<IVouchers[]> {
  if (giftCardList.length > 0) {
    const generalSetting = await getGeneralSettingList();
    const currentDate = convertDateTime( new Date().toString(), generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone);
    const result = giftCardList.map((giftCard: IVoucher) => ({
      name: giftCard.Name as string,
      cardNumber: giftCard.CardNumber as string,
      startDate: convertDateTime(giftCard.StartDate?.toString() || "", generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone),
      expirationDate: convertDateTime(
        giftCard.ExpirationDate?.toString() || "",
        generalSetting?.dateFormat,
        generalSetting?.timeFormat,
        generalSetting?.displayTimeZone
      ),
      amount: giftCard.Amount ?? 0,
      remainingAmount: giftCard.RemainingAmount ?? 0,
      giftCardId: giftCard.GiftCardId ?? 0,
      currentDate: currentDate
    }));
    return result;
  }
  return [];
}
//Get list of Voucher details and history for a user.
export async function getVoucherDetails(
  giftCardId: number,
  userId: number,
  portalId: number,
  pageSize?: number,
  pageIndex?: number,
  sortValue?: { [key: string]: string },
  voucherNumber?: string
): Promise<IVoucherDetailsResponse> {
  try {
    const voucherListResponse = {
      voucherHistoryList: [],
      voucherCard: null,
      pageIndex: 1,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
    };
    if (userId && giftCardId) {
      const filters: IFilterTuple[] = getUserFilters(portalId, undefined, userId, undefined, undefined, giftCardId);

      const voucher = await Vouchers_historyByVoucherNumber(voucherNumber as string, filters as FilterTuple[], sortValue, pageIndex, pageSize);
      const voucherDetails = convertCamelCase(voucher);
      const generalSetting = await getGeneralSettingList();
      const voucherCardDetails = voucherDetails.giftCard
        ? {
            cardNumber: voucherDetails.giftCard.cardNumber,
            remainingAmount: voucherDetails.giftCard.remainingAmount,
            currencyCode: voucherDetails.giftCard.currencyCode,
            name: voucherDetails.giftCard.name,
            originalAmount: voucherDetails.giftCard.amount,
            startDate: convertDateTime(voucherDetails.giftCard.startDate, generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone),
            expirationDate: convertDateTime(voucherDetails.giftCard.expirationDate, generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone),
          }
        : null;
      if (userId !== voucherDetails?.giftCard?.userId || voucherDetails?.hasError || !voucherDetails) {
        return voucherListResponse;
      }
      const voucherListData = extractRelevantVoucherDetails(voucherDetails.giftCardHistoryList as IVoucherList[], generalSetting);
      return {
        voucherCard: voucherCardDetails,
        voucherHistoryList: voucherListData,
        pageIndex: voucherDetails.paginationDetail.pageIndex,
        pageSize: voucherDetails.paginationDetail.pageSize,
        totalPages: voucherDetails.paginationDetail.totalPages,
        totalResults: voucherDetails.paginationDetail.totalResults,
      };
    }
    return voucherListResponse;
  } catch (error) {
    logServer.error(AREA.VOUCHER, errorStack(error));
    return { voucherHistoryList: [], voucherCard: null, pageIndex: 1, pageSize: 0, totalPages: 0, totalResults: 0 };
  }
}

function extractRelevantVoucherDetails(giftHistoryCardList: IVoucherList[], generalSetting: IGeneralSetting) {
  return giftHistoryCardList?.map((giftCard: IVoucherList) => ({
    orderNumber: giftCard.orderNumber,
    transactionDate: convertDateTime(giftCard.transactionDate, generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone),
    notes: giftCard.notes,
    transactionAmount: giftCard.transactionAmount,
    omsOrderId: giftCard.omsOrderId,
  }));
}
