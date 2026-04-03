/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { deleteKeyPrefix, getByKeyPrefix, deleteKey } from "@znode/cache";


export function createLayoutKey(value: string) {
  if(value === "footer" || value === "header") {
    return "layout";
  }
  return value;
};

export function createKeyPrefix(keys: string[]) {
  return `${keys[2]}:${createLayoutKey(keys[1])}_`;
};

export function createTagsBasedOnEventName(deserializedPayload: any, eventName: string) {
  const tag =
    Array.isArray(deserializedPayload?.Tag) && deserializedPayload.Tag.length > 0
      ? deserializedPayload.Tag.filter(Boolean)
      .map((t: string) => `webstore${t}`)
      : [];
  if (eventName === "VisualEditorPublishEvent") {
    const keys = deserializedPayload?.Key?.split("|") || [];
    return keys.length > 0
      ? { tag: [], parentKey: createKeyPrefix(keys) }
      : { tag: [], parentKey: "" };
  }

  if (eventName === "PortalPublishEvent" || eventName === "PortalUpdateEvent") {
    if (Array.isArray(deserializedPayload?.Tag) && deserializedPayload.Tag.length > 0) {
      for (let i = 0; i < deserializedPayload.Tag.length; i++) {
        const tagValue = String(deserializedPayload.Tag[i]);
        if (tagValue.includes("Portal_")) {
          const keys = tagValue.split("_");
          return { tag, parentKey: `str_${keys[1]}:` };
        }
      }
    }
  }
  if (
    eventName === "BannerSliderPublishEvent" ||
    eventName === "ContentContainerPublishEvent"
  ) {
    return { tag, parentKey: "str_" };
  }
  if (eventName === "CatalogPublishEvent") {
    if (Array.isArray(deserializedPayload?.Tag) && deserializedPayload.Tag.length > 0) {
      for (let i = 0; i < deserializedPayload.Tag.length; i++) {
        const tagValue = String(deserializedPayload.Tag[i]);
        if (tagValue.includes("Catalog_")) {
          const keys = tagValue.split("_");
          return { tag, parentKey: `${keys[1]}_page:` };
        }
      }
    }
  } 
  return { tag, parentKey: "" };
}

export async function clearTagLevelCaching(requestData: any): Promise<{ tag: string[]; parentKey?: string }> {
  try {
    const validJsonString = requestData.Payload.replace(/'/g, "\"");
    const deserializedPayload = JSON.parse(validJsonString);
    const checkEventName = ["PortalPublishEvent", "PortalUpdateEvent", "VisualEditorPublishEvent", "BannerSliderPublishEvent", "ContentContainerPublishEvent", "CatalogPublishEvent"];
    const eventName = requestData.EventName;
    const { tag, parentKey }: { tag: string[]; parentKey?: string } = checkEventName.includes(eventName)
      ? createTagsBasedOnEventName(deserializedPayload, eventName) :
      { tag: (Array.isArray(deserializedPayload?.Tag) && deserializedPayload.Tag.length > 0)  && deserializedPayload?.Tag.map((t: string) => `webstore${t}`) || [], parentKey: "" };
    return { tag, parentKey: parentKey && parentKey?.toLocaleLowerCase() || "" };
  } catch (error) {
    console.error("Error parsing cache payload:", error);
    return { tag: [], parentKey: "" };
  }
}

export async function clearPortalCaching(tag: string[], parentKey?: string) {
  let storeCode = parentKey !== "" && parentKey;
  Object.values(tag).forEach((tags) => {
    tags.split(",").forEach((singleTag) => {
      if (singleTag.includes("Portal_")) {
        const portalTag = singleTag.split("Portal_");
        if (portalTag.length > 1) {
          storeCode = portalTag[1];
        }
      } else if (singleTag.includes("GetPortalApprovalDetailsById")) {
        const parts = singleTag.split("_");
        if (parts.length > 1) {
          storeCode = parts[1];
        }
      }
    });
  });
  if (storeCode) {
    await deleteKeyPrefix(String(`str_${storeCode}`).toLocaleLowerCase());
  }
}

export async function clearProductPageCaching(tag: string[]) {
  const ids = tag.map((item) => item.match(/\d+/)?.[0]).filter(Boolean);
  const keys = await getKeys("*_page");
  for (const currentKey of keys) {
    if (ids.some((id) => currentKey.includes(`pdp_${id}`))) {
      await deleteKey(currentKey);
    }
  }
}

export async function clearCategoryPageCaching(tag: string[]) {
  const ids = tag.map((item) => item.match(/\d+/)?.[0]).filter(Boolean);
  const keys = await getKeys("*_page");
  for (const currentKey of keys) {
    if (ids.some((id) => currentKey.includes(`plp_${id}`))) {
      await deleteKey(currentKey);
    }
  }
}


export async function clearHomePageCaching(parentKey?: string) {
  parentKey && (await deleteKeyPrefix(parentKey));
}

export async function clearLayoutPageCaching(parentKey?: string) {
  const keys = await getKeys("*_layout*");
  parentKey && (await deleteKeyPrefix(parentKey));
  for (const currentKey of keys) {
    await deleteKey(currentKey);
  }
}

export async function clearCartPageCaching() {
  const keys = await getKeys("*_cart");
  for (const currentKey of keys) {
    if (currentKey.includes("cart_")) {
      await deleteKey(currentKey);
    }
  }
}

export async function clearCheckoutPageCaching() {
  const keys = await getKeys("*_checkout");
  for (const currentKey of keys) {
    if (currentKey.includes("checkout_")) {
      await deleteKey(currentKey);
    }
  }
}

export async function getKeys(type: string) {
  const keys = await getByKeyPrefix(type);
  return keys;
}
