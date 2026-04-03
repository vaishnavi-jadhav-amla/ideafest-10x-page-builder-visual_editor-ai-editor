import { getSaveForLaterId, getSaveForLaterItems, removeAllItems, removeSingleLineItem } from "../../../http-request/cart";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { CustomImage } from "../../common/image";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import { ICartItem } from "@znode/types/cart";
import Input from "../../common/input/Input";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { Separator } from "../../common/separator";
import { create } from "../../../http-request/cart/create";
import { getSavedUserSessionCallForClient } from "@znode/utils/common";
import { useCartDetails } from "../../../stores";
import { useToast } from "../../../stores/toast";
import { useTranslations } from "next-intl";

interface ISaveForLaterProps {
  currencyCode: string;
}

export function SaveForLater({ currencyCode }: Readonly<ISaveForLaterProps>) {
  const cartTranslations = useTranslations("Cart");
  const { refreshCartSummary, refreshCartItems, refreshSaveLaterItems, saveLaterItemsRefresher, saveForLaterId, setSaveForLaterId } = useCartDetails();
  const { error, success } = useToast();
  const [loadingCartRemoves, setLoadingCartRemoves] = useState<Set<string>>(new Set());
  const [saveForLaterData, setSaveForLaterData] = useState<ICartItem[]>([]);
  const [isMoveToCartLoading, setIsMoveToCartLoading] = useState<Set<string>>(new Set());

  const getSaveForLaterClassNumber = async () => {
    const user = await getSavedUserSessionCallForClient();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      const targetClassNumber =
        saveForLaterId ||
        (await (async () => {
          const id = await getSaveForLaterId();
          setSaveForLaterId(id);
          return id;
        })());
      return targetClassNumber;
    }
    return null;
  };

  const fetchSaveForLateItems = async () => {
    const saveForLaterId = await getSaveForLaterClassNumber();
    if (saveForLaterId) {
      const saveForLaterDetails = await getSaveForLaterItems(saveForLaterId);
      setSaveForLaterData(saveForLaterDetails.cartItems || []);
    } else {
      setSaveForLaterData([]);
    }
  };

  useEffect(() => {
    fetchSaveForLateItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveLaterItemsRefresher && fetchSaveForLateItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveLaterItemsRefresher]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMoveToCart = async (cartItemId: string) => {
    setIsMoveToCartLoading((prevSet) => new Set(prevSet.add(cartItemId ?? "")));
    const saveForLaterId = await getSaveForLaterClassNumber();
    if (saveForLaterId && cartItemId) {
      const saveForLaterResponse = await create({
        orderType: ORDER_DATA_TYPE.MOVE_TO_CART,
        cartNumber: saveForLaterId,
        targetClassType: ORDER_DATA_TYPE.CARTS,
        cartItemId,
      });
      if (saveForLaterResponse.isSuccess) {
        success(cartTranslations("itemMovedBackToTheCart"));
        fetchSaveForLateItems();
        refreshCartItems();
        refreshCartSummary();
        setIsMoveToCartLoading((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.delete(cartItemId ?? "");
          scrollToTop();
          return newSet;
        });
      } else {
        error(cartTranslations("errorFailedMovedToCart"));
        setIsMoveToCartLoading((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.delete(cartItemId ?? "");
          return newSet;
        });
      }
    } else {
      error(cartTranslations("errorFailedMovedToCart"));
      setIsMoveToCartLoading((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.delete(cartItemId ?? "");
        return newSet;
      });
    }
  };

  const handleRemoveSingleItem = async (itemId: string) => {
    const saveForLaterId = await getSaveForLaterId();
    setLoadingCartRemoves((prevSet) => new Set(prevSet.add(itemId ?? "")));
    const isRemoved: boolean = await removeSingleLineItem({
      cartType: ORDER_DATA_TYPE.SAVE_FOR_LATER,
      cartNumber: saveForLaterId ?? "",
      itemId,
    });

    if (isRemoved) {
      setLoadingCartRemoves((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.delete(itemId ?? "");
        return newSet;
      });
      refreshCartItems();
      refreshSaveLaterItems();
      success(cartTranslations("recordDeletedSuccessfully"));
    } else {
      error(cartTranslations("errorFailedToRemovedItem"));
    }
  };

  const handleRemoveAllItems = async () => {
    const classNumber = await getSaveForLaterId();
    const isSuccess = await removeAllItems({
      cartType: ORDER_DATA_TYPE.SAVE_FOR_LATER,
      cartNumber: classNumber ?? "",
    });
    if (isSuccess) {
      setSaveForLaterData([]);
      success(cartTranslations("recordDeletedSuccessfully"));
    } else {
      error(cartTranslations("errorFailedToRemovedAllItem"));
    }
  };

  const renderCartItem = (cartItem: ICartItem) => {
    const { productId, productName, productLink, productImageUrl, productDescription, sku, itemPrice, quantity, cartItemId, showSku, isConfigurable } = cartItem;

    return (
      <div className="w-full pl-2 pr-2 text-sm" key={sku}>
        <div className="grid items-start grid-cols-12 sm:grid-cols-9 xl:grid-cols-10" data-test-selector={`divCartItem${productId}`}>
          <div className="w-32 h-32 col-span-5 p-2 pb-0 sm:col-span-1 md:w-20 md:h-20 xl:w-[5.5rem] xl:h-[5.5rem]">
            <CustomImage
              src={productImageUrl}
              alt={productName}
              className="object-contain w-full h-full sm:w-14 sm:h-14 xl:w-[5.5rem] xl:h-[5.5rem]"
              width={50}
              height={50}
              dataTestSelector={`imgProduct${productId}`}
            />
          </div>
          <div className="grid grid-cols-12 col-span-7 p-2 sm:col-span-8 xl:col-span-9">
            <div className="col-span-12 font-semibold sm:col-span-6 text-md">
              <div>
                <Link href={productLink} className="mb-2 font-semibold" data-test-selector={`paraProductName${productId}`}>
                  {productName}
                </Link>
                {productDescription && (
                  <p className="mb-2 text-sm font-medium" data-test-selector={`paraChildProductDescription${productId}`}>
                    <div dangerouslySetInnerHTML={{ __html: productDescription }}></div>
                  </p>
                )}
              </div>
              {showSku && !isConfigurable && (
                <p className="hidden mb-2 text-xs xs:w-6/12 sm:block" data-test-selector={`paraSku${productId}`}>
                  {cartTranslations("sku")}: {sku}
                </p>
              )}
              <div className="hidden mt-1 sm:flex">
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleRemoveSingleItem(cartItemId || "")}
                  className="p-0"
                  dataTestSelector={`btnRemoveSaveItem${productId}`}
                  ariaLabel="Remove save for later button"
                >
                  {loadingCartRemoves.has(cartItem.cartItemId || "") ? (
                    <LoaderComponent isLoading={loadingCartRemoves.has(cartItem.cartItemId || "")} width="15px" height="15px" />
                  ) : (
                    <span> {cartTranslations("remove")}</span>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex col-span-12 mt-1 sm:col-span-2 sm:mt-4 sm:justify-self-center sm:items-start">
              <div className="inline font-semibold capitalize sm:hidden " data-test-selector={`divItemPriceLabel${productId}`}>
                {cartTranslations("itemPrice")}:
              </div>
              <p className="ml-2 sm:font-semibold sm:text-md" data-test-selector={`paraUnitPrice${productId}`}>
                <FormatPriceWithCurrencyCode price={itemPrice ?? 0} currencyCode={currencyCode || "USD"} />
              </p>
            </div>
            <div className="col-span-12 sm:col-span-2 flex sm:block items-baseline sm:text-center sm:content-start">
              <Input
                className="h-10 text-center bg-white border-none xs:w-10 sm:w-14 text-textColor"
                disabled={true}
                dataTestSelector={`txtProductQuantity${productId}`}
                type="number"
                value={quantity}
                ariaLabel="Saved Quantity"
                isLabelShow={true}
                label={`${cartTranslations("quantity")} :`}
                id="saved-quantity"
                labelCustomClass="block sm:hidden font-semibold"
              />
            </div>
            <div className="col-span-12 mt-2 sm:mt-4 sm:col-span-2 text-start sm:text-center sm:content-start">
              <Button
                type="primary"
                size="small"
                dataTestSelector="btnMoveCart"
                onClick={() => handleMoveToCart(cartItemId || "")}
                className="xs:text-xs xl:text-sm xs:px-1 min-[1300px]:px-4"
                ariaLabel="move to cart button"
                loading={isMoveToCartLoading.has(cartItemId || "")}
                showLoadingText={true}
                loaderColor="currentColor"
                loaderHeight="20px"
                loaderWidth="20px"
              >
                {cartTranslations("moveToCart")}
              </Button>
            </div>
          </div>
        </div>
        <div className="sm:hidden">
          <Button
            type="link"
            size="small"
            onClick={() => handleRemoveSingleItem(cartItemId || "")}
            className="p-0"
            dataTestSelector={`btnMobileRemoveSaveItem${productId}`}
            ariaLabel="Remove save for later button"
          >
            {loadingCartRemoves.has(cartItem.cartItemId || "") ? (
              <LoaderComponent isLoading={loadingCartRemoves.has(cartItem.cartItemId || "")} width="15px" height="15px" />
            ) : (
              <span> {cartTranslations("remove")}</span>
            )}
          </Button>
        </div>
        <Separator />
      </div>
    );
  };

  const renderCartItems = (items: ICartItem[]) => items.map(renderCartItem);

  const renderSaveForLaterItemList = (items: ICartItem[]) => {
    const itemsHeading = (
      <>
        <div className="hidden sm:block">
          <div className="grid grid-cols-9 xl:grid-cols-10 text-center">
            <div className="col-span-1 "></div>
            <div className="grid grid-cols-12 col-span-8 xl:col-span-9 px-2">
              <div className="col-span-6 text-left" data-test-selector="divItemsHeading">
                <p className="font-semibold pl-[7px]">{cartTranslations("items")}</p>
              </div>
              <div className="col-span-2 pl-2" data-test-selector="divItemPriceHeading">
                <p className="font-semibold">{cartTranslations("itemPrice")}</p>
              </div>
              <div className="col-span-2 pl-2" data-test-selector="divQuantityHeading">
                <p className="font-semibold ">{cartTranslations("quantity")}</p>
              </div>
              <div className="col-span-2"></div>
            </div>
          </div>
        </div>
        <Separator customClass="hidden sm:block" />
      </>
    );

    return (
      <>
        {itemsHeading}
        {renderCartItems(items)}
        <div className="text-right">
          <Button type="link" size="small" onClick={handleRemoveAllItems} dataTestSelector="btnRemoveAllItems">
            {cartTranslations("removeAllItems")}
          </Button>
        </div>
      </>
    );
  };

 if (saveForLaterData?.length === 0) return null;

  const validItems = (saveForLaterData ?? []).filter(item => item && item.productId);
  const savedCount = validItems.length;

  return (
    <div className="my-5">
      <div className="grid gap-4 mb-5 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <Heading
            name={`${cartTranslations("savedItems")} (${savedCount})`}
            dataTestSelector="hdgSavedItems"
            level="h2"
            customClass="uppercase"
            showSeparator
          />
          {renderSaveForLaterItemList(validItems)}
        </div>
      </div>
    </div>
  );
}
