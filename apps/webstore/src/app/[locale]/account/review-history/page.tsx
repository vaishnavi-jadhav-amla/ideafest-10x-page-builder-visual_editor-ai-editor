import { NextIntlClientProvider } from "next-intl";
import { ReviewHistory } from "@znode/base-components/account/review-history";
import { fetchMessages } from "@znode/utils/server";

export default async function ReviewHistoryPage() {
  const messages = await fetchMessages(["Common", "ReviewHistory", "Pagination"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <ReviewHistory />
    </NextIntlClientProvider>
  );
}
