import { NextIntlClientProvider } from "next-intl";
import { QuoteOrderDetails } from "@znode/base-components/account/quote/QuoteOrderDetails";
import { fetchMessages } from "@znode/utils/server";
import { getCartPageSettings } from "@znode/agents/cart";
import { getUserQuoteDetails } from "@znode/agents/account";
import { redirect } from "next/navigation";

export default async function QuoteOrder({ params }: { params: { id: string } }) {
  const localeMessages = ["Quote", "Common", "Checkout", "Payment", "Orders"];
  const messages = await fetchMessages(localeMessages);
  const storeSettings = await getCartPageSettings();

  const quoteDetails = await getUserQuoteDetails(params?.id || "");
  if (!quoteDetails) {
    return redirect("/404");
  }
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <QuoteOrderDetails quoteDetails={quoteDetails} currencyCode={storeSettings?.currencyCode ?? "USD"} />
    </NextIntlClientProvider>
  );
}
