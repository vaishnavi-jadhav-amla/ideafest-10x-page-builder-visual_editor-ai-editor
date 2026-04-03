import { IPortalDetail } from "@znode/types/portal";
import { NextIntlClientProvider } from "next-intl";
import PreviousPurchasesList from "@znode/base-components/account/previous-purchases/PreviousPurchasesList";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { isPreviousPurchasesEnabled } from "@znode/utils/common";
import { redirect } from "next/navigation";

export default async function PreviousPurchasesListPage() {
  const portalData: IPortalDetail = await getPortalDetails();
  const enablePreviousPurchases = isPreviousPurchasesEnabled(portalData);
  
  if (!enablePreviousPurchases) {
    redirect("/404");
  }
  
  const messages = await fetchMessages(["Common", "Pagination", "PreviousPurchases", "BehaviorMsg"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <PreviousPurchasesList />
    </NextIntlClientProvider>
  );
}
