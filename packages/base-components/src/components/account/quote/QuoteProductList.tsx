"use client";

import { useEffect, useState } from "react";

import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import { IOrderLineItems } from "@znode/types/account";
import Image from "next/image";
import RenderPersonalizedItems from "../../common/personalized-item/RenderPersonalizedItems";
import { formatTestSelector } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";

export const QuoteProductList = ({ productList }: { productList: IOrderLineItems[] }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const quoteTranslations = useTranslationMessages("Quote");
  const commonTranslations = useTranslationMessages("Common");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderTableHeaders = () => (
    <div className="grid grid-cols-5 gap-4 mb-8 sm:mb-0 sm:text-left text-base">
      {["productImage","item", "quantity", "itemPrice", "totalPrice"].map((column, index) => (
        <HeaderCell key={index + index * 2} label={commonTranslations(column)} />
      ))}
    </div>
  );

  const renderOrderListItems = () => productList.map((orderItem, index) => <OrderItemRow key={`${orderItem?.cartItemId}${index}`} orderItem={orderItem} isMobile={isMobile} />);

  return (
    <>
      <Heading name={quoteTranslations("productInQuote")} level="h3" dataTestSelector="hdgProductInQuote" customClass="uppercase" showSeparator={true} />
      <div className="w-full">
        {!isMobile && renderTableHeaders()}
        {renderOrderListItems()}
      </div>
    </>
  );
};

const HeaderCell = ({ label }: { label: string }) => {
  return (
    <div className="col-span-10 sm:col-span-1" data-test-selector={formatTestSelector("div", `${label}`)}>
      <p className="mb-0 font-semibold text-gray-600" data-test-selector={formatTestSelector("para", `${label}`)}>
        {label}
      </p>
    </div>
  );
};

interface OrderItemRowProps {
  orderItem: IOrderLineItems;
  isMobile: boolean;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({ orderItem, isMobile, }) => {
  const { productImageUrl, productName, sku, productDescription, quantity, unitPrice, totalPrice, currencyCode } = orderItem;

  return (
    <div
      className={`grid ${isMobile ? "w-full flex border-b my-4 justify-between" : "grid-cols-5"} gap-4 sm:separator-xs sm:py-4 xs:text-end sm:text-left text-sm md:text-base`}
      data-test-selector={formatTestSelector("div", `OrderItemRow${sku}`)}
    >
      <OrderItemCell
        label="ProductImage"
        content={<>{productImageUrl ? <Image src={productImageUrl} width={60} height={60} alt={`${productName}-${sku}`} priority={true} /> : null}</>}
        sku={sku}
        isMobile={isMobile}
      />
      <OrderItemCell
        label="Item"
        content={
          <>
            <span>{productName}</span>
            {productDescription ? <p dangerouslySetInnerHTML={{ __html: productDescription }} /> : null}
          </>
        }
        sku={sku}
        isMobile={isMobile}
      />
      <OrderItemCell label="Quantity" content={quantity?.toString()} sku={sku} isMobile={isMobile} />
      <OrderItemCell label="ItemPrice" content={<FormatPriceWithCurrencyCode price={unitPrice ?? 0} currencyCode={currencyCode ?? "USD"} />} sku={sku} isMobile={isMobile} />
      <OrderItemCell
        label="TotalPrice"
        content={
          <div className="pb-3 sm:pb-0">
            <FormatPriceWithCurrencyCode price={totalPrice || 0} currencyCode={currencyCode ?? "USD"} />
          </div>
        }
        sku={sku}
        isMobile={isMobile}
      />
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
}: {
  label: string;
  content: string | React.ReactNode;
  sku?: string;
  isMobile: boolean;
  personalizedContent?: IPersonalizedData[];
}) => (
  <div className={`xs:col-span-10 sm:col-span-1 ${isMobile ? "flex justify-between gap-14" : ""} sm:block`} data-test-selector={formatTestSelector("div", `OrderItemCell${sku}`)}>
    {isMobile && <MobileLabel label={label} />}
    <p className={`font-semibold ${isMobile ? "justify-self-end" : ""} text-left`} data-test-selector={`para${label}${sku}`}>
      {typeof content === "string" ? <p dangerouslySetInnerHTML={{ __html: content }} /> : content}
    </p>
    {personalizedContent && personalizedContent.length > 0 && <RenderPersonalizedItems data={personalizedContent} />}
  </div>
);

const MobileLabel = ({ label }: { label: string }) => <p className="w-1/3 mb-0 font-semibold text-left text-gray-600">{label}</p>;
