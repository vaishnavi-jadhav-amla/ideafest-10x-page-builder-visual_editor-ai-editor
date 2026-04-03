import Client from "./client";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { getPage, IPageVariant } from "@znode/page-builder/utils/get-page";
import { notFound } from "next/navigation";
import { fetchMessages, getPortalHeader } from "@znode/utils/server";
import { validateAndGenerateSeoUrl } from "@znode/page-builder/utils/validate-and-generate-seo-url";
import { IPageStructure } from "@znode/types/visual-editor";
import { CURRENT_JSON_VERSION, PAGE_CONSTANTS } from "@znode/page-builder/constants";

interface IPageProps {
  searchParams?: { [key: string]: string | undefined };
}

const localeMessages = [
  "Blog",
  "Product",
  "Barcode",
  "Common",
  "Layout",
  "DropDown",
  "Facet",
  "Pagination",
  "FacetChipList",
  "Addon",
  "Price",
  "Menu",
  "Login",
  "StoreLocator",
  "ContactUs",
  "Feedback",
  "Search",
  "VoiceSearch",
  "ChangeLocale",
  "Impersonation",
  "DynamicFormTemplate",
  "SwitchAccount",
  "Checkout",
  "Discount",
  "Cart",
  "BehaviorMsg",
  "Promotions",
  "SavedCart",
  "Address",
  "Payment",
  "Register",
  "SignUp",
  "Orders",
];

async function page(props: Readonly<IPageProps>) {
  let url = props.searchParams?.url ?? "";
  let contentPageCode = props.searchParams?.contentPageCode;
  const contentPageId = props.searchParams?.contentPageId;
  const pageCode = props.searchParams?.pageCode ?? "";
  const storeCode = props.searchParams?.storeCode ?? "";
  const publishState = props.searchParams?.publishState ?? "";
  const isDebug = props.searchParams?.isDebug ? Boolean(props.searchParams?.isDebug) : false;
  const versionNumberParam = props.searchParams?.versionNumber;
  const versionNumber = versionNumberParam && !isNaN(Number(versionNumberParam)) ? Number(versionNumberParam) : undefined;
  const mode = props.searchParams?.mode;

  const themeName = (await getPortalHeader()).themeName || (process.env.DEFAULT_THEME as string);
  if (!url) {
    notFound();
  }

  const seoData = await validateAndGenerateSeoUrl(url);
  if (seoData) {
    const seoTypeName = String(seoData.name).toLowerCase();
    const seoId = seoData.seoId;
    url = `${seoTypeName}/${seoId}`;
    if (seoTypeName === "content page") {
      contentPageCode = seoData.seoCode;
    }
  }

  const messages = await fetchMessages(localeMessages);

  const pageVariant: IPageVariant = (PAGE_CONSTANTS.ARRAYS.HEADER_FOOTER_PAGE_CODE.find((variant) => pageCode.includes(variant)) || PAGE_CONSTANTS.GENERAL.ALL) as IPageVariant;
  const pageStructure: IPageStructure & { isMigrationFailed?: boolean } = await getPage({
    url: url,
    pageCode: pageCode,
    storeCode: storeCode,
    contentPageCode: contentPageCode,
    publishState: publishState,
    isDebug: isDebug,
    theme: themeName,
    contentPageId: Number(contentPageId || 0),
    pageVariant,
    versionNumber,
  });

  if (pageStructure?.isMigrationFailed) {
    return <p>{`This page is not compatible with the current app version(v${CURRENT_JSON_VERSION}) of the editor.`}</p>;
  }
  const widgets = pageStructure.data.content
    .filter((item) => item.type === "widgets")
    .map((item) => item.props.configWidget)
    .flat();
  pageStructure.widgets = widgets;
  pageStructure.data.content = pageStructure.data.content.filter((item) => item.type !== "widgets");

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <Client pageStructure={pageStructure} pageCode={pageCode} storeCode={storeCode} contentPageCode={contentPageCode} url={url} themeName={themeName} mode={mode} />
    </NextIntlClientProvider>
  );
}

export default page;
