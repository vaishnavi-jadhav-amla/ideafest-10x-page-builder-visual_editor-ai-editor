"use client";

import { ICart, ICartItem, ICartSettings, IErrorMessage } from "@znode/types/cart";
import { sendAnalyticsEvent, useTranslationMessages } from "@znode/utils/component";
import { useCheckout, useModal } from "../../stores";
import { useEffect, useState } from "react";

import { ANALYTICS_EVENTS } from "@znode/constants/analytics-event";
import Button from "../common/button/Button";
import { COMMON } from "@znode/constants/common";
import { CartItems } from "./cart-items/CartItems";
import CartSummary from "./cart-summary/CartSummary";
import { DISCOUNT_TYPE } from "@znode/constants/checkout";
import { Heading } from "../common/heading";
import { IShoppingCartItem } from "@znode/types/shopping";
import { IUser } from "@znode/types/user";
import Link from "next/link";
import { LoadingSpinnerComponent } from "../common/icons";
import { Modal } from "../common/modal";
import Promo from "../common/promotions/Promo";
import { SaveForLater } from "./save-for-later/SaveForLater";
import { SavedCart } from "../account/saved-cart/SavedCart";
import { Separator } from "../common/separator";
import ShippingEstimator from "../shipping-estimator/ShippingEstimator";
import SignInOrRegisterText from "../sign-in-register-text/SignInOrRegisterText";
import { TotalPriceWithItems } from "./total-price-with-items/TotalPriceWithItems";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { getCartItems } from "../../http-request/cart/get-cart-items";
import { getCartNumber } from "../../http-request/cart/get-cart-number";
import { getCartSummary } from "../../http-request/cart";
import { useCartDetails } from "../../stores/cart";
import { useProduct } from "../../stores/product";
import { useRouter } from "next/navigation";

interface ICartProps {
  cartRequiredSettings: ICartSettings | null;
  userDetails: IUser | null;
  isEditing?: boolean;
}

