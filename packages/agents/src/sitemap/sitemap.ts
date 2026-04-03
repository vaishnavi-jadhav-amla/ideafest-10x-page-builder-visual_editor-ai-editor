import { readXMl, siteMapXMLByFileName } from "./client";
import { SITE_MAP_FEED_TYPE } from "@znode/constants/site-map";


export async function getSiteMapByFeedType(storeCode: string, fileName: string) {
  let sitemapXML;
  switch (fileName) {
    case "sitemap.xml":
      sitemapXML = await readXMl(storeCode, SITE_MAP_FEED_TYPE.XML_SITEMAP);
      break;
    case "googleproductfeed.xml":
      sitemapXML = await readXMl(storeCode, SITE_MAP_FEED_TYPE.GOOGLE);
      break;
    case "bingproductfeed.xml":
      sitemapXML = await readXMl(storeCode, SITE_MAP_FEED_TYPE.BING);
      break;
    case "xmlproductfeed.xml":
      sitemapXML = await readXMl(storeCode, SITE_MAP_FEED_TYPE.XML);
      break;
  }
  return sitemapXML;
}

export async function getSiteMapByFileName(filename: string, storeCode: string) {
  let data = await siteMapXMLByFileName(filename, storeCode);
  if (typeof data === "string") data = JSON.parse(data);
  return data;
}
