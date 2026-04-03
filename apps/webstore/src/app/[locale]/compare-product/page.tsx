import CompareProductDetails from "@znode/base-components/components/product/compare-product/CompareProductDetails";
import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";

async function CompareProductPage() {
  const localeMessages = ["Product", "Common", "Price"];
  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider
      messages={{
        ...messages,
      }}
    >
      <CompareProductDetails />
    </NextIntlClientProvider>
  );
}

export default CompareProductPage;
