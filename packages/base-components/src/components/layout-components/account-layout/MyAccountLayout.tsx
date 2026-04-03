"use client";

import { IPermissions, IUser } from "@znode/types/user";
import { getCustomPath, useTranslationMessages } from "@znode/utils/component";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { AccountNavigation } from "../../account/navigation/AccountNavigation";
import { ClientBreadCrumbs } from "../../common/breadcrumb";
import { IClientBreadCrumbsData } from "@znode/types/breadcrumb";
import { getSavedUserSessionCallForClient } from "@znode/utils/common";
import { useSession } from "next-auth/react";

export function MyAccountLayout({ children, permission }: Readonly<{ children: React.ReactNode; permission: IPermissions | null }>) {
  const accountTranslations = useTranslationMessages("Breadcrumb");

  //TODO : const restrictedRoutes: string[] = ["change-password", "forgot-password", "ResetPassword", "ValidateImpersonationSession"];
  const searchParams = useSearchParams();
  const nextUrl = usePathname() || "";
  const [session, setSession] = useState<IUser | null>(null);
  const { status } = useSession();

  useEffect(() => {
    const fetchUserSession = async () => {
      const sessionUser = await getSavedUserSessionCallForClient();
      setSession(sessionUser);
    };
    fetchUserSession();
  }, [status]);

  const getTranslatedCustomPath = (breadCrumbsData: IClientBreadCrumbsData) => {
    return {
      title: accountTranslations(breadCrumbsData.title || "account"),
      routingLabel: accountTranslations(breadCrumbsData.routingLabel),
      routingPath: breadCrumbsData.routingPath,
      nestedRouting: breadCrumbsData.nestedRouting,
      nestedRoutingPath: breadCrumbsData.nestedRoutingPath,
      nestedRoutingTitle: breadCrumbsData.nestedRoutingTitle ? accountTranslations(breadCrumbsData.nestedRoutingTitle) : "",
      nestedRoutingLabel: accountTranslations(breadCrumbsData.nestedRoutingLabel || "accountsLabel"),
    };
  };

  const breadCrumbsData: IClientBreadCrumbsData = getCustomPath(searchParams, nextUrl);
  const translatedCustomPath: IClientBreadCrumbsData = getTranslatedCustomPath(breadCrumbsData);
  return (
    <div className="w-full mb-4 print-style">
      <div>
        <div className="no-print">
          <ClientBreadCrumbs customPath={translatedCustomPath} />
        </div>
        <div className="md:flex">
          {session && (
            <div className="w-full sm:w-full md:w-56 no-print md:mr-5" data-test-selector="divMyAccountContainer">
              <AccountNavigation permission={permission}></AccountNavigation>
            </div>
          )}
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
