import { fetchMessages, getPortalHeader } from "@znode/utils/server";

import { Dashboard } from "@znode/base-components/account/dashboard";
import { IAddress } from "@znode/types/address";
import { IUser } from "@znode/types/user";
import { NextIntlClientProvider } from "next-intl";
import { getDashBoard } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

interface IDashBoardDetails {
  dashboardBillingAddress: IAddress;
  dashboardShippingAddress: IAddress;
}

export default async function DashboardPage() {
  const messages = await fetchMessages(["Dashboard", "OrderHistory", "WishList", "Common", "Payment", "ReturnOrder"]);
  const userData = await getSavedUserSession();
  const userId = Number(userData?.userId || 0);
  const portalData = await getPortalHeader();
  const dashBoardDetails  = await getDashBoard(Number(userId), portalData.portalId, Boolean(true)) as IDashBoardDetails;
  const { dashboardShippingAddress, dashboardBillingAddress } = dashBoardDetails || {dashboardBillingAddress: {}, dashboardShippingAddress: {} } as IAddress;
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <Dashboard shippingAddress={dashboardShippingAddress} billingAddress={dashboardBillingAddress} userData={userData as IUser} />
    </NextIntlClientProvider>
  );
}
