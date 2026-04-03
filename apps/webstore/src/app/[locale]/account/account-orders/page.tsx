import { AccountOrders } from "@znode/base-components/account/account-orders";
import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";

export default async function AccountOrderPage(urlParams: {
  searchParams: {
    userId: number;
  };
}) {
  const messages = await fetchMessages(["Common", "Orders", "Pagination"]);
  const userId = urlParams?.searchParams?.userId;
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <AccountOrders userId = {userId}/>
    </NextIntlClientProvider>
  );
}
