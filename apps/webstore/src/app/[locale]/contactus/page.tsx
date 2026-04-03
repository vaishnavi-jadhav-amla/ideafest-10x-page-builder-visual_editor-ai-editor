import React from "react";
import Client from "../client";
import { getPage } from "@znode/page-builder/utils/get-page";
import { fetchMessages, getPortalHeader } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";
import { NotFound } from "@znode/base-components/components/not-found";
import { IPageStructure } from "@znode/types/visual-editor";
const ContactUsPage = async () => {
  const themeName = (await getPortalHeader()).themeName || process.env.DEFAULT_THEME;

  const url = "contactus";
  const pageStructure: IPageStructure = await getPage({
    url,
    pageCode: "contactus",
    theme: themeName as string,
  });

  if (!pageStructure.data.content.length) {
    return <NotFound />;
  }
  const localeMessages = ["Common", "ContactUs"];
  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider locale="en" messages={{ ...messages }}>
      <Client data={pageStructure.data} themeName={themeName || ""} configType="contact-us" />
    </NextIntlClientProvider>
  );
};
export default ContactUsPage;
