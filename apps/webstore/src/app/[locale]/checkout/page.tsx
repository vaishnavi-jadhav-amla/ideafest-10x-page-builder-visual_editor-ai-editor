import { fetchMessages, getPortalHeader } from "@znode/utils/server";

import { NextIntlClientProvider } from "next-intl";
import { PAGE_CONSTANTS } from "@znode/page-builder/constants";
import Client from "../client";
import { IPageStructure } from "@znode/types/visual-editor";
import { getPage } from "@znode/page-builder/utils/get-page";

const localeMessages = ["Checkout", "Common", "Discount", "Address", "Promotions", "Payment", "Register", "SignUp", "BehaviorMsg", "Orders"];

export default async function CheckoutPage() {
  const themeName = (await getPortalHeader()).themeName || process.env.DEFAULT_THEME;

  const url = PAGE_CONSTANTS.URLS.CHECKOUT;

  const pageStructure: IPageStructure = await getPage({
    url: url,
    pageCode: PAGE_CONSTANTS.PAGE_CODES.CHECKOUT,
    theme: themeName,
  });

  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <Client data={pageStructure.data} themeName={themeName || ""} configType={url} />
    </NextIntlClientProvider>
  );
}
