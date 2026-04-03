import { NextIntlClientProvider } from "next-intl";
import { OrderHistory } from "@znode/base-components/account/order";
import { fetchMessages } from "@znode/utils/server";
import { getGeneralSettingList } from "@znode/agents/general-setting";

export default async function OrderListPage() {
  const messages = await fetchMessages(["OrderHistory", "Common", "Pagination", "Payment", "Promotions", "Discount", "BehaviorMsg", "Orders", "SwitchAccount"]);
const generalSetting = await getGeneralSettingList();
  return (
    <NextIntlClientProvider locale="en" messages={{ ...messages }}>
      <OrderHistory priceRoundOff={generalSetting.priceRoundOff} />
    </NextIntlClientProvider>
  );
}
