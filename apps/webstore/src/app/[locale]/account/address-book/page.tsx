
import { NextIntlClientProvider } from "next-intl";
import { getResourceMessages } from "@znode/utils/server";
import { AddressBook } from "@znode/base-components/account/address-book";

export default async function AddressBookPage() {
  const addressMessages = await getResourceMessages("Address");
  const commonMessages = await getResourceMessages("Common");
  const myAccountMessages = await getResourceMessages("MyAccount");
  return (
    <NextIntlClientProvider locale="en" messages={{ ...addressMessages, ...commonMessages, ...myAccountMessages }}>
      <AddressBook />
    </NextIntlClientProvider>
  );
}
