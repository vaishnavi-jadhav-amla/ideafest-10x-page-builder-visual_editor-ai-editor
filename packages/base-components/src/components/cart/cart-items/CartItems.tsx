import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import { ICartItem, ICartItems, IErrorMessage, IUpdateCartItemQuantityResponse } from "@znode/types/cart";
import { getSaveForLaterId, removeSingleLineItem } from "../../../http-request";
import { sendAnalyticsEvent, useTranslationMessages } from "@znode/utils/component";

import { ANALYTICS_EVENTS } from "@znode/constants/analytics-event";
import Button from "../../common/button/Button";
import { CustomImage } from "../../common/image";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { IShoppingCartItem } from "@znode/types/shopping";
import { IUser } from "@znode/types/user";
import Input from "../../common/input/Input";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { Separator } from "../../common/separator";
import SignInOrRegisterText from "../../sign-in-register-text/SignInOrRegisterText";
import { ValidationMessage } from "../../common/validation-message";
import { ZnodeCartItemErrorCode } from "@znode/types/enums";
import { create } from "../../../http-request/cart/create";
import { debounce } from "lodash";
import { getCartNumber } from "../../../http-request/cart/get-cart-number";
import { getHighestPriorityCartValidation } from "@znode/agents/cart/cart-helper";
import { updateCartItemQuantity } from "../../../http-request/cart/update-cart-item";
import { useCartDetails } from "../../../stores";
import { useToast } from "../../../stores/toast";

interface IShoppingCartItemsList {
  shoppingCartItemsList: ICartItem[];
  setCheckoutButtonDisabled: Dispatch<SetStateAction<boolean>>;
  loginRequired: boolean | string;
  currencyCode: string;
  enableSaveForLater: boolean;
  isCheckoutButtonDisabled: boolean;
  setInventoryValidationMessage: Dispatch<SetStateAction<IErrorMessage>>;
  inventoryValidationMessage: IErrorMessage;
  user: IUser;
}

