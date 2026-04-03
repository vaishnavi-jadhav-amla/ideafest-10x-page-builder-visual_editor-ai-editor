/* eslint-disable no-console */
"use server";

import type { Data } from "@measured/puck";
import { validateAndGenerateSeoUrl } from "./validate-and-generate-seo-url";
import { removeApiResponse, replaceDynamicSegment } from "./common";

import { createOrUpdate } from "@znode/cache";
import { getPortalHeader } from "@znode/utils/server";
import { redirect } from "next/navigation";
import { ErrorCodes } from "@znode/types/enums";
import { generatePageStructure } from "./page-structure/generate-page-structure";

interface ISetPage {
  url: string;
  data: Data;
  theme: string;
}

const slashRegex = /\//g;

export async function setPage(params: ISetPage) {
  let schema = removeApiResponse(params.data);
  const pageStructureJson = generatePageStructure(schema, { url: params.url });
  let url = params.url;

  const seoData = await validateAndGenerateSeoUrl(params.url);
  let contentPageCode;
  if (seoData) {
    const seoTypeName = String(seoData.name).toLowerCase();
    const seoId = seoData.seoId;
    url = `${seoTypeName}/${seoId}`;
    if (seoTypeName === "content page") {
      contentPageCode = seoData.seoCode;
    }
  }

  let urlWithPlaceholder = replaceDynamicSegment(url);

  // ** Note: Replace Slash with underscore
  const publicId = urlWithPlaceholder.replace(slashRegex, "_");
  try {
    const portalData = await getPortalHeader();
    if (!portalData.storeCode) {
      throw Error(ErrorCodes.InvalidStoreCode);
    }
    await createOrUpdate(String(portalData.storeCode), publicId, pageStructureJson);
  } catch (error: any) {
    if (error && error.message == ErrorCodes.InvalidStoreCode) {
      redirect("/error");
    }
    console.error("Error uploading file:", error, publicId);
  }
}
