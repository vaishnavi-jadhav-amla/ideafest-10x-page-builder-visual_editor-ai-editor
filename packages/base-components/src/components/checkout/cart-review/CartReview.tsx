"use client";

import { ICart, ICartItem } from "@znode/types/cart";
import { useEffect, useState } from "react";

import CheckoutShoppingCartItems from "../shopping-cart-items/CheckoutShoppingCartItems";
import { Heading } from "../../common/heading";
import LoaderComponent from "../../common/loader-component/LoaderComponent";
import TotalTable from "../total-table/TotalTable";
import { getCartItems } from "../.././../http-request/cart/get-cart-items";
import { getCartNumber } from "../../../http-request/cart";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCartDetails, useProduct } from "../../../stores";

interface ICartReviewProps {
  isFromQuote?: boolean;
  portalCurrencyCode?: string;
  isShippingLoader?: boolean;
}

export const CartReview = ({ isFromQuote, portalCurrencyCode, isShippingLoader }: ICartReviewProps) => {
  const { refreshCartItems } = useCartDetails();
    const {
    product: { cartCount },
  } = useProduct();
  const cartTranslations = useTranslations("Checkout");
  const [cartItems, setCartItems] = useState<ICartItem[]>();
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCPCart = async () => {
    const cartNumber = await getCartNumber();
    if (cartNumber) {
      const cartData: ICart = await getCartItems(cartNumber);
      return cartData;
    }
    return null;
  };

  const fetchCartItems = async () => {
    const cartData: ICart | null = await getCPCart();
    if (cartData?.isUnAssociatedProductEntity || !cartData?.cartItems?.length) {
      !cartCount && refreshCartItems();
      router.push("/cart");
    } else {
      cartData?.cartItems && setCartItems(cartData.cartItems);
    }
  };

  const loader = () => {
    return (
      <div className="py-8">
        <LoaderComponent isLoading={true} width="50px" height="50px" />
      </div>
    );
  };

  return (
    <div data-test-selector="divOrderSummaryContainer" className="xs:w-full">
      <Heading
        customClass="uppercase"
        dataTestSelector={isFromQuote ? "hdgQuoteSummary" : "hdgOrderSummary"}
        level="h2"
        name={isFromQuote ? cartTranslations("quoteSummary") : cartTranslations("orderSummary")}
        showSeparator
      />
      {cartItems && Object.keys(cartItems || {}).length > 0 ? (
        <div className="w-full">
          <CheckoutShoppingCartItems cartItems={cartItems} currencyCode={portalCurrencyCode || "USD"} />
          {!isShippingLoader && <TotalTable currencyCode={portalCurrencyCode || "USD"} isFromQuote={isFromQuote ?? false} />}
        </div>
      ) : (
        loader()
      )}
    </div>
  );
};
