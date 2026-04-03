import { ForgotPassword } from "@znode/base-components/components/forgot-password";
import { NextIntlClientProvider } from "next-intl";
import { getResourceMessages } from "@znode/utils/server";

export default async function ForgotPasswordPage() {
  const userPasswordMessages = await getResourceMessages("UserPassword");
  const commonMessages = await getResourceMessages("Common");
  return (
    <NextIntlClientProvider messages={{ ...userPasswordMessages, ...commonMessages }}>
      <ForgotPassword />
    </NextIntlClientProvider>
  );
}
