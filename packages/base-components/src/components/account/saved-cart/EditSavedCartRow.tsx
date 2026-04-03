/* eslint-disable max-lines-per-function */
"use client";

import { ICartItems, IUpdateCartItemQuantityResponse } from "@znode/types/cart";
import { IEditSavedCartRowData, ITemplateCartItems } from "@znode/types/account";
import React, { ChangeEvent, useState } from "react";
import { copyOrderDetails, removeAllItems, removeSingleLineItem } from "../../../http-request";

import Button from "../../common/button/Button";
import { CLASSTYPE } from "@znode/constants/checkout";
import { CustomImage } from "../../common/image";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Input } from "../../common/input";
import Link from "next/link";
import { Modal } from "../../common/modal";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { SavedCartConfirmDelete } from "./SavedCartConfirmDelete";
import { Separator } from "../../common/separator";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { updateCartItemQuantity } from "../../../http-request/cart/update-cart-item";
import { useRouter } from "next/navigation";
import { useCartDetails, useProduct, useToast } from "../../../stores";
import { useTranslationMessages } from "@znode/utils/component";
import { ValidationMessage } from "../../common/validation-message";

export const EditSavedCartRow = (props: IEditSavedCartRowData) => {
  const savedCartTranslation = useTranslationMessages("SavedCart");
  const cartTranslations = useTranslationMessages("Cart");
  const commonTranslation = useTranslationMessages("Common");
  const cartTranslation = useTranslationMessages("Cart");
  const behaviorTranslations = useTranslationMessages("BehaviorMsg");
  const [isDisableMoveToCart, setIsDisableMoveToCart] = useState<boolean>(false);
  const { templateData, getTemplateDetails } = props;
  const { success, error } = useToast();
  const router = useRouter();
    const { refreshCartItems } = useCartDetails();
    const {
      product: { cartCount },
    } = useProduct();

  const updateTemplateQuantity = async (event: ChangeEvent<HTMLInputElement>, cartNumber: string, cartItem: ITemplateCartItems) => {
    const inputQuantity = Number(event.target.value);
    if (inputQuantity > 0) {
      if (inputQuantity && inputQuantity != cartItem?.quantity) {
        if (inputQuantity >= 1 && cartItem?.sku) {
          const updateQuantity = {
            cartNumber: cartNumber,
            cartItemId: cartItem?.cartItemId,
            updateCartQuantity: inputQuantity,
            sku: cartItem?.sku,
            classType: ORDER_DATA_TYPE.SAVED_CARTS,
          };
          const updateQuantityResponse: IUpdateCartItemQuantityResponse = await updateCartItemQuantity(updateQuantity as ICartItems);
          if (updateQuantityResponse?.isSuccess) {
            getTemplateDetails && getTemplateDetails();
              if(inputQuantity>=cartItem.minimumQuantity){
                setIsDisableMoveToCart(false);
                success(savedCartTranslation("successEditSavedCart"));
              }
              else{
                setIsDisableMoveToCart(true);
                error(`${cartTranslations("quantityInBetweenMessage")} ${cartItem.minimumQuantity} ${cartTranslations("to")} ${cartItem.maximumQuantity}.`);
              }
          } else {
                setIsDisableMoveToCart(true);
               error(cartTranslations("exceedingQty"));
          }
        }
      }
    }
  };

  const moveToCart = async (classNumber: string) => {
    if (classNumber) {
      const status = await copyOrderDetails({ orderType: CLASSTYPE.SAVED_CARTS, orderNumber: classNumber });
      if (status && status.isSuccess === false) {
        error(savedCartTranslation("failedMoveToCart"));
      } else if (status.isSuccess) {
        success(savedCartTranslation("successMoveToCart"));
         !cartCount && refreshCartItems();
        router.push("/cart");
      } else {
        router.push(`/account/saved-cart/edit?classNumber=${classNumber}`);
      }
    }
  };

  const removeAllCartItem = async (classNumber: string) => {
    const isSuccess = await removeAllItems({ cartType: CLASSTYPE.SAVED_CARTS, cartNumber: classNumber ?? "" });
    getTemplateDetails && getTemplateDetails();
    if (isSuccess) success(cartTranslation("recordDeletedSuccessfully"));
    else {
      error(savedCartTranslation("errorFailedToRemovedAllItem"));
    }
  };

  const removeSavedCartItem = async (classNumber: string, cartItemId: string) => {
    const removeCartResponse: boolean = await removeSingleLineItem({ cartType: ORDER_DATA_TYPE.SAVED_CARTS, cartNumber: classNumber ?? "", itemId: cartItemId });
    getTemplateDetails && getTemplateDetails();

    if (removeCartResponse) success(cartTranslation("recordDeletedSuccessfully"));
    else {
      error(savedCartTranslation("errorFailedToRemovedAllItem"));
    }
  };

  const renderSavedCartItems = (savedCartItems: ITemplateCartItems[]) => {
    return savedCartItems.length > 0 ? (
      savedCartItems?.map((cartItem: ITemplateCartItems) => {
        return (
          <>
            <div className="grid items-start grid-cols-12 sm:grid-cols-9 xl:grid-cols-10 p-3" key={cartItem.sku} data-test-selector={`divEditSavedCart${cartItem.productId}`}>
              <div
                className="w-32 h-32 col-span-5 pb-0 p-2 sm:col-span-1 md:w-20 md:h-20 min-[1400px]:w-[5.5rem] min-[1400px]:h-[5.5rem]"
                data-test-selector={`divProductImage${cartItem?.productId}`}
              >
                <Link href={`${cartItem.productLink}`} className="font-semibold" data-test-selector={`linkProductName${cartItem.productId}`}>
                  <CustomImage
                    src={cartItem?.productImageUrl ?? ""}
                    alt={cartItem.productName || ""}
                    className="object-contain w-24 h-full sm:w-14 sm:h-14 xl:w-[5.5rem] xl:h-[5.5rem]"
                    dataTestSelector={`imgProduct${cartItem?.productId}`}
                    width={60}
                    height={10}
                    loading="lazy"
                  />
                </Link>
              </div>
              <div className="sm:grid grid-cols-10 col-span-7 sm:col-span-8 xl:col-span-9 p-2 gap-1">
                <div className="col-span-3 mb-2 sm:mb-0">
                  <Link href={`${cartItem.productLink}`} className="font-semibold" data-test-selector={`linkProductName${cartItem.productId}`}>
                    <p className="text-base font-semibold">{cartItem.productName}</p>
                  </Link>
                  <p className="mb-2 text-sm font-medium" data-test-selector={`paraProductDescription${cartItem?.productId}`}>
                    {cartItem.productDescription && <div dangerouslySetInnerHTML={{ __html: cartItem.productDescription }}></div>}
                  </p>
                  {cartItem?.productType === PRODUCT_TYPE.BUNDLE_PRODUCT && cartItem?.productDescription && (
                    <p className="text-sm font-medium mb-2" data-test-selector={`paraChildProductDescription${cartItem?.productId}`}>
                      <div dangerouslySetInnerHTML={{ __html: cartItem?.productDescription }}></div>
                    </p>
                  )}
                  {cartItem?.showSku ? (
                    <p className="text-sm" data-test-selector={`paraSku${cartItem?.productId}`}>
                      {commonTranslation("sku")}: {cartItem?.sku}
                    </p>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="col-span-2 flex sm:block mb-2 sm:mb-0">
                  <p className="font-semibold flex" data-test-selector="paraUnitPriceLabel">
                    {commonTranslation("price")} <span className="block sm:hidden">:</span>
                  </p>
                  <div className="sm:mt-2 pl-2 sm:pl-0" data-test-selector={`divUnitPrice${cartItem.productId}`}>
                    <FormatPriceWithCurrencyCode price={cartItem?.itemPrice || 0} currencyCode={cartItem?.cultureCode ?? "USD"} />
                  </div>
                </div>
                <div className="col-span-2 flex items-center sm:block mb-2 sm:mb-0">
                  <label className="font-semibold flex pr-2 sm:pr-0 pb-0 sm:pb-2" htmlFor="edit-save-cart-quantity" data-test-selector={`lblQuantity${cartItem.productId}`}>
                    {commonTranslation("quantity")} <span className="block sm:hidden">:</span>
                  </label>
                  <Input
                    className="xs:w-14 h-10 text-center"
                    dataTestSelector={`txtQuantity${cartItem?.productId}`}
                    type="number"
                    defaultValue={cartItem?.quantity}
                    onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                      cartItem?.cartItemId && updateTemplateQuantity(event, templateData?.classNumber || "", cartItem);
                    }}
                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                      // Prevent the user from entering a decimal point
                      if (event.key === "." || event.key === "e") {
                        event.preventDefault();
                      }
                    }}
                    ariaLabel="Edit Save Cart Quantity"
                    id="edit-save-cart-quantity"
                  />
                </div>
                <div className="col-span-2 flex sm:block mb-2 sm:mb-0">
                  <p className="font-semibold flex" data-test-selector={`divTotalLabel${cartItem?.productId}`}>
                    {commonTranslation("total")} <span className="block sm:hidden">:</span>
                  </p>
                  <div className="sm:mt-2 pl-2 sm:pl-0" data-test-selector={`divTotalPrice${cartItem?.productId}`}>
                    <FormatPriceWithCurrencyCode price={cartItem?.totalPrice || 0} currencyCode={cartItem?.cultureCode ?? "USD"} />
                  </div>
                </div>
                <div className="col-span-1 flex flex-col justify-center items-start">
                  <Button
                    dataTestSelector={`btnDeleteSavedCartItem${cartItem?.productId}`}
                    className="mr-2 p-0 border-none cursor-pointer"
                    onClick={() => removeSavedCartItem(templateData?.classNumber || "", cartItem?.cartItemId || "")}
                  >
                    <Tooltip message={commonTranslation("remove")}>
                      <ZIcons name="trash-2" />
                    </Tooltip>
                  </Button>
                </div>
              </div>
              {cartItem.hasValidationErrors ? (
                <div className="col-span-12 my-2 break-words">
                  <ValidationMessage
                    customClass="mb-2 text-errorColor md:whitespace-nowrap md:mb-0"
                    message={behaviorTranslations("behaviorErrorMsg")}
                    dataTestSelector={`behaviorErrorMsg${cartItem.productId}`}
                  />
                </div>
              ) : null}
            </div>
            <Separator />
          </>
        );
      })
    ) : (
      <div className="text-center" data-test-selector="noRecordFoundEditSavedCart">
        {savedCartTranslation("noItemsAdded")}
      </div>
    );
  };

  return (
    <>
      <div data-test-selector="divEditSavedCartItems">{templateData?.itemList && renderSavedCartItems(templateData?.itemList)}</div>
      <div className={`flex ${templateData?.itemList && templateData?.itemList.length > 0 ? "justify-between" : "justify-end"} mt-5`}>
        {templateData?.itemList && templateData?.itemList.length > 0 ? (
          <Button
            size="small"
            type="link"
            className="pl-0"
            onClick={() => {
              removeAllCartItem(templateData?.classNumber || "");
            }}
            dataTestSelector="btnClearAllItems"
          >
            {savedCartTranslation("clearAllItems")}
          </Button>
        ) : null}
        <div className="flex items-center justify-end">
          {templateData?.itemList && templateData?.itemList.length > 0 ? (
            <Button
              size="small"
              type="primary"
              dataTestSelector="btnMoveCartButton"
              onClick={() => templateData?.classNumber && moveToCart(templateData?.classNumber || "")}
              ariaLabel="Move items to cart"
              disabled={isDisableMoveToCart || !(templateData?.itemList?.length > 0)}>
              {savedCartTranslation("moveItemsToCart")}
            </Button>
          ) : null}
        </div>
        <Modal size="5xl" modalId="SavedCartConfirmDelete" customClass="w-80">
          <SavedCartConfirmDelete getTemplateListDetails={getTemplateDetails} />
        </Modal>
      </div>
    </>
  );
};
