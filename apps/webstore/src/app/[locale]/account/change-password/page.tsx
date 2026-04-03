import { ChangePassword } from "@znode/base-components/account/change-password";
import { NextIntlClientProvider } from "next-intl";
import { getResourceMessages } from "@znode/utils/server";

export default async function ChangePasswordPage() {
  const userPasswordMessages = await getResourceMessages("UserPassword");
  const commonMessages = await getResourceMessages("Common");

  return (
    <NextIntlClientProvider messages={{ ...userPasswordMessages, ...commonMessages }}>
      <ChangePassword />
    </NextIntlClientProvider>
  );
}
