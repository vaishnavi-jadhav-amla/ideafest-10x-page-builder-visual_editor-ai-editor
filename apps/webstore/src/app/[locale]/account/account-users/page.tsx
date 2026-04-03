import { AccountUsers } from "@znode/base-components/components/account/users";
import { getResourceMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";

export default async function AccountUsersPage() {
  const commonMessages = await getResourceMessages("Common");
  const myAccountMessages = await getResourceMessages("MyAccount");
  const paginationMessages = await getResourceMessages("Pagination");
  return (
    <NextIntlClientProvider locale="en" messages={{ ...commonMessages, ...myAccountMessages, ...paginationMessages }}>
      <AccountUsers />
    </NextIntlClientProvider>
  );
}
