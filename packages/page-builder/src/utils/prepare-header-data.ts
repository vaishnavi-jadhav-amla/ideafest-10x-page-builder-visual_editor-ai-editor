"use server";

import { getCartCount, getCartNumber } from "@znode/agents/cart";

import { CART_COOKIE } from "@znode/constants/cookie";
import { IPageStructure } from "@znode/types/visual-editor";
import { IUser } from "@znode/types/user";
import { getCookieRuntime } from "@znode/utils/component";
import { getMegaMenuCategories } from "@znode/agents/category";
import { getSavedUserSession } from "@znode/utils/common";

export async function prepareHeaderData(preparedDataCache: IPageStructure) {
  if (preparedDataCache.key === "layout" && Array.isArray(preparedDataCache.headerData?.content)) {
    const headerEntry = preparedDataCache.headerData.content.map((item, index) => ({ index, item })).find(({ item }) => item?.type === "Header");
    if (headerEntry && headerEntry.item?.props?.response?.data) {
      const { index } = headerEntry;
      const userData: IUser | null = await getSavedUserSession();
      let cartNumber = getCookieRuntime(CART_COOKIE.CART_NUMBER);
      if (!cartNumber) {
        cartNumber = Number(userData?.userId) > 0 ? await getCartNumber(Number(userData?.userId)) : "";
      }
      const cartCountResponse = await getCartCount(String(cartNumber) || "", "Header");
      preparedDataCache.headerData.content[index].props.response.data.cartCount = cartCountResponse || 0;
      if (Number(userData?.userId) > 0) {
        const { categories, isUserLoggedIn } = await getMegaMenuCategories(userData, false);
        preparedDataCache.headerData.content[index].props.response.data.categories = categories;
        preparedDataCache.headerData.content[index].props.response.data.isUserLoggedIn = isUserLoggedIn;
      }
    }
  }
  return preparedDataCache;
}
