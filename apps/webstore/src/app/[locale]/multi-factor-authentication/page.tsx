import { ISearchParams } from "@znode/types/search-params";
import MultiFactorAuthRenderer from "@znode/base-components/components/authentication/MultiFactorAuthRenderer";
import { decryptData, getCookieRuntime } from "@znode/utils/component";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";
import { COMMON } from "@znode/constants/common";

const localeMessages = ["MultiFactorAuthentication", "Common"];
const MultiFactorAuthentication = async ({ searchParams }: { searchParams?: ISearchParams }) => {
  const userDetails: string = getCookieRuntime("userDetails") || "";
  if (!userDetails) redirect("/login");
  const userDetailsArray = userDetails.split(COMMON.ZNODE_USER_DETAILS_SALT);
  if (!userDetailsArray || userDetailsArray.length < 3) redirect("/");
  const [messages, decryptedUsername, decryptedUserId, decryptedPassword] = await Promise.all([
    fetchMessages(localeMessages),
    decryptData(userDetailsArray[0] || ""),
    decryptData(userDetailsArray[1] || ""),
    decryptData(userDetailsArray[2] || ""),
  ]);

  return (
    <NextIntlClientProvider
      messages={{
        ...messages,
      }}
    >
      <MultiFactorAuthRenderer
        username={decryptedUsername || ""}
        userId={Number(decryptedUserId || 0)}
        password={decryptedPassword || ""}
        redirectURL={searchParams?.returnUrl || ""}
      />
    </NextIntlClientProvider>
  );
};
export default MultiFactorAuthentication;
