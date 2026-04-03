"use client";

import "../../../common/table/rc-table.scss";

import { IOrder, IOrderFilters } from "@znode/types/account/order";
import InvoiceMe, { IRecord } from "../../../checkout/payment/payment-internal/InvoiceMe";
import React, { useCallback, useEffect, useState } from "react";
import { getOrderTypeDetails, getUserSettings, reorderOrder } from "../../../..//http-request";
import { useCartDetails, useCheckout, useModal, useToast } from "../../../../stores";
import { usePathname, useRouter } from "next/navigation";

import { ATTRIBUTE } from "@znode/constants/attribute";
import Button from "../../../common/button/Button";
import { FormatPriceWithCurrencyCode } from "../../../common/format-price";
import GenerateInvoiceComponent from "./GenerateInvoice";
import HeaderSort from "../../../common/header-sort/HeaderSort";
import { Heading } from "../../../common/heading";
import { IReorderRequestModel } from "@znode/types/order";
import { IUserSignUp } from "@znode/types/user";
import Link from "next/link";
import { Modal } from "../../../common/modal/Modal";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { ORDER_ORIGIN } from "@znode/constants/cart";
import OrderHistoryFilter from "./OrderHistoryFilter";
import { PAYMENT_SUBTYPE } from "@znode/constants/payment";
import Pagination from "../../../common/pagination/Pagination";
import PaymentApplicationLoader from "../../../common/loader-component/PaymentApplicationLoader";
import { QUOTE_STATUS } from "@znode/constants/quote";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../../common/table/TableWrapper";
import { Tooltip } from "../../../common/tooltip";
import { ZIcons } from "../../../common/icons";
import useOrderData from "../hooks/useOrderHistory";
import { useTranslations } from "next-intl";
import useUserStore from "../../../../stores/user-store";
import { validateOrderNumberAndLineItems } from "../../../../http-request/order/order";

interface ICurrentRecord {
  remainingOrderAmount: number;
  orderNumber: string;
  total: number;
}

