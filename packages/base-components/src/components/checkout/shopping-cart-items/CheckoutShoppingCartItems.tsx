"use client";

import { getCartNumber, removeSingleLineItem } from "../../../http-request/cart";

import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { ICartItem } from "@znode/types/cart";
import ImageWrapper from "../../common/image/Image";
import Link from "next/link";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { useTranslations } from "next-intl";
import { useCartDetails, useProduct } from "../../../stores";



interface ICheckoutShoppingCartItemsProps {
  cartItems: ICartItem[];
  currencyCode: string;
}

const CheckoutShoppingCartItems = (props: ICheckoutShoppingCartItemsProps) => {
  const { refreshCartItems } = useCartDetails();
    const {
    product: { cartCount },
  } = useProduct();
  const commonTranslations = useTranslations("Common");
  const { error } = useToast();

  const router = useRouter();
  const { cartItems, currencyCode } = props;

  async function removeCartItem(cartItem: ICartItem) {
    if (cartItem?.cartItemId) {
      const cartNumber = await getCartNumber();
      const removeCartResponse = await removeSingleLineItem({ cartType: ORDER_DATA_TYPE.CARTS, cartNumber: cartNumber, itemId: cartItem.cartItemId });
      if (removeCartResponse) {
      !cartCount && refreshCartItems();
        router.push("/cart");
      } else {
        error(commonTranslations("errorFailedToRemovedItem"));
      }
    }
  }

  const renderCheckoutShoppingCartItems = (checkoutProducts: ICartItem[]) => {
    const itemCount = checkoutProducts.length;
    return (
      <div>
        {checkoutProducts &&
          checkoutProducts.map((productData: ICartItem, index: number) => {
            return (
              <div
                className={index === itemCount - 1 ? "grid grid-cols-5 gap-3 px-4 py-2 my-0 xs:w-full" : "grid grid-cols-5 gap-3 separator-xs px-4 py-2 my-0 xs:w-full"}
                key={`${productData.sku}-${index}`}
                data-test-selector={`divCheckoutItem${productData?.productId}`}
              >
                <div>
                  <ImageWrapper
                    seoTitle={productData.productName || ""}
                    imageLargePath={productData.productImageUrl}
                    dataTestSelector={`${productData?.productId}`}
                    cssClass={"max-w-full h-full object-contain"}
                    parentCSS={"col-span-1 w-20 h-20"}
                    width={50}
                    height={50}
                  />
                </div>

                <div className="grid grid-cols-5 col-span-4 gap-3">
                  <div className="col-span-3 ">
                    <Link href={productData.productLink} className="mb-2 font-semibold inline-block" data-test-selector={`linkProductName${productData.productId}`} prefetch={false}>
                      {productData.productName}
                    </Link>

                    <p className="mb-2 text-sm font-medium  custom-word-break" data-test-selector={`paraChildProductDescription${productData.productId}`}>
                      {productData.productDescription && <div dangerouslySetInnerHTML={{ __html: productData.productDescription }}></div>}
                    </p>

                    <p
                      onClick={() => removeCartItem(productData)}
                      className="mr-3 text-sm text-linkColor hover:text-hoverColor underline cursor-pointer"
                      data-test-selector={`paraRemoveCartItem${productData?.productId}`}
                    >
                      {commonTranslations("remove")}
                    </p>
                  </div>
                  <div className="col-span-1 space-y-2 text-sm text-center">
                    <label className="font-semibold text-gray-600" data-test-selector={`lblQuantity${productData?.productId}`}>
                      {commonTranslations("qty")}.
                    </label>
                    <p className="font-semibold" data-test-selector={`paraProductQuantity${productData?.productId}`}>
                      {productData.quantity}
                    </p>
                  </div>
                  <div className="col-span-1 space-y-2 text-sm text-right">
                    <label className="pb-2 font-semibold text-gray-600" data-test-selector={`lblTotal${productData?.productId}`}>
                      {commonTranslations("total")}
                    </label>
                    <p className="font-semibold" data-test-selector={`paraTotalPrice${productData?.productId}`}>
                      <FormatPriceWithCurrencyCode price={productData?.totalPrice || 0} currencyCode={currencyCode || "USD"} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="overflow-y-auto max-h-96 custom-scroll">
      {cartItems && cartItems.length > 0 ? renderCheckoutShoppingCartItems(cartItems) : commonTranslations("addProducts")}
    </div>
  );
};
export default CheckoutShoppingCartItems;
