import { IChangePassword } from "@znode/types/user";
import { NextIntlClientProvider } from "next-intl";
import { ResetPassword } from "@znode/base-components/components/reset-password";
import { getResourceMessages } from "@znode/utils/server";

export default async function ResetPasswordPage({ searchParams: { passwordToken, userName } }: { searchParams: { passwordToken: string; userName: string } }) {
  const userPasswordMessages = await getResourceMessages("UserPassword");
  const commonMessages = await getResourceMessages("Common");
  return (
    <NextIntlClientProvider  messages={{ ...userPasswordMessages, ...commonMessages }}>
        <ResetPassword passwordInfo={{ passwordToken, userName } as IChangePassword} />
    </NextIntlClientProvider>
  );
}
