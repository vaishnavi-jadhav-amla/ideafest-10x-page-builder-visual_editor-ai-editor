import { IOrderDetails, IOrderLineItem } from "@znode/types/account";
import React, { useEffect, useState } from "react";
import { useCartDetails, useProduct, useUser } from "../../../../stores";

import { FormatPriceWithCurrencyCode } from "../../../common/format-price";
import { Heading } from "../../../common/heading";
import { IReorderRequestModel } from "@znode/types/order";
import { NavLink } from "../../../common/nav-link";
import { ORDER_ORIGIN } from "@znode/constants/cart";
import RenderPersonalizedItems from "../../../common/personalized-item/RenderPersonalizedItems";
import { formatTestSelector } from "@znode/utils/common";
import { reorderOrder } from "../../../../http-request";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";

interface IOrderSummaryData {
  orderSummaryData: IOrderLineItem[];
  isOrderStatus?: boolean;
  orderNumber: string;
  orderData: IOrderDetails | null;
  isFromOrderStatus?: boolean;
  priceRoundOff?: number;
}

const ReceiptOrderSummary: React.FC<IOrderSummaryData> = ({ orderSummaryData, isOrderStatus = false, orderNumber, orderData, isFromOrderStatus = false, priceRoundOff }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const orderTranslation = useTranslationMessages("Orders");
  const commonTranslation = useTranslationMessages("Common");
  const router = useRouter();
  const { error } = useToast();
  const { refreshCartItems } = useCartDetails();
  const {
    product: { cartCount },
  } = useProduct();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const reorderSingleLineOrderItem = async (itemId: string) => {
    const reorderRequestModel: IReorderRequestModel = {
      orderNumber: orderNumber,
      itemId: itemId,
      orderOrigin: ORDER_ORIGIN.WEBSTORE_ORDER_ORIGIN,
    };
    await reorderOrder(reorderRequestModel).then((reorderStatus) => {
      if (reorderStatus) {
        !cartCount && refreshCartItems();
        router.push("/cart");
      } else error(orderTranslation("reorderFailed"));
    });
  };

  const renderTableHeaders = () => (
    <div className={`grid ${getGridColumns()} gap-4 mb-8 sm:mb-0 sm:text-left text-base print:grid-cols-6`}>
      {" "}
      {["item", "status", "trackingNumber", "quantity", "itemPrice", "totalPrice"].map((column, index) => (
        <HeaderCell key={index + index * 2} label={commonTranslation(column)} />
      ))}
      {(!isOrderStatus || !isFromOrderStatus) && <HeaderCell label="" />}
    </div>
  );

  const getGridColumns = () => (isOrderStatus || isFromOrderStatus ? "grid-cols-6" : "grid-cols-7");
  const renderOrderListItems = () =>
    orderSummaryData.map((orderItem, index) => (
      <OrderItemRow
        key={orderItem.id + index}
        orderItem={orderItem}
        isMobile={isMobile}
        isOrderStatus={isOrderStatus}
        reorderSingleLineOrderItem={reorderSingleLineOrderItem}
        commonTranslation={commonTranslation}
        orderData={orderData}
        priceRoundOff={priceRoundOff}
        isFromOrderStatus={isFromOrderStatus}
      />
    ));

  return (
    <>
      {!isFromOrderStatus && <Heading name={orderTranslation("orderSummary")} level="h3" dataTestSelector="hdgOrderSummary" customClass="uppercase" showSeparator />}
      <div className="w-full">
        {!isMobile && renderTableHeaders()}
        {renderOrderListItems()}
      </div>
    </>
  );
};

