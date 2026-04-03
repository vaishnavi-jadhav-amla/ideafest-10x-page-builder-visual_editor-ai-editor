import { AccountInformation } from "@znode/base-components/account/account-information";
import { NextIntlClientProvider } from "next-intl";
import { ValidationMessage } from "@znode/base-components/common/validation-message";
import { getResourceMessages } from "@znode/utils/server";

export default async function AccountInformationPage() {
  const commonTranslation = await getResourceMessages("Common");
  const accountTranslation = await getResourceMessages("AccountInformation");
  return (
    <NextIntlClientProvider locale="en" messages={{ ...commonTranslation, ...accountTranslation }}>
      <AccountInformation />
      <ValidationMessage/>
    </NextIntlClientProvider>
  );
}