import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";
import { BStoreRegistration } from "@znode/base-components/components/b-store-registration";
export default async function BStoreRegistrationPage() {

  const localeMessages = ["BStoreRegistration", "Common", "UserPassword"];
  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <BStoreRegistration />
    </NextIntlClientProvider>
  );
}