export function OrderHistory({ isInvoiceBtnEnabled = true, isDashboard, priceRoundOff }: Readonly<{ isInvoiceBtnEnabled?: boolean; isDashboard?: boolean; priceRoundOff:number }>) {
  const orderHistoryTranslation = useTranslations("OrderHistory");
  const paymentTranslation = useTranslations("Payment");
  const commonTranslation = useTranslations("Common");
  const [column, setColumn] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [sortValue, setSortValue] = useState<Record<string, string>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const { error } = useToast();
  const [currentFilters, setCurrentFilters] = useState<{ accountId: number | null; statusAndDateFilter: IOrderFilters[] }>({
    accountId: null,
    statusAndDateFilter: [],
  });
  const [showModel, setShowModel] = useState<boolean>(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IRecord>();
  const { setShippingAddressId, setBillingAddressId } = useCheckout();
  const { refreshCartSummary, refreshCartItems } = useCartDetails();
  const router = useRouter();
  const { user } = useUserStore();
  const currentPath = usePathname();
  const isOrderInURL = currentPath.includes("order");
  const { openModal } = useModal();
  const [userSetting, setUserSetting] = useState<IUserSignUp>();

  const getUserSettingDetails = async () => {
    const userSettings = await getUserSettings();
    setUserSetting(userSettings);
  };

  useEffect(() => {
    getUserSettingDetails();
  }, []);

  const enableReturnOrderRequest = userSetting?.globalAttributes?.some(
    (attr) => attr.attributeCode === SETTINGS.ENABLE_RETURN_ORDER_REQUEST && attr.attributeValue === ATTRIBUTE.TRUE_VALUE
  );

  const validateOrderDetails = async (orderNumber: string, returnStateCode: string) => {
    const request = {
      orderNumber: orderNumber,
      userId: Number(user?.userId),
      returnStateCode: returnStateCode,
    };
    const result = await validateOrderNumberAndLineItems(request);
    if (result.isSuccess) {
      router.push(`/account/return-order/create?orderNumber=${result.classNumber}`);
    } else {
      error(commonTranslation("eligibleOrder"));
    }
  };

  const { orderHistoryData, loading } = useOrderData({
    pageSize,
    pageIndex,
    sortValue,
    currentFilters: currentFilters.statusAndDateFilter,
    accountId: currentFilters.accountId,
  });

  const onPageSizeChange = (newPageSize: number) => {
    setPageIndex(1);
    setPageSize(newPageSize);
  };

  const onPageIndexChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const handleSelectRow = (orderId: string) => {
    if (selectedRowKeys.includes(orderId)) {
      setSelectedRowKeys(selectedRowKeys.filter((id) => id !== orderId));
    } else {
      setSelectedRowKeys([...selectedRowKeys, orderId]);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = orderHistoryData?.orders?.map((order: IOrder) => order.orderNumber) || [];
      setSelectedRowKeys(allIds);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const onFilterChange = useCallback(
    (filters: { key: string; value: string; type: string; columns: { status: string; date: string } }[], accountId: number | null) => {
      setCurrentFilters({ statusAndDateFilter: filters, accountId });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSubmitInvoicePay = async (selectedOption: IRecord) => {
    setCurrentRecord(selectedOption);
    const orderNumber = String(selectedOption.orderNumber);
    const orderDetailsData = await getOrderTypeDetails({ orderType: ORDER_DATA_TYPE.ORDER, orderNumber: orderNumber });
    const orderDetails = orderDetailsData.data;
    selectedOption.remainingOrderAmount = orderDetailsData.data.remainingOrderAmount;

    setShippingAddressId(orderDetails.shippingAddress.addressId);
    setBillingAddressId(orderDetails.billingAddress.addressId);

    setShowModel(true);
    openModal("invoiceMeModal");
    document.body.classList.add("overflow-hidden");
  };

  const columns = [
    ...(isInvoiceBtnEnabled
      ? [
          {
            title: (
              <input
                type="checkbox"
                checked={orderHistoryData?.orders && orderHistoryData.orders.length > 0 && selectedRowKeys.length === (orderHistoryData.orders.length || 0)}
                onChange={handleSelectAll}
                aria-label="Select all"
                data-test-selector="chkSelectAll"
              />
            ),
            dataIndex: "select",
            key: "select",
            width: 50,
            class: "text-center",
            render: (_: void, record: IOrder) => (
              <input
                type="checkbox"
                aria-label="Select row"
                checked={selectedRowKeys.includes(record.orderNumber)}
                onChange={() => handleSelectRow(record.orderNumber)}
                data-test-selector={`chkSelectRow${record.orderNumber}`}
              />
            ),
            displayOnMobile: true,
          },
        ]
      : []),
    {
      title: <HeaderSort currentSortColumn={column} columnName={orderHistoryTranslation("orderNumber")} headerKey="classNumber" onSort={onColumnSort} />,
      dataIndex: "orderNumber",
      key: "classNumber",
      width: 400,
      displayOnMobile: true,
      heading: orderHistoryTranslation("orderNumber"),
      render: (orderNumber: string, record: IOrder) => {
        const isOffline =
          record?.subTypeCode &&
          (record?.subTypeCode.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase() || record?.subTypeCode.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase())
            ? true
            : false;
        const redirectURL = isOrderInURL
          ? `details/${record.orderNumber}?receiptModule=true${isOffline ? "&isOfflinePayment=true" : ""}`
          : `order/details/${record.orderNumber}?receiptModule=true${isOffline ? "&isOfflinePayment=true" : ""}`;
        return (
          <Link href={redirectURL} className="underline text-linkColor hover:text-hoverColor" data-test-selector={`linkOrderNumber${record.orderNumber}`}>
            {orderNumber}
          </Link>
        );
      },
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="classStatus" columnName={orderHistoryTranslation("orderStatus")} onSort={onColumnSort} />,
      dataIndex: "orderState",
      key: "classStatus",
      width: 300,
      heading: orderHistoryTranslation("orderStatus"),
      render: (classStatus: string, record: IOrder) => <span data-test-selector={`spnOrderStatus${record.orderNumber}`}>{classStatus}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="paymentStatus" columnName={orderHistoryTranslation("paymentStatus")} onSort={onColumnSort} />,
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 300,
      heading: orderHistoryTranslation("paymentStatus"),
      render: (paymentStatus: string, record: IOrder) => (
        <span className="capitalize" data-test-selector={`spnPaymentStatus${record.orderNumber}`}>
          {paymentStatus.toLowerCase()}
        </span>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="paymentName" columnName={orderHistoryTranslation("paymentType")} onSort={onColumnSort} />,
      dataIndex: "paymentDisplayName",
      key: "paymentName",
      width: 300,
      heading: orderHistoryTranslation("paymentType"),
      render: (paymentName: string, record: IOrder) => <span data-test-selector={`spnPaymentType${record.orderNumber}`}>{paymentName}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="orderDate" columnName={orderHistoryTranslation("orderDate")} onSort={onColumnSort} />,
      dataIndex: "orderDate",
      key: "orderDate",
      width: 300,
      heading: orderHistoryTranslation("orderDate"),
      displayOnMobile: true,
      render: (date: string, record: IOrder) => {
        if (!date) {
          return null;
        }
        return <span data-test-selector={`spnOrderDate${record.orderNumber}`}>{date.split(" ")[0]}</span>;
      },
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="totalAmount" columnName={orderHistoryTranslation("orderAmount")} onSort={onColumnSort} />,
      dataIndex: "total",
      key: "totalAmount",
      width: 300,
      showCurrencyCode: true,
      heading: orderHistoryTranslation("orderAmount"),
      render: (total: number, record: IOrder) => (
        <span data-test-selector={`spnTotalAmount${record.orderNumber}`}>
          <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={total || 0} currencyCode={record?.currencyCode || "USD"} />
        </span>
      ),
    },
    {
      title: <div>{orderHistoryTranslation("actions")}</div>,
      dataIndex: "",
      key: "actions",
      width: 200,
      heading: orderHistoryTranslation("actions"),
      align: "left",
      render: (record: IOrder) => renderAction(record),
    },
  ];

  const reorderCompleteOrder = async (orderId: string) => {
    const reorderRequestModel: IReorderRequestModel = {
      orderNumber: orderId,
      orderOrigin: ORDER_ORIGIN.WEBSTORE_ORDER_ORIGIN,
    };
    await reorderOrder(reorderRequestModel).then((reorderStatus) => {
      if (reorderStatus) {
        refreshCartItems();
        refreshCartSummary();
        router.push("/cart");
      } else error(orderHistoryTranslation("reorderFailed"));
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: string[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const renderAction = (record: IOrder) => {
    const isOffline =
      record?.subTypeCode &&
      (record?.subTypeCode.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase() || record?.subTypeCode.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase())
        ? true
        : false;
    const redirectURL = isOrderInURL
      ? `details/${record.orderNumber}?receiptModule=true${isOffline ? "&isOfflinePayment=true" : ""}`
      : `order/details/${record.orderNumber}?receiptModule=true${isOffline ? "&isOfflinePayment=true" : ""}`;
    return (
      <div className="flex justify-start items-center gap-2">
        <Button type="text" size="small" dataTestSelector={`btnView${record.orderNumber}`} onClick={() => router.push(redirectURL)}>
          <Tooltip message={orderHistoryTranslation("view")}>
            <ZIcons name="eye" data-test-selector={`svgView${record.orderNumber}`} />
          </Tooltip>
        </Button>

        <Button type="text" size="small" dataTestSelector={`btnReorder${record.orderNumber}`} onClick={() => reorderCompleteOrder(record.orderNumber)}>
          <Tooltip message={orderHistoryTranslation("reorder")}>
            <ZIcons name="shopping-cart" fill="black" data-test-selector={`svgReorder${record.orderNumber}`} />
          </Tooltip>
        </Button>

        {record?.orderState !== QUOTE_STATUS.QUOTE_STATUS_CANCELED.toUpperCase() &&
          record?.subTypeCode &&
          (record?.subTypeCode.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase() || record?.subTypeCode.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase()) &&
          isInvoiceBtnEnabled && (
            <Button
              dataTestSelector={`btnPayInvoice${record.orderNumber}`}
              className={Number(record?.remainingOrderAmount) <= 0 ? "py-0 px-0 border-none cursor-not-allowed" : "py-0 px-0 border-none cursor-pointer"}
              disabled={Number(record?.remainingOrderAmount) <= 0}
              onClick={() => handleSubmitInvoicePay(record)}
              ariaLabel="pay invoice button"
            >
              <Tooltip message={paymentTranslation("payInvoice")}>
                <ZIcons name="dollar-sign" data-test-selector={`svgPayInvoice${record.orderNumber}`} />
              </Tooltip>
            </Button>
          )}
        {!isDashboard && enableReturnOrderRequest && (
          <Button type="text" size="small" dataTestSelector={`btnReorder${record.orderNumber}`} onClick={() => validateOrderDetails(record.orderNumber ?? "", record.statusCode)}>
            <Tooltip message={orderHistoryTranslation("return")}>
              <ZIcons name="undo-2" data-test-selector={`svgReorder${record.orderNumber}`} />
            </Tooltip>
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {isInvoiceBtnEnabled ? (
        <>
          <Heading name={orderHistoryTranslation("orderHistory")} level="h1" dataTestSelector="hdgOrderHistory" customClass="uppercase" showSeparator />
          <div className="sm:flex justify-between items-center">
            <OrderHistoryFilter isInvoiceBtnShow={isInvoiceBtnEnabled} onFilterChange={onFilterChange} />
            <GenerateInvoiceComponent selectedOrders={selectedRowKeys} />
          </div>
        </>
      ) : null}
      <div className="no-print">
        {showModel && (
          <div>
            <Modal modalId="invoiceMeModal" maxHeight="lg" size="4xl" customClass="overflow-y-auto w-full">
              <InvoiceMe currentRecord={currentRecord as ICurrentRecord} setPaymentProcessing={setIsPaymentProcessing} />
            </Modal>
          </div>
        )}
        <PaymentApplicationLoader isPaymentProcessing={isPaymentProcessing} />

        <TableWrapper
          renderAction={renderAction}
          columns={columns as []}
          loading={loading}
          expandedRowByKey="OmsOrderId"
          data={orderHistoryData?.orders as []}
          rowSelection={rowSelection}
        />
        {orderHistoryData?.totalResults && isInvoiceBtnEnabled ? (
          <Pagination totalResults={orderHistoryData?.totalResults || 0} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />
        ) : null}
      </div>
    </div>
  );
}
