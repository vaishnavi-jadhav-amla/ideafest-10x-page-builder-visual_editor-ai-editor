import { ANALYTICS_EVENTS } from "@znode/constants/analytics-event";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import { NavLink } from "../../common/nav-link";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { getCartNumber } from "../../../http-request/cart/get-cart-number";
import { removeAllItems } from "../../../http-request";
import { sendAnalyticsEvent } from "@znode/utils/component";
import { useCartDetails } from "../../../stores";
import { useToast } from "../../../stores/toast";
import { useTranslations } from "next-intl";

interface IDisplayTotalProps {
  cartTotal: number;
  cartCount: number;
  currencyCode: string | undefined;
  isOrderSummaryLoading: boolean;
  isCartItemsLoading: boolean;
  isValid: boolean;
}

export function TotalPriceWithItems({ cartTotal, cartCount, currencyCode = "USD", isOrderSummaryLoading, isCartItemsLoading, isValid }: IDisplayTotalProps) {
  const cartTranslations = useTranslations("Cart");
  const { clearCartData } = useCartDetails();
  const { error } = useToast();

  const removeAllCartItems = async () => {
    const status = await removeAllItems({
      cartType: ORDER_DATA_TYPE.CARTS,
      cartNumber: await getCartNumber(),
    });

    if (!status) {
      error(cartTranslations("errorFailedToRemovedAllItem"));
    } else {
      clearCartData();
    }
  };

  return cartCount > 0 ? (
    <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
      <div className="flex-1">
        {!isOrderSummaryLoading && !isCartItemsLoading && !isValid ? (
          <Heading
            name={
              <>
                {cartTranslations("yourTotalIs")} <FormatPriceWithCurrencyCode price={cartTotal} currencyCode={currencyCode} /> {cartTranslations("for")} {cartCount}{" "}
                {cartCount > 1 ? cartTranslations("items") : cartTranslations("item")}
              </>
            }
            dataTestSelector="hdgTotalPriceWithItems"
            level="h2"
            customClass="uppercase lg:w-auto"
          />
        ) : null}
      </div>
      <NavLink
        url="javascript:void(0)"
        className="xs:px-0 sm:px-2 text-linkColor hover:text-hoverColor cursor-pointer underline"
        onClick={(e) => {
          e.preventDefault();
          removeAllCartItems();
          sendAnalyticsEvent({ event: ANALYTICS_EVENTS.REMOVE_CART_ITEM, ecommerce: { remove: {} } });
        }}
        dataTestSelector="linkRemoveAllItems"
        ariaLabel="Remove all items"
      >
        {cartTranslations("removeAllItems")}
      </NavLink>
    </div>
  ) : null;
}
