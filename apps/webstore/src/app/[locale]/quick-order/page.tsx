import { fetchMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";
import { QuickOrder } from "@znode/base-components/components/quick-order";

const localeMessages = ["QuickOrder", "DynamicFormTemplate", "Common"];
export default async function QuickOrderPage() {
  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <QuickOrder />
    </NextIntlClientProvider>
  );
}
