"use client";

import React, { ChangeEvent, useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { CustomImage } from "../../common/image";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { ITemplateCartItems } from "@znode/types/account";
import Input from "../../common/input/Input";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { Separator } from "../../common/separator";
import { ValidationMessage } from "../../common/validation-message";
import { useTranslationMessages } from "@znode/utils/component";
import { decodeString } from "@znode/utils/common";

interface ICartTemplateRowParams {
  templateItem: ITemplateCartItems;
  // eslint-disable-next-line no-unused-vars
  handleQuantityChange: (arg1: string, args2: string) => void;
  index: number;
  // eslint-disable-next-line no-unused-vars
  removeItem: (args1: string) => void;
  loadingItemIds: Set<string>;
  loadingRemoveItem: Set<string>;
}

const OrderTemplateItem = (props: ICartTemplateRowParams) => {
  const { templateItem, handleQuantityChange, removeItem, loadingItemIds, loadingRemoveItem } = props;

  const commonTranslation = useTranslationMessages("Common");
  const behaviorTranslations = useTranslationMessages("BehaviorMsg");

  const [lineItemQuantity, setLineItemQuantity] = useState<number>();

  const updateTemplateItemQuantity = (event: ChangeEvent<HTMLInputElement>) => {
    handleQuantityChange(event.target.value, templateItem.itemId);
  };

  const handleRemoveItem = () => {
    if (templateItem?.itemId) removeItem(templateItem.itemId);
  };

  const checkInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numberPattern = /^\d+$/;
    const text = event.target.value;
    if (!numberPattern.test(text)) {
      event.target.value = text.replace(/\D/g, "");
    }
  };

  useEffect(() => {
    if (templateItem) setLineItemQuantity(templateItem.quantity);
  }, [templateItem]);

  if (!templateItem) {
    return null;
  }
  return (
    <>
      <div className="grid items-start grid-cols-12 sm:grid-cols-9 xl:grid-cols-10 px-2" key={templateItem.publishProductId}>
        <div className="w-32 h-32 col-span-5 p-2 mr-2 pb-0 sm:col-span-1 md:w-16 md:h-16 min-[1400px]:w-[4.5rem] min-[1400px]:h-[4.5rem]">
          <CustomImage
            src={templateItem.imagePath}
            alt={templateItem.productName}
            dataTestSelector={`imgProduct${templateItem.publishProductId}`}
            className="object-contain w-24 h-full sm:w-14 sm:h-14 xl:w-[4.5rem] xl:h-[4.5rem]"
            width={50}
            height={50}
          />
        </div>
        <div className="grid grid-cols-12 col-span-7 p-2 sm:col-span-8 xl:col-span-9">
          <div className="col-span-12 font-semibold sm:col-span-6 text-md">
            <Link href={decodeString(templateItem.productLink)} data-test-selector={`linkProductName${templateItem.publishProductId}`}>
              <p className="text-base font-semibold">{templateItem.productName}</p>
            </Link>
            {templateItem.productType === PRODUCT_TYPE.BUNDLE_PRODUCT && templateItem.cartDescription && (
              <p className="text-sm font-medium mb-2" data-test-selector={`paraChildProductDescription${templateItem.publishProductId}`}>
                <div dangerouslySetInnerHTML={{ __html: templateItem.cartDescription }} className="break-words"></div>
              </p>
            )}
            <div className="hidden sm:block">
              <Button
                type="link"
                size="small"
                className="p-0"
                dataTestSelector={`btnRemove${templateItem.publishProductId}`}
                ariaLabel="template item remove button"
                onClick={() => {
                  handleRemoveItem();
                }}
              >
                {loadingRemoveItem.has(templateItem.itemId || "") ? (
                  <LoaderComponent isLoading={loadingRemoveItem.has(templateItem.itemId || "")} width="15px" height="15px" />
                ) : (
                  <span>{commonTranslation("remove")}</span>
                )}
              </Button>
            </div>
          </div>
          <div className="flex sm:block col-span-12 mt-2 sm:col-span-2 sm:mt-0 sm:justify-self-center sm:items-start">
            <p className="font-semibold capitalize flex sm:block" data-test-selector={`paraPriceLabel${templateItem.publishProductId}`}>
              {commonTranslation("price")}
              <span className="block sm:hidden">:</span>
            </p>
            <p className="ml-2 sm:ml-0 mt-0 sm:mt-2 sm:font-semibold sm:text-md" data-test-selector={`paraPriceValue${templateItem.publishProductId}`}>
              <FormatPriceWithCurrencyCode price={templateItem.unitPrice || 0} currencyCode={templateItem.currencyCode} />
            </p>
          </div>
          <div className="flex sm:block items-center sm:text-center col-span-12 sm:col-span-2 mt-2 sm:mt-0">
            <label
              className="font-semibold flex sm:justify-center"
              htmlFor={`quantity${templateItem.publishProductId}`}
              data-test-selector={`lblQuantity${templateItem.publishProductId}`}
            >
              {commonTranslation("quantity")} <span className="block sm:hidden">:</span>
            </label>
            <Input
              className="xs:w-12 md:w-12 h-8 sm:h-10 text-center ml-2 sm:ml-0 mt-0 sm:mt-2"
              name="Quantity"
              type="text"
              defaultValue={lineItemQuantity}
              onChange={(e) => {
                checkInput(e);
                setLineItemQuantity(Number(e.target.value));
                updateTemplateItemQuantity(e);
              }}
              id={`quantity${templateItem.publishProductId}`}
              labelCustomClass="font-semibold"
              dataTestSelector={`txtQuantity${templateItem.publishProductId}`}
              disabled={templateItem.hasValidationErrors}
            />
            {templateItem.quantityValidationMessage && !templateItem.hasValidationErrors && (
              <ValidationMessage
                message={templateItem.quantityValidationMessage}
                dataTestSelector={`quantityError${templateItem.publishProductId}`}
                customClass="text-sm text-errorColor ml-2"
              />
            )}
          </div>
          <div className="flex sm:block col-span-12 mt-2 sm:mt-0 sm:col-span-2 sm:font-semibold sm:justify-self-center sm:items-start">
            <div className="font-semibold capitalize flex sm:block" data-test-selector={`paraTotalLabel${templateItem.publishProductId}`}>
              {commonTranslation("total")}
              <span className="block sm:hidden">:</span>
            </div>
            {loadingItemIds.has(templateItem.itemId) ? (
              <div className="flex sm:h-14 pl-2 sm:pl-0 justify-start">
                <LoaderComponent isLoading={true} width="20px" height="20px" />
              </div>
            ) : (
              <p className="break-words ml-2 sm:ml-0 mt-0 sm:mt-2" data-test-selector={`paraTotalValue${templateItem.publishProductId}`}>
                <FormatPriceWithCurrencyCode price={templateItem.extendedPrice} currencyCode={templateItem.currencyCode} />
              </p>
            )}
          </div>
        </div>
        {templateItem.hasValidationErrors ? (
          <div className="col-span-5 my-2 break-words">
            <ValidationMessage
              message={behaviorTranslations("behaviorErrorMsg")}
              dataTestSelector="behaviorError"
              customClass="mb-2 text-errorColor md:whitespace-nowrap md:mb-0"
            />
          </div>
        ) : null}
        <div className="block sm:hidden">
          <Button
            type="link"
            size="small"
            dataTestSelector={`btnRemove${templateItem.publishProductId}`}
            ariaLabel="template item remove button"
            onClick={() => {
              handleRemoveItem();
            }}
          >
            {commonTranslation("remove")}
          </Button>
        </div>
      </div>
      <Separator />
    </>
  );
};
export default OrderTemplateItem;
