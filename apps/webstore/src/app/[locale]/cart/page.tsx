import { NextIntlClientProvider } from "next-intl";
import { fetchMessages, getPortalHeader } from "@znode/utils/server";
import Client from "../client";
import { IPageStructure } from "@znode/types/visual-editor";
import { getPage } from "@znode/page-builder/utils/get-page";
import { PAGE_CONSTANTS } from "@znode/page-builder/constants";

const localeMessages = ["Checkout", "Discount", "Cart", "BehaviorMsg", "Promotions", "SavedCart", "Common", "Cart"];

export default async function CartIndexPage() {
  const themeName = (await getPortalHeader()).themeName || process.env.DEFAULT_THEME;

  const url = PAGE_CONSTANTS.URLS.CART;

  const pageStructure: IPageStructure = await getPage({
    url: url,
    pageCode: PAGE_CONSTANTS.PAGE_CODES.CART,
    theme: themeName,
  });

  const messages = await fetchMessages(localeMessages);

  return (
    <>
      <NextIntlClientProvider messages={{ ...messages }}>
        <Client data={pageStructure.data} themeName={themeName || ""} configType={url} />
      </NextIntlClientProvider>
      {/* TODO:*/}
      {/* <Wrapper widgetKey="1789" widgetCode="CartPageAdSpace" typeOfMapping="PortalMapping" displayName="CONTAINER WIDGET" cMSMappingId={portalId || 0} /> */}
    </>
  );
}
