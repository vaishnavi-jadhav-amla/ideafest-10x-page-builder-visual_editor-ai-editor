import "react-toastify/dist/ReactToastify.css";

import { MyAccountLayout } from "@znode/base-components/layout-components";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { checkPermissions } from "@znode/agents/headers";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { getSavedUserSession } from "@znode/utils/common";
import { redirect } from "next/navigation";

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default async function AccountLayout({ children }: LayoutProps) {
  const userData = await getSavedUserSession();
  const userId = Number(userData?.userId || 0);
  if (userId == 0) {
    redirect("/login");
  }
  const messages = await fetchMessages(["MyAccount", "Common", "Pagination", "Breadcrumb"]);
  const portalData = await getPortalDetails();
  const permission = checkPermissions({ attributes: portalData.globalAttributes || [] });
  //TO DO: Separate the locale objects based on what the section renders; now, it's added, for example.
  //The commonly used keys in the account section will be included in the "MyAccount" object.
  return (
    <NextIntlClientProvider locale="en" messages={{ ...messages }}>
      <MyAccountLayout permission={permission}>{children}</MyAccountLayout>
    </NextIntlClientProvider>
  );
}