export function CartItems({
  shoppingCartItemsList,
  setCheckoutButtonDisabled,
  // eslint-disable-next-line
  loginRequired, //TODO: pending section
  currencyCode,
  enableSaveForLater = true,
  isCheckoutButtonDisabled,
  setInventoryValidationMessage,
  inventoryValidationMessage,
  user,
}: Readonly<IShoppingCartItemsList>) {
  const { error, success } = useToast();
  const cartTranslations = useTranslationMessages("Cart");
  const behaviorTranslations = useTranslationMessages("BehaviorMsg");
  const { refreshCartSummary, refreshCartItems, refreshSaveLaterItems } = useCartDetails();
  const [isCartSummaryLoading, setIsCartSummaryLoading] = useState<boolean>(false);
  const { saveForLaterId, setSaveForLaterId } = useCartDetails();
  const [loadingCartItemIds, setLoadingCartItemIds] = useState<Set<string>>(new Set());
  const [loadingCartRemoves, setLoadingCartRemoves] = useState<Set<string>>(new Set());
  const [loadingCartSaveLetter, setLoadingSaveLater] = useState<Set<string>>(new Set());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  async function moveItemToSaveForLater(cartItemId: string, productId: number) {
    const cartNumber = await getCartNumber();
    setLoadingSaveLater((prevSet) => new Set(prevSet.add(cartItemId ?? "")));
    const targetClassNumber =
      saveForLaterId ||
      (await (async () => {
        const id = await getSaveForLaterId();
        setSaveForLaterId(id);
        return id;
      })());

    if (cartNumber) {
      const saveForLaterResponse = await create({
        orderType: ORDER_DATA_TYPE.SAVE_FOR_LATER,
        cartNumber: cartNumber,
        targetClassType: ORDER_DATA_TYPE.SAVE_FOR_LATER,
        cartItemId,
        targetClassNumber: targetClassNumber,
      });

      if (saveForLaterResponse.isSuccess && saveForLaterResponse.convertedClassNumber) {
        setLoadingSaveLater((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.delete(cartItemId ?? "");
          return newSet;
        });
        setSaveForLaterId(saveForLaterResponse.convertedClassNumber);
        clearInventoryValidationMessage(productId);
        refreshCartItems();
        refreshCartSummary();
        refreshSaveLaterItems();
        success(cartTranslations("itemMovedToSavedItemsSuccessfully"));
      } else {
        error(cartTranslations("errorFailedToSavedForLater"));
      }
    } else {
      error(cartTranslations("errorFailedToSavedForLater"));
    }
  }

  function clearInventoryValidationMessage(productId: number) {
    setInventoryValidationMessage((prev) => ({
      ...prev,
      [productId]: {
        productID: productId,
        message: "",
        isError: false,
      },
    }));
  }

  const renderCartItems = (shoppingCartItems: ICartItem[]) => {
    const handleCartItemQuantityChange = debounce(async (event: ChangeEvent<HTMLInputElement>, cartItem: ICartItem) => {
      const inputQuantity = Number(event.target.value);
      const productId = cartItem.productId;
      if (inputQuantity > cartItem.maximumQuantity) {
        setInventoryValidationMessage({
          ...inventoryValidationMessage,
          [productId]: {
            productID: productId,
            message: `${cartTranslations("quantityInBetweenMessage")} ${cartItem.minimumQuantity} ${cartTranslations("to")} ${cartItem.maximumQuantity}.`,
            isError: true,
          },
        });

        return;
      } else {
        setInventoryValidationMessage({
          ...inventoryValidationMessage,
          [productId]: {
            productID: productId,
            message: "",
            isError: false,
          },
        });
      }
      // If the quantity is different from the current one, initiate debouncing
      if (inputQuantity !== cartItem.quantity) {
        if (inputQuantity >= 1 && inputQuantity <= cartItem.maximumQuantity && inputQuantity >= cartItem.minimumQuantity && cartItem.cartItemId) {
          // Clear the previous debounce timer if any
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
          }
          setLoadingCartItemIds((prevSet) => new Set(prevSet.add(cartItem.cartItemId ?? "")));
          // Set the new debounce timer
          debounceTimer.current = setTimeout(async () => {
            setIsCartSummaryLoading(true);

            const cartNumber = await getCartNumber();
            const updateQuantity = {
              cartNumber: cartNumber,
              cartItemId: cartItem.cartItemId,
              updateCartQuantity: inputQuantity,
              sku: cartItem.sku ?? "",
              classType: ORDER_DATA_TYPE.CARTS,
            };

            const updateQuantityResponse: IUpdateCartItemQuantityResponse = await updateCartItemQuantity(updateQuantity as ICartItems);

            if (updateQuantityResponse?.isSuccess) {
              refreshCartItems();
              refreshCartSummary();
              setInventoryValidationMessage({
                ...inventoryValidationMessage,
                [productId]: {
                  productID: productId,
                  message: "",
                  isError: false,
                },
              });
            } else if (updateQuantityResponse?.isSuccess === false && updateQuantityResponse.validationDetails) {
              const validationData = getHighestPriorityCartValidation(updateQuantityResponse.validationDetails);
              if (validationData?.errorCode === ZnodeCartItemErrorCode.OutOfStock) {
                setInventoryValidationMessage({
                  ...inventoryValidationMessage,
                  [productId]: {
                    productID: productId,
                    message: `${cartTranslations("exceedingQty")}`, // TO DO for CP
                    isError: true,
                  },
                });
              }
            }

            setIsCartSummaryLoading(false);
            setLoadingCartItemIds((prevSet) => {
              const newSet = new Set(prevSet);
              newSet.delete(cartItem.cartItemId ?? "");
              return newSet;
            });
          }, 700);
        } else {
          setInventoryValidationMessage({
            ...inventoryValidationMessage,
            [productId]: {
              productID: productId,
              message: `${cartTranslations("quantityInBetweenMessage")} ${cartItem.minimumQuantity} ${cartTranslations("to")} ${cartItem.maximumQuantity}.`,
              isError: true,
            },
          });
        }
      } else if (!inputQuantity) {
        // If input is empty, show error
        setInventoryValidationMessage({
          ...inventoryValidationMessage,
          [productId]: {
            productID: productId,
            message: cartTranslations("requiredNumericValue"),
            isError: true,
          },
        });
        setIsCartSummaryLoading(false);
      }
    }, 600);

    const cartDataForSingleLineItem = (cartItem: IShoppingCartItem) => {
      return {
        id: cartItem.sku,
        name: cartItem.productName,
        quantity: cartItem.quantity,
        price: cartItem.unitPrice,
        variant: cartItem.configurableProductSKUs,
      };
    };

    const checkInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      const numberPattern = /^\d+$/;
      const text = event.target.value;
      !isCheckoutButtonDisabled && setCheckoutButtonDisabled(true);
      if (!numberPattern.test(text)) {
        event.target.value = text.replace(/\D/g, "");
      }
    };

    async function removeCartItem(cartItemId: string, productId: number) {
      setLoadingCartRemoves((prevSet) => new Set(prevSet.add(cartItemId ?? "")));
      const cartNumber = await getCartNumber();
      const removeCartResponse: boolean = await removeSingleLineItem({ cartType: ORDER_DATA_TYPE.CARTS, cartNumber: cartNumber ?? "", itemId: cartItemId });
      if (removeCartResponse) {
        setLoadingCartRemoves((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.delete(cartItemId ?? "");
          return newSet;
        });
        clearInventoryValidationMessage(productId);
        refreshCartItems();
        refreshCartSummary();
      } else {
        error(cartTranslations("errorFailedToRemovedItem"));
      }
    }

    return shoppingCartItems?.map((cartItem: ICartItem) => {
      let errorMessage;
      const productId = cartItem?.productId;
      if (cartItem?.hasValidationErrors && cartItem?.isOutOfStock === true) {
        errorMessage = cartTranslations("textOutOfStock");
      } else if (cartItem?.hasValidationErrors) errorMessage = behaviorTranslations("behaviorErrorMsg");
      // Ref to store the debounce timer
      return (
        <>
          <div className="w-full pl-2 pr-2 text-sm" key={cartItem.productId}>
            <div className="grid items-start grid-cols-12 sm:grid-cols-9 xl:grid-cols-10">
              <div className="w-32 h-32 col-span-5 p-2 pb-0 sm:col-span-1 md:w-20 md:h-20 xl:w-[5.5rem] xl:h-[5.5rem] relative">
                <CustomImage
                  src={cartItem.productImageUrl}
                  alt={cartItem.productName}
                  className="object-contain w-full h-full sm:w-14 sm:h-14 xl:w-[5.5rem] xl:h-[5.5rem]"
                  width={50}
                  height={50}
                  dataTestSelector={`imgProduct${productId}`}
                />
              </div>
              <div className="grid grid-cols-12 col-span-7 p-2 sm:col-span-8 xl:col-span-9">
                <div className="col-span-12 font-semibold sm:col-span-6 text-md">
                  <Link href={cartItem.productLink} className="mb-2 font-semibold inline-block" data-test-selector={`linkProductName${productId}`} prefetch={false}>
                    <p className="text-base font-semibold">{cartItem.productName}</p>
                  </Link>

                  <p className="mb-2 text-sm font-medium custom-word-break" data-test-selector={`paraChildProductDescription${productId}`}>
                    {cartItem.productDescription && (
                      <div data-test-selector={`divProductDescription${productId}`} dangerouslySetInnerHTML={{ __html: cartItem.productDescription }}></div>
                    )}
                  </p>

                  {cartItem.showSku && !cartItem.isConfigurable ? (
                    <p className="hidden mb-2 text-xs xs:w-6/12 sm:block" data-test-selector={`paraSku${productId}`}>
                      {cartTranslations("sku")}: {cartItem.sku}
                    </p>
                  ) : null}

                  {/* Sku For Mobile View */}
                  {cartItem.showSku && !cartItem.isConfigurable ? (
                    <div className="flex items-center sm:hidden col-span-12 mb-2" data-test-selector={`paraSku${productId}`} aria-label={`SKU: ${cartItem.sku}`}>
                      <div className="inline font-semibold capitalize sm:hidden ">{cartTranslations("sku")}:</div>
                      <div className="ml-2">
                        <p className="font-normal">{cartItem.sku}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="hidden mt-1 font-normal sm:flex">
                    <Button
                      type="link"
                      size="small"
                      dataTestSelector={`btnRemoveCartItem${cartItem.productId}`}
                      onClick={() => {
                        removeCartItem(cartItem.cartItemId ?? "", cartItem.productId);
                        sendAnalyticsEvent({
                          event: ANALYTICS_EVENTS.REMOVE_CART_ITEM,
                          ecommerce: {
                            remove: {
                              products: [cartDataForSingleLineItem(cartItem)],
                            },
                          },
                        });
                      }}
                      className="p-0 mr-3"
                      data-test-selector={`linkRemoveCartItem${productId}`}
                      ariaLabel="Remove cart button"
                      loaderText={cartTranslations("remove")}
                      showLoadingText={true}
                      loaderHeight="20px"
                      loaderWidth="20px"
                    >
                      {loadingCartRemoves.has(cartItem.cartItemId || "") ? (
                        <LoaderComponent isLoading={loadingCartRemoves.has(cartItem.cartItemId || "")} width="15px" height="15px" />
                      ) : (
                        <span> {cartTranslations("remove")}</span>
                      )}
                    </Button>

                    {enableSaveForLater && (
                      <Button
                        type="link"
                        size="small"
                        dataTestSelector={`btnSaveForLater${cartItem.productId}`}
                        onClick={() => moveItemToSaveForLater(cartItem.cartItemId || "", cartItem.productId)}
                        className={`p-0 ${cartItem.hasValidationErrors ? "pointer-events-none opacity-50" : ""}`}
                        data-test-selector={`linkSaveForLater${productId}`}
                        ariaLabel="Save for later button"
                      >
                        {loadingCartSaveLetter.has(cartItem.cartItemId || "") ? (
                          <LoaderComponent isLoading={loadingCartSaveLetter.has(cartItem.cartItemId || "")} width="15px" height="15px" />
                        ) : (
                          <span className="mr-1">{cartTranslations("saveForLater")}</span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex col-span-12 mt-1 sm:col-span-2 sm:mt-4 sm:justify-self-center sm:items-start">
                  <div className="inline font-semibold capitalize sm:hidden " data-test-selector={`divItemPriceLabel${cartItem.productId}`}>
                    {cartTranslations("itemPrice")}:
                  </div>
                  <div className="ml-2 sm:font-semibold sm:text-md">
                    {loginRequired && !user ? (
                      <SignInOrRegisterText isReadyCheckoutTextShow={false} />
                    ) : (
                      <p data-test-selector={`paraItemRowCost${cartItem.productId}`}>
                        <FormatPriceWithCurrencyCode price={cartItem.itemPrice || 0} currencyCode={currencyCode ?? "USD"} />
                        {cartItem.itemPrice && cartItem.uom ? <span>{` / ${cartItem.uom}`}</span> : <></>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex sm:block items-center col-span-12 sm:col-span-2 mt-2">
                  <div className="col-span-12 font-semibold capitalize sm:hidden mr-2" data-test-selector={`divQtyLabel${cartItem.productId}`}>
                    {`${cartTranslations("quantity")} :`}
                  </div>
                  <div className="col-span-12 text-start sm:text-center sm:content-start mt-0.5">
                    <Input
                      className={"xs:w-12 md:w-12 h-8 sm:h-10 text-center"}
                      dataTestSelector={`txtProductRowQuantity${cartItem.productId}`}
                      type="text"
                      key={cartItem.quantity}
                      defaultValue={cartItem.quantity}
                      onChange={(event) => {
                        checkInput(event);
                        cartItem.cartItemId && cartItem.maximumQuantity && cartItem.minimumQuantity && handleCartItemQuantityChange(event, cartItem);
                      }}
                      ariaLabel="Cart Quantity"
                      isLabelShow={false}
                      label={cartTranslations("quantity")}
                      id={`cart-quantity-${productId}`}
                      labelCustomClass="block xs:hidden font-semibold mb-2"
                      disabled={cartItem.hasValidationErrors}
                    />
                    {inventoryValidationMessage[`${cartItem.productId}`]?.isError && cartItem.productId === inventoryValidationMessage[`${cartItem.productId}`]?.productID && (
                      <ValidationMessage
                        message={inventoryValidationMessage[`${cartItem.productId}`]?.message}
                        dataTestSelector={`quantityErrorMessage${cartItem.productId}`}
                        customClass="text-errorColor"
                      />
                    )}
                  </div>
                </div>
                <div className="flex col-span-12 mt-2 sm:mt-4 sm:col-span-2 sm:font-semibold sm:justify-self-center sm:items-start">
                  <div className="inline font-semibold capitalize sm:hidden">{cartTranslations("totalPrice")}:</div>

                  {loadingCartItemIds.has(cartItem.cartItemId || "") ? (
                    <LoaderComponent isLoading={loadingCartItemIds.has(cartItem.cartItemId || "")} width="20px" height="20px" />
                  ) : (
                    <div className="ml-2">
                      {loginRequired && !user ? (
                        <SignInOrRegisterText isReadyCheckoutTextShow={false} />
                      ) : (
                        <p data-test-selector={`paraOrderRowTotal${cartItem.productId}`}>
                          <FormatPriceWithCurrencyCode price={cartItem.totalPrice ?? 0} currencyCode={currencyCode ?? "USD"} />
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {errorMessage ? (
                <div className="col-span-12 my-2 break-words">
                  <ValidationMessage
                    customClass="mb-2 text-errorColor md:whitespace-nowrap md:mb-0"
                    message={errorMessage}
                    dataTestSelector={`behaviorErrorMsg${cartItem.productId}`}
                  />
                </div>
              ) : null}
              </div>
              
              <div className="flex col-span-2 my-2 sm:hidden">
                <div
                  onClick={() => {
                    removeCartItem(cartItem.cartItemId || "", cartItem.productId);
                    sendAnalyticsEvent({ event: ANALYTICS_EVENTS.REMOVE_CART_ITEM, ecommerce: { remove: { products: cartDataForSingleLineItem(cartItem) } } });
                  }}
                  className="flex items-center text-sm text-linkColor hover:text-hoverColor underline cursor-pointer underline-offset-2 "
                  data-test-selector={`paraRemoveCartItem${cartItem.productId}`}
                >
                  {loadingCartRemoves.has(cartItem.cartItemId || "") ? (
                    <LoaderComponent isLoading={loadingCartRemoves.has(cartItem.cartItemId || "")} width="15px" height="15px" />
                  ) : (
                    <span> {cartTranslations("remove")}</span>
                  )}
                </div>
              </div>

              <div className="block col-span-6 my-2 ml-2 sm:hidden">
                {enableSaveForLater && (
                  <div
                    onClick={() => moveItemToSaveForLater(cartItem.cartItemId || "", cartItem.productId)}
                    className={"text-sm underline underline-offset-2 cursor-pointer text-linkColor hover:text-hoverColor flex items-center "}
                    data-test-selector={`linkSaveForLater${productId}`}
                  >
                    {loadingCartSaveLetter.has(cartItem.cartItemId || "") ? (
                      <LoaderComponent isLoading={loadingCartSaveLetter.has(cartItem.cartItemId || "")} width="15px" height="15px" />
                    ) : (
                      <span className="mr-1">{cartTranslations("saveForLater")}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />
        </>
      );
    });
  };

  return (
    <>
      <Separator customClass="hidden sm:block" />
      <div className="hidden sm:block">
        <div className="grid grid-cols-9 xl:grid-cols-10 text-center">
          <div className="col-span-1 "></div>
          <div className="grid grid-cols-12 col-span-8 xl:col-span-9 px-2">
            <div className="col-span-6 text-left" data-test-selector="divItemsHeading">
              <p className="font-semibold pl-[7px]" data-test-selector="paraItemsColumnHeading">
                {cartTranslations("items")}
              </p>
            </div>
            <div className="col-span-2 pl-2" data-test-selector="divItemPriceHeading">
              <p className="font-semibold" data-test-selector="paraItemPriceColumnHeading">
                {cartTranslations("itemPrice")}
              </p>
            </div>
            <div className="col-span-2" data-test-selector="divQuantityHeading">
              <p className="font-semibold" data-test-selector="paraQuantityColumnHeading">
                {cartTranslations("quantity")}
              </p>
            </div>
            <div className="col-span-2 pl-4" data-test-selector="divTotalPriceHeading">
              <p className="font-semibold" data-test-selector="paraTotalPriceColumnHeading">
                {cartTranslations("totalPrice")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      {renderCartItems(shoppingCartItemsList)}
      {isCartSummaryLoading}
    </>
  );
}
