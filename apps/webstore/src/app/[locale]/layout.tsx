import "@znode/base-components/tailwind-config/global.css";

import { authLoginOptions, fetchMessages, getPortalHeader } from "@znode/utils/server";
import { getMetaData, getSchemaDetails } from "@znode/agents/portal";
import { getPage, initSubscription } from "@znode/page-builder/utils/get-page";
import { localBusinessSchema, organizationSchema, websiteSchema } from "packages/utils/src/component/schema-helper";

import { ActivityFlagProvider } from "../../user-activity-tracking/ActivityFlagProvider";
import { AnalyticsManager } from "@znode/base-components/components/analytics-manager/AnalyticsManager";
import { IPageStructure } from "@znode/types/visual-editor";
import { JsonLd } from "@znode/base-components/common/schema";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { PageLayout } from "@znode/page-builder/page-layout";
import SessionLayout from "./SessionLayout";
import TrackingPixel from "@znode/base-components/components/tracking-pixel/TrackingPixel";
import { getServerSession } from "next-auth";
import { getUrl, sanitizeAndNormalizeCss } from "@znode/utils/common";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const portalData = await getMetaData();
  const headersList = headers();
  const canonicalUrl = getUrl(headersList);
  const details = portalData;
  return {
    title: details?.websiteTitle,
    description: details?.websiteDescription,
    icons: {
      icon: `${details?.mediaServerUrl}${details?.faviconImage}`,
    },
    robots: details?.defaultRobotTag,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authLoginOptions);
  const headersList = headers();
  const currentUrl = getUrl(headersList) ?? "";
  const messages = await fetchMessages([
    "Barcode",
    "Common",
    "Layout",
    "DropDown",
    "Menu",
    "Impersonation",
    "Search",
    "VoiceSearch",
    "Login",
    "ChangeLocale",
    "DynamicFormTemplate",
    "Product",
    "Price",
    "SwitchAccount",
  ]);

  const portalHeader = await getPortalHeader();
  const themeName = portalHeader?.themeName || (process.env.DEFAULT_THEME as string);
  const enableUserActivity = portalHeader?.userActivityEnabled ?? false;
  const schemaDetails = await getSchemaDetails();
  const organization = organizationSchema(schemaDetails, currentUrl);
  const website = websiteSchema(currentUrl);
  const business = localBusinessSchema(schemaDetails, currentUrl);
  const themeData = await getPortalHeader(undefined, "themeData");
  if (process.env.NODE_ENV === "production") {
    await initSubscription();
  }

  const theme = {
    "data-theme": themeName.toLocaleLowerCase(),
  };

  const pageStructure: IPageStructure = await getPage({
    url: "layout", // !! layout only
    theme: themeName,
    pageVariant: "Layout",
  });

  return (
    <html lang="en" {...theme}>
      <head>
        {process.env.NODE_ENV === "production" && <TrackingPixel />}
        <style
          dangerouslySetInnerHTML={{
            __html: sanitizeAndNormalizeCss(String(themeData)),
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <NextIntlClientProvider
          messages={{
            ...messages,
          }}
        >
          <ActivityFlagProvider enableUserActivity={enableUserActivity} />
          <SessionLayout session={session}>
            <PageLayout
              configParams={{
                configType: "",
                theme: themeName || "",
              }}
              pageStructure={pageStructure}
            >
              <div className="flex-1 pl-4 pr-4" aria-label="Page editor section">
                {children}

                {process.env.NODE_ENV === "production" && <AnalyticsManager />}
                <JsonLd jsonLdData={organization} />
                <JsonLd jsonLdData={website} />
                <JsonLd jsonLdData={business} />
              </div>
            </PageLayout>
          </SessionLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
