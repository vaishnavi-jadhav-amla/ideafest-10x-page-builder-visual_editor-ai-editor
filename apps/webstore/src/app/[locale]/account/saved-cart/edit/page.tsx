import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";
import { EditSavedCart } from "@znode/base-components/account/saved-cart";

interface ISearchParams {
  cartNumber: string;
}

export default async function EditSavedCartPage({ searchParams }: { searchParams: ISearchParams }) {
  const messages = await fetchMessages(["SavedCart", "Common", "Cart", "Pagination", "BehaviorMsg"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <EditSavedCart classNumber={searchParams.cartNumber} />
    </NextIntlClientProvider>
  );
}
