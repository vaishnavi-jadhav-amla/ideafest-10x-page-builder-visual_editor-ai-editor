import { getPortalDetails } from "@znode/agents/portal";
import { checkExistingUserSession } from "@znode/agents/impersonation";
import { SingleSignInLogin } from "@znode/base-components/components/single-sign-in";
import { NextIntlClientProvider } from "next-intl";
import { getResourceMessages } from "@znode/utils/server";

export default async function SingleSignInUser({ searchParams }: { searchParams: { loginToken?: string; redirectUrl?: string } }) {
  const token = searchParams?.loginToken ?? "";
  const redirectUrl = searchParams?.redirectUrl ?? "";

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl">Error: Missing Login Token</p>
      </div>
    );
  }

  const encodedToken = encodeURIComponent(token);
  const portalData = await getPortalDetails();
  const singleSignInMessages = await getResourceMessages("SingleSignIn");
  const { isUserLoggedIn } = await checkExistingUserSession(encodedToken);
  const portalId = portalData.portalId || 0;

  return (
    <NextIntlClientProvider messages={{ ...singleSignInMessages }}>
      <SingleSignInLogin token={token} isUserLoggedIn={isUserLoggedIn} portalId={portalId} redirectUrl={redirectUrl} />
    </NextIntlClientProvider>
  );
}