export function Cart({ cartRequiredSettings, userDetails: user, isEditing }: ICartProps) {
  const router = useRouter();

  const cartTranslations = useTranslationMessages("Cart");
  const { cartSummaryRefresher, cartItemsRefresher, clearCart } = useCartDetails();
  const {
    updateCartCount,
    product: { cartCount },
  } = useProduct();
  const { setOrderSummaryData, orderSummaryData, isUnAssociatedProductEntity, setIsUnAssociatedProductEntity } = useCheckout();

  const [shoppingCartItems, setShoppingCartItems] = useState<ICartItem[] | null>(null);
  const [isCartItemsLoading, setIsCartItemsLoading] = useState(true);
  const [inventoryValidationMessage, setInventoryValidationMessage] = useState<IErrorMessage>({});
  const [isOrderSummaryLoading, setIsOrderSummaryLoading] = useState<boolean>(false);
  const [isCheckoutButtonDisabled, setIsCheckoutButtonDisabled] = useState(false);
  const [isShippingOptionSelected, setIsShippingOptionSelected] = useState(false);
  const [progress, setProgress] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useModal();

  const getCPCart = async (inputCartNumber?: string) => {
    const cartNumber = inputCartNumber ? inputCartNumber : await getCartNumber();
    if (cartNumber) {
      const cartData: ICart = await getCartItems(cartNumber);
      return cartData;
    }
    return null;
  };

  const fetchCartItems = async (cartNumber?: string) => {
    const cartData: ICart | null = await getCPCart(cartNumber);

    const cartCount = cartData?.cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    setIsUnAssociatedProductEntity(cartData?.isUnAssociatedProductEntity || false);
    if (cartCount && cartData?.cartItems) {
      updateCartCount(cartCount);
      setShoppingCartItems(cartData.cartItems);
    } else {
      setShoppingCartItems(null);
      updateCartCount(0);
      deleteCartCookies();
    }

    setIsCartItemsLoading(false);
  };

  const logInFlagAndUserExist =
    (String(cartRequiredSettings?.requireLogin) === "true" && user != null) ||
    (String(cartRequiredSettings?.requireLogin) === "false" && user != null) ||
    (String(cartRequiredSettings?.requireLogin) === "false" && user == null);

  const fetchCartSummary = async (inputCartNumber?: string) => {
    setIsOrderSummaryLoading(true);
    const cartNumber = inputCartNumber ?? (await getCartNumber());
    if (cartNumber) {
      const cartSummaryData = await getCartSummary(cartNumber, true, isShippingOptionSelected);
      if (cartSummaryData) {
        setOrderSummaryData(cartSummaryData);
      }
    }
    setIsOrderSummaryLoading(false);
    setProgress(false);
  };

  const fetchData = async () => {
    setProgress(true);
    setIsCartItemsLoading(true);
    setIsOrderSummaryLoading(true);
    const cartNumber = await getCartNumber();
    fetchCartItems(cartNumber);
    fetchCartSummary(cartNumber);
  };

  useEffect(() => {
    if (clearCart) {
      setShoppingCartItems(null);
      updateCartCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearCart]);

  
useEffect(() => {
  let shouldFetch =
    ((cartItemsRefresher || cartSummaryRefresher) && !cartCount) ||
    (!cartItemsRefresher && !cartSummaryRefresher && cartCount) ||
    (cartCount > 0);

  // MOCK: Enable data fetching when the Page Builder is in editing mode
  if(isEditing){
     shouldFetch = true;
  }

  if (shouldFetch && !progress) {
    fetchData();
  } else {
    setIsCartItemsLoading(false);
  }

  return(()=>{
        setProgress(false);
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [cartItemsRefresher, cartSummaryRefresher, cartCount]);


  useEffect(() => {
    validateCheckoutButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryValidationMessage, isUnAssociatedProductEntity]);

  const validateCheckoutButton = () => {
    const hasNonEmptyMessage = Object.values(inventoryValidationMessage).some((product) => product.message !== "");
    hasNonEmptyMessage || isUnAssociatedProductEntity ? setIsCheckoutButtonDisabled(true) : setIsCheckoutButtonDisabled(false);
  };

  const handledOnClickQuote = () => {
    router.push("/quote");
  };

  const handSaveCartClick = () => {
    openModal("SaveCart");
    document.body.classList.add("overflow-hidden");
  };

  const moveToCheckout = async () => {
    await checkoutProcess();
  };

  const checkoutProcess = async () => {
    if (!user?.userId) {
      setIsLoading(true);
      router.push("/login?returnUrl=checkout");
    } else {
      redirectToCheckoutPage();
    }
  };

  const redirectToCheckoutPage = () => {
    setIsLoading(true);
    router.push("/checkout");
  };

  const cartData =
    shoppingCartItems &&
    shoppingCartItems.map((items: IShoppingCartItem) => {
      return {
        id: items.sku,
        name: items.productName,
        price: items.extendedPrice,
        quantity: items.quantity,
      };
    });

  //TO DO Add Portal Flags
  const renderOrderSummary = () => {
    return shoppingCartItems
      ? logInFlagAndUserExist && (
          <>
            <div className="pb-1 lg:col-span-3">
              <div className="pb-2 md:flex md:space-x-2">
                {user && user.userId && cartRequiredSettings?.enableQuoteRequest ? (
                  <Button
                    type="primary"
                    size="small"
                    className="w-full"
                    dataTestSelector="btnRequestQuote"
                    onClick={handledOnClickQuote}
                    disabled={isCheckoutButtonDisabled}
                    ariaLabel="Request quote"
                  >
                    {cartTranslations("requestQuote")}
                  </Button>
                ) : null}
                <Button
                  type="primary"
                  size="small"
                  className={`w-full mt-2 md:mt-0 ${isCheckoutButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  dataTestSelector="btnCheckout"
                  loading={isLoading}
                  showLoadingText={true}
                  loaderColor="currentColor"
                  loaderWidth="20px"
                  loaderHeight="20px"
                  onClick={() => {
                    moveToCheckout();
                    sendAnalyticsEvent({ event: ANALYTICS_EVENTS.CHECKOUT, ecommerce: { currencyCode: cartRequiredSettings?.currencyCode, checkout: { products: cartData } } });
                  }}
                  disabled={isCheckoutButtonDisabled}
                  ariaLabel="checkout button"
                >
                  {cartTranslations("checkout")}
                </Button>
              </div>
              <CartSummary isLoading={isOrderSummaryLoading} cartSummary={orderSummaryData} />
            </div>
            {cartRequiredSettings?.showPromoSection ? (
              <div>
                <Promo type={DISCOUNT_TYPE.COUPON} isCart={true} />
              </div>
            ) : null}
            {cartRequiredSettings?.enableShippingEstimator ? <ShippingEstimator reloadShippingEstimator={true} setIsShippingOptionSelected={setIsShippingOptionSelected} /> : null}
          </>
        )
      : null;
  };

  const renderCartItems = (cartItems: ICartItem[]) => {
    return (
      <CartItems
        shoppingCartItemsList={cartItems}
        setCheckoutButtonDisabled={setIsCheckoutButtonDisabled}
        loginRequired={cartRequiredSettings?.requireLogin ?? COMMON.FALSE_VALUE}
        currencyCode={cartRequiredSettings?.currencyCode ?? "USD"}
        enableSaveForLater={Boolean(user?.userId && cartRequiredSettings?.enableSaveForLater)}
        isCheckoutButtonDisabled={isCheckoutButtonDisabled}
        inventoryValidationMessage={inventoryValidationMessage}
        setInventoryValidationMessage={setInventoryValidationMessage}
        user={user as IUser}
      />
    );
  };

  const renderCartItemsBody = (cartItems: ICartItem[] | null) => {
    if (isCartItemsLoading) {
      return <LoadingSpinnerComponent />;
    }

    return (
      <div>
        {cartItems ? (
          renderCartItems(cartItems)
        ) : (
          <div className="text-center">
            <p className="text-[25px] font-semibold margin-top-bottom" data-test-selector="paraEmptyShoppingCart">
              {cartTranslations("emptyShoppingCart")}
            </p>
            {!user ? (
              <p data-test-selector="paraSignInToSee">
                {cartTranslations("youHaveAccount")},{" "}
                <Link data-test-selector="linkSignInAccount" className="text-linkColor hover:text-hoverColor lowercase underline" href="/login">
                  {cartTranslations("signIn")}
                </Link>{" "}
                {cartTranslations("seeItems")}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-5">
      <div className={`grid lg:gap-5 mb-5 ${cartRequiredSettings?.requireLogin && !user ? "" : "lg:grid-cols-3"}`}>
        <div className={`${shoppingCartItems === null ? "lg:col-span-3 mt-3" : "lg:col-span-2 mt-3"}`}>
          {shoppingCartItems ? (
            <>
              <div className="items-center justify-between sm:flex" data-test-selector="divCartHeading">
                <Heading name={cartTranslations("cart")} level="h1" customClass="uppercase xs:w-auto py-0" dataTestSelector="hdgCart" />
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  {String(cartRequiredSettings?.requireLogin) === COMMON.TRUE_VALUE && !user ? <SignInOrRegisterText /> : ""}
                  <Button type="secondary" size="small" onClick={() => router.push("/")} className="flex-grow sm:px-5" dataTestSelector="btnContinueShopping">
                    {cartTranslations("continueShopping")}
                  </Button>
                  {user && user.userId ? (
                    <Button
                      type="secondary"
                      size="small"
                      className={`${isUnAssociatedProductEntity ? "pointer-events-none opacity-50" : ""}`}
                      dataTestSelector="btnSaveCart"
                      onClick={() => handSaveCartClick()}
                      ariaLabel="save cart"
                    >
                      {cartTranslations("saveCart")}
                    </Button>
                  ) : null}
                </div>
              </div>
              <Separator />
            </>
          ) : null}
          <TotalPriceWithItems
            isValid={((cartRequiredSettings?.requireLogin ?? COMMON.FALSE_VALUE) && !user) as boolean}
            cartTotal={orderSummaryData?.total ?? 0}
            cartCount={shoppingCartItems?.length ?? 0}
            currencyCode={orderSummaryData?.currencyCode}
            isOrderSummaryLoading={isOrderSummaryLoading}
            isCartItemsLoading={isCartItemsLoading}
          />
          {renderCartItemsBody(shoppingCartItems)}
          <div>{Boolean(user?.userId && cartRequiredSettings?.enableSaveForLater) && <SaveForLater currencyCode={cartRequiredSettings?.currencyCode ?? "USD"} />}</div>
        </div>
        {shoppingCartItems && logInFlagAndUserExist ? <div className="px-4 pb-4 rounded-sm shadow-md lg:col-span-1 lg:mt-3">{renderOrderSummary()}</div> : null}
      </div>
      {user && user?.userId ? (
        <Modal size="5xl" modalId="SaveCart" maxHeight="lg" customClass="overflow-hidden">
          <SavedCart />
        </Modal>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Cart;
