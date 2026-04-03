import { httpRequest } from "../../base";
import { IVoucherResponse } from "@znode/types/account";

export const voucherHistoryList = async (props: { pageSize: number; pageIndex: number; sortValue: { [key: string]: string } }) => {
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(props.sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${props.pageIndex}`;
  sortQueryString += `&pageSize=${props.pageSize}`;
  const voucherCardList = await httpRequest<IVoucherResponse>({ endpoint: `/api/account/voucher/get-vouchers?${sortQueryString}` });
  return voucherCardList;
};

export const getVoucherDetails = async (props: { cardId: number; pageSize: number; pageIndex: number; sortValue: object; voucherNumber: string }) => {
  const { cardId, sortValue, pageIndex, pageSize, voucherNumber } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `${cardId ? `&cardId=${cardId}` : ""}`;
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&voucherNumber=${voucherNumber}`;

  const queryString = `${sortQueryString}`;
  const voucherDetails = await fetch(`/api/account/voucher/get-details?${queryString}`, { cache: "no-store" });
  const response = await voucherDetails.json();
  return response;
};
