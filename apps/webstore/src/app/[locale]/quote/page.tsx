import { Checkout } from "@znode/base-components/components/checkout";
import { NextIntlClientProvider } from "next-intl";
import { getCheckoutRequiredUserDetails } from "@znode/agents/checkout";
import { fetchMessages } from "@znode/utils/server";
import { BreadCrumbs } from "@znode/base-components/common/breadcrumb";
import { getSavedUserSession, stringToBooleanV2 } from "@znode/utils/common";
import { redirect } from "next/navigation";
import { getCartPageSettings } from "@znode/agents/cart";
import { ICartSettings } from "@znode/types/cart";
import { IUser } from "@znode/types/user";
import { getGeneralSettingList } from "@znode/agents/general-setting";

export default async function QuoteIndexPage() {
  const localeMessages = ["Quote", "Common", "Checkout", "Discount", "Address", "Payment", "Orders"];
  const messages = await fetchMessages(localeMessages);
  const userDetails = await getSavedUserSession();
  const checkoutPortalData = await getCartPageSettings(true);
  const generalSetting = await getGeneralSettingList();

  const isQuoteRequestEnabled = stringToBooleanV2(checkoutPortalData?.enableQuoteRequest || "");
  const { enableShippingAddressSuggestion, recaptchaDetails } = await getCheckoutRequiredUserDetails();

  const BreadCrumbsData = {
    title: "Quote",
    routingLabel: "Home",
    routingPath: "/",
  };

  if (!isQuoteRequestEnabled) {
    return redirect("/404");
  }

  return (
    <>
      <BreadCrumbs customPath={BreadCrumbsData} />
      <NextIntlClientProvider messages={{ ...messages }}>
        <Checkout
          enableShippingAddressSuggestion={enableShippingAddressSuggestion}
          isFromQuote={true}
          recaptchaDetails={recaptchaDetails}
          userDetails={userDetails as IUser}
          checkoutPortalData={checkoutPortalData as ICartSettings}
          generalSetting={generalSetting}
        />
      </NextIntlClientProvider>
    </>
  );
}
