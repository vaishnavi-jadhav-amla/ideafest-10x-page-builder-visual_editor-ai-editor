import { NextIntlClientProvider } from "next-intl";
import { checkExistingUserSession } from "@znode/agents/impersonation";
import { getPortalDetails } from "@znode/agents/portal";
import { getResourceMessages } from "@znode/utils/server";
import { ImpersonationLogin } from "@znode/base-components/components/impersonation";
import { redirect } from "next/navigation";

interface ISearchParams {
  token: string;
}

export default async function impersonateUser({ searchParams }: { searchParams: ISearchParams }) {
  const { token } = searchParams;
  const encodedToken = encodeURIComponent(token);

  const portalData = await getPortalDetails();
  const { isUserLoggedIn, sameUserFlag } = await checkExistingUserSession(encodedToken || "", portalData.storeCode || "");
  const enableCartRedirection = portalData?.portalFeatureValues?.persistentCart || false;
  const portalId = portalData.portalId || 0;
  if (sameUserFlag) redirect("/");

  const loginMessages = await getResourceMessages("Impersonation");
  return (
    <NextIntlClientProvider messages={{ ...loginMessages }}>
      <ImpersonationLogin token={encodedToken} portalId={portalId} enableCartRedirection={enableCartRedirection} isUserLoggedIn={isUserLoggedIn} />
    </NextIntlClientProvider>
  );
}
