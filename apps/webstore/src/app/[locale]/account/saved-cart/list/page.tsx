import { SavedCartDetails } from "@znode/base-components/account/saved-cart";
import { fetchMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";

export default async function SavedCartDetailsPage() {
  const messages = await fetchMessages(["SavedCart", "Common", "Cart", "Pagination"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <SavedCartDetails />
    </NextIntlClientProvider>
  );
}
