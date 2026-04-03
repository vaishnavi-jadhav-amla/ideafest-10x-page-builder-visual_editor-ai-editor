import { NextIntlClientProvider } from "next-intl";

import { fetchMessages } from "@znode/utils/server";
import { Wishlist } from "@znode/base-components/account/wishlist";

export default async function WishListPage() {
  const messages = await fetchMessages(["Common", "WishList", "Pagination"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <Wishlist />
    </NextIntlClientProvider>
  );
}
