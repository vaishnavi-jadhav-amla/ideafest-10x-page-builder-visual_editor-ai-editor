"use client";

import { IVoucherResponse, IVouchers } from "@znode/types/account";
import { useEffect, useState } from "react";

import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import HeaderSort from "../../common/header-sort/HeaderSort";
import Heading from "../../common/heading/Heading";
import Link from "next/link";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { useTranslations } from "next-intl";
import { voucherHistoryList } from "../../../http-request/account/voucher/voucher";

interface IRecordType {
  currencyCode?: string;
  giftCardId?: number;
  cardNumber?: number;
  key?: number;
}

export const VoucherHistory = () => {
  const voucherTranslations = useTranslations("Voucher");
  const commonTranslations = useTranslations("Common");
  const [voucherHistoryData, setVoucherHistoryData] = useState<IVoucherResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [sortValue, setSortValue] = useState({});
  const [column, setColumn] = useState<string>("");

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const columns = [
    {
      title: <HeaderSort currentSortColumn={column} headerKey="Name" columnName={voucherTranslations("voucherName")} onSort={onColumnSort} />,
      dataIndex: "name",
      width: 100,
      heading: voucherTranslations("voucherName"),
      key: "name",
      displayOnMobile: true,
      render: (name: string, record: IRecordType) => (
        <Link
          href={`/account/voucher/details/${record?.giftCardId}?voucherNumber=${record?.cardNumber}`}
          className="underline text-linkColor hover:text-hoverColor"
          data-test-selector={`linkVoucherName${record?.cardNumber}`}
        >
          {name}
        </Link>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="CardNumber" columnName={voucherTranslations("voucherNumber")} onSort={onColumnSort} />,
      dataIndex: "cardNumber",
      key: "cardNumber",
      width: 100,
      heading: voucherTranslations("voucherNumber"),
      render: (cardNumber: string, record: IRecordType) => <span data-test-selector={`spnVoucherNumber${record?.cardNumber}`}>{cardNumber || "-"}</span>,
    },

    {
      title: <HeaderSort currentSortColumn={column} headerKey="StartDate" columnName={voucherTranslations("startDate")} onSort={onColumnSort} />,
      dataIndex: "startDate",
      key: "startDate",
      width: 100,
      heading: voucherTranslations("startDate"),
      render: (startDate: string, record: IRecordType) => <span data-test-selector={`spnStartDate${record?.cardNumber}`}>{startDate || "-"}</span>,
    },

    {
      title: <HeaderSort currentSortColumn={column} headerKey="ExpirationDate" columnName={voucherTranslations("expirationDate")} onSort={onColumnSort} />,
      dataIndex: "expirationDate",
      key: "expirationDate",
      width: 100,
      heading: voucherTranslations("expirationDate"),
      render: (expirationDate: string, record: IRecordType) => <span data-test-selector={`spnExpirationDate${record?.cardNumber}`}>{expirationDate || "-"}</span>,
      displayOnMobile: true,
    },

    {
      title: <HeaderSort currentSortColumn={column} headerKey="Amount" columnName={voucherTranslations("transactionAmount")} onSort={onColumnSort} />,
      dataIndex: "amount",
      width: 100,
      showCurrencyCode: true,
      heading: voucherTranslations("transactionAmount"),
      key: "amount",
      render: (amount: number, record: IRecordType) => (
        <div data-test-selector={`divTransactionAmount${record?.cardNumber}`}>
          <FormatPriceWithCurrencyCode price={amount || 0} currencyCode={record?.currencyCode ?? "USD"} />
        </div>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="RemainingAmount" columnName={voucherTranslations("remainingAmount")} onSort={onColumnSort} />,
      dataIndex: "remainingAmount",
      width: 100,
      key: "remainingAmount",
      showCurrencyCode: true,
      heading: voucherTranslations("remainingAmount"),
      render: (remainingAmount: number, record: IRecordType) => (
        <div data-test-selector={`divRemainingAmount${record?.cardNumber}`}>
          <FormatPriceWithCurrencyCode price={remainingAmount || 0} currencyCode={record?.currencyCode ?? "USD"} />
        </div>
      ),
    },
    {
      title: <div className="text-center">{commonTranslations("actions")}</div>,
      dataIndex: "giftCardId",
      width: 50,
      heading: "",
      key: "actions",
      render: (giftCardId: number, record: { cardNumber: string }) => (
        <div className="flex justify-center">
          <Link
            href={`/account/voucher/details/${giftCardId}?voucherNumber=${record.cardNumber}`}
            className="px-2"
            aria-label={"Voucher Link"}
            data-test-selector={`linkViewVoucher${record?.cardNumber}`}
          >
            <Tooltip message={commonTranslations("view")}>
              <ZIcons name="eye" data-test-selector={`svgViewVoucher${record?.cardNumber}`} />
            </Tooltip>
          </Link>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: IVoucherResponse = await voucherHistoryList({ pageSize: pageSize, pageIndex: pageIndex, sortValue });
      if (data?.voucherHistoryList?.length > 0) {
        setVoucherHistoryData(data);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex, sortValue]);

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setLoading(true);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
    setLoading(true);
  };

  const voucherCardList = (voucherHistoryData && voucherHistoryData.voucherHistoryList) || [];
  const totalRemainingAmount = voucherCardList.reduce((acc: number, item: IVouchers) => {
   if (item.expirationDate) {
    const expiry = new Date(item.expirationDate);    
    const todayDate =item.currentDate ? new Date(item.currentDate) : new Date();
        if (!isNaN(expiry.getTime()) && !isNaN(todayDate.getTime()) && expiry >= todayDate) {
      return acc + (item.remainingAmount ?? 0);
    }
  }
  return acc;
  }, 0);

  const currencyCode = voucherCardList && voucherCardList.length > 0 ? voucherCardList[0]?.currencyCode : "";

  const renderAction = (record: IVouchers) => {
    return (
      <div className="flex">
        <Link href={`/account/voucher/details/${record.giftCardId}`} className="mr-2" aria-label={"Voucher Link"} data-test-selector="viewGiftCardHistory">
          <ZIcons name="eye" />
        </Link>
      </div>
    );
  };

  return (
    <>
      <Heading name={voucherTranslations("voucherHistory")} dataTestSelector="hdgVoucherHistory" customClass="uppercase" level="h1" showSeparator />
      {totalRemainingAmount > 0 ? (
        <div className={"text-left text-lg font-semibold"} data-test-selector="totalRemainingAmount">
          {voucherTranslations("totalRemainingActiveVoucher")} : <FormatPriceWithCurrencyCode price={totalRemainingAmount ?? 0} currencyCode={currencyCode ?? "USD"} />
        </div>
      ) : null}
      <TableWrapper renderAction={renderAction} columns={columns as []} loading={loading} expandedRowByKey="giftCardId" data={voucherCardList as []} />
      {voucherCardList && voucherCardList.length > 0 && (
        <Pagination totalResults={String(voucherHistoryData?.totalResults)} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />
      )}
    </>
  );
};