const HeaderCell = ({ label }: { label: string }) => {
  return (
    <div className={`col-span-10 sm:col-span-1 order-table-row ${label === "Status" ? "print:ml-[2px]" : ""}`} data-test-selector={formatTestSelector("div", `${label}`)}>
      <p className="mb-0 font-semibold text-gray-600" data-test-selector={formatTestSelector("para", `${label}`)}>
        {label}
      </p>
    </div>
  );
};
interface OrderItemRowProps {
  orderItem: IOrderLineItem;
  isMobile: boolean;
  isOrderStatus: boolean;
  reorderSingleLineOrderItem: (_omsOrderLineItemsId: string) => Promise<void>;
  commonTranslation: (_key: string) => string;
  orderData: IOrderDetails | null;
  isFromOrderStatus?: boolean;
  priceRoundOff?: number;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({
  orderItem,
  orderData,
  isMobile,
  isOrderStatus,
  reorderSingleLineOrderItem,
  commonTranslation,
  isFromOrderStatus,
  priceRoundOff,
}) => {
  const { name, sku, description, quantity, price, id, currencyCode, orderLineItemStateName } = orderItem;
  const trackingNumber = orderData?.trackingNumber || "-";
  const getGridColumns = () => (isOrderStatus || isFromOrderStatus ? "grid-cols-6" : "grid-cols-7");
  const { user } = useUser();
  const isGuest = user?.userId && user.userId > 0 ? false : true;
  return (
    <div
      className={`grid print:grid-cols-6 ${
        isMobile ? "w-full flex border-b my-4 justify-between" : getGridColumns()
      } gap-4 sm:border-b border-zinc-300 sm:py-4 xs:text-end sm:text-left text-sm md:text-base print:text-[12px]`}
      data-test-selector={formatTestSelector("div", `OrderItemRow${id}`)}
    >
      <OrderItemCell
        label="Item"
        content={
          <>
            <span>{name}</span>
            {description ? <span className="block" dangerouslySetInnerHTML={{ __html: description }} /> : null}
          </>
        }
        sku={sku}
        isMobile={isMobile}
        personalizedContent={orderItem.personaliseValuesDetail}
        id={id}
      />
      <OrderItemCell label="Status" content={orderLineItemStateName || "-"} sku={sku} isMobile={isMobile} id={id} />
      <OrderItemCell label="TrackingNumber" content={trackingNumber} sku={sku} isMobile={isMobile} id={id} />
      <OrderItemCell label="Quantity" content={quantity.toString()} sku={sku} isMobile={isMobile} id={id} />
      <OrderItemCell
        label="ItemPrice"
        content={<FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={price || 0} currencyCode={currencyCode || "USD"} />}
        sku={sku}
        isMobile={isMobile}
        id={id}
      />
      <OrderItemCell
        label="TotalPrice"
        content={<FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={(price || 0) * quantity} currencyCode={currencyCode || "USD"} />}
        sku={sku}
        isMobile={isMobile}
        id={id}
      />
      {!isOrderStatus && !isGuest && !isFromOrderStatus && (
        <div className="print:hidden col-span-10 sm:col-span-1 no-print flex justify-between xs:col-span-10 sm:block pb-3">
          {isMobile && <p className="mb-0 font-semibold text-gray-600 sm:text-right">{commonTranslation("reorder")}</p>}
          <NavLink
            url="javascript:void(0)"
            className="w-full text-sm text-right underline text-linkColor hover:text-hoverColor no-print"
            onClick={(e) => {
              e.preventDefault();
              reorderSingleLineOrderItem(id);
            }}
            dataTestSelector={formatTestSelector("link", `Reorder${sku}`)}
            ariaLabel="Reorder link"
          >
            {commonTranslation("reorder")}
          </NavLink>
        </div>
      )}
    </div>
  );
};

interface IPersonalizedData {
  personalizeName?: string;
  personalizeValue?: string;
}

const OrderItemCell = ({
  label,
  content,
  sku,
  isMobile,
  personalizedContent,
  id,
}: {
  label: string;
  content: string | React.ReactNode;
  sku: string;
  isMobile: boolean;
  personalizedContent?: IPersonalizedData[];
  id?: string;
}) => (
  <div className={`xs:col-span-10 sm:col-span-1 ${isMobile ? "flex justify-between gap-14" : ""}`} data-test-selector={formatTestSelector("div", `${label}${sku}`)}>
    {isMobile && <MobileLabel label={label} />}
    <p
      className={`font-semibold ${isMobile ? "justify-self-end text-right" : "text-left"} custom-word-break print:text-[11px] print:leading-tight print:break-words`}
      data-test-selector={`para${label}${id}`}
    >
      {typeof content === "string" ? <span dangerouslySetInnerHTML={{ __html: content }} /> : content}
    </p>
    {personalizedContent && personalizedContent.length > 0 && <RenderPersonalizedItems data={personalizedContent} />}
  </div>
);

const MobileLabel = ({ label }: { label: string }) => <p className="w-1/3 mb-0 font-semibold text-left text-gray-600">{label}</p>;

export default ReceiptOrderSummary;
