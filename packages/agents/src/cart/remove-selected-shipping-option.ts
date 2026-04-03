import { CART_COOKIE } from "@znode/constants/cookie";
import { cookies } from "next/headers";
import { getCartNumber } from "./cart-number/cart-number";
import { removeShippingByClassNumber } from "../checkout";
import { IUser } from "@znode/types/user";

export async function removeSelectedShippingOption(user: IUser | null): Promise<void> {
  try {
    const cookieStore = cookies();
    let cartNumber = cookieStore.get(CART_COOKIE.CART_NUMBER)?.value;
    if (!cartNumber) {
      const userId: number = user?.userId ?? 0;
      if (userId) {
        cartNumber = (await getCartNumber(userId)) || "";
      }
    }

    if (cartNumber) {
      await removeShippingByClassNumber(cartNumber);
    }
  } catch(error) {
    // ignore failure to avoid blocking cart flow
     // eslint-disable-next-line no-console
     console.error("Failed to remove selected shipping option:", error);
  }
}
