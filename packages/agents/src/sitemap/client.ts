import { APP } from "@znode/constants/app";
import { generateDomainBasedToken } from "@znode/utils/server";

export async function readXMl(storeCode: string, feedType: string) {
  let baseUrl = APP.BASE_URL;
  baseUrl += `v2/site-maps/${feedType}?storeCode=${storeCode}`;
  const config = {
    headers: {
      "Content-Type": "application/xml",
      charset: "utf-8",
      Authorization: "basic " + generateDomainBasedToken(),
    },
  };

  try {
    const response = await fetch(baseUrl || "", config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    return "";
  }
}

export async function siteMapXMLByFileName(fileName: string, storeCode: string) {
  let baseUrl = APP.BASE_URL;
  baseUrl += `v2/site-maps/xml-file-content/${fileName}?storeCode=${storeCode}`;
  const config = {
    headers: {
      "Content-Type": "application/xml",
      charset: "utf-8",
      Authorization: "basic " + generateDomainBasedToken(),
    },
  };

  try {
    const response = await fetch(baseUrl || "", config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    return "";
  }
}
