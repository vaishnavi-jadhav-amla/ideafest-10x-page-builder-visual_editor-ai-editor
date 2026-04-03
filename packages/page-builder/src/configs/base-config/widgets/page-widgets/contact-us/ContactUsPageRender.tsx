"use client";
import { IContactUsRenderProps } from "./ContactUsPageConfig";
import { ContactUs } from "@znode/base-components/components/page-widget";
export function ContactUsPageRender(props: Readonly<IContactUsRenderProps>) {
  return <ContactUs {...props} />;
}
