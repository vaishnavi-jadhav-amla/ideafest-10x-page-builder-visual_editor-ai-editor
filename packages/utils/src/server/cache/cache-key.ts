/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFilterTuple } from "@znode/types/filter";

export function generateTagName(tagName: string, ...ids: string[]): string {

  const tagList: string[] = [];
  const tagCount: number = tagName.split(",").length;
  // check if ids are more than the tags provided
  if (tagCount < (ids?.length || 0)) {
    for (let index = 0; index < (ids || []).length; index++) {
      tagList.push(`${tagName}_${ids[index]}`);
    }
  }
  // check if tags are more than the ids provided
  else if (tagCount > (ids?.length || 0)) {
    for (let index = 0; index < tagCount; index++) {
      tagList.push(ids.length > index && ids[index] ? `${tagName.split(",")[index]}_${ids[index]}` : tagName.split(",")[index] ?? "");    
    }
  } else {
    for (let index = 0; index < tagCount; index++) {
      if(!(tagName.split(",").map(t => t.trim())[index] == "undefined"))
          tagList.push(`${tagName.split(",")[index]}_${ids?.[index]}`);
    }
  }
  return tagList.join(",");
}

export function generateTagWithKey(cacheKey: string, tagName: string, ...ids: number[]): string {
  const tagList: string[] = [];
  const tagCount: number = tagName.split(",").length;
  // check if ids are more than the tags provided
  if (tagCount < (ids?.length || 0)) {
    for (let index = 0; index < (ids || []).length; index++) {
      tagList.push(`${tagName}_${ids[index]}`);
    }
  }
  // check if tags are more than the ids provided
  else if (tagCount > (ids?.length || 0)) {
    for (let index = 0; index < tagCount; index++) {
      tagList.push(ids.length > index && ids[index] ? `${tagName.split(",")[index]}_${ids[index]}` : tagName.split(",")[index] || "");    
    }
  } else {
    for (let index = 0; index < tagCount; index++) {
      tagList.push(`${tagName.split(",")[index]}_${ids?.[index]}`);
    }
  }
  if (cacheKey != null || cacheKey !== undefined) {
    tagList.push(cacheKey);
  }

  return tagList.join(",");
}

export function generateCacheKey(cacheKey: string, ...ids: number[]): string {
  // Check if the key contains '_' as a suffix.
  // If the key does not contain '_', then '_' will be added to the key.
  if (!cacheKey.endsWith("_") && (ids?.length || 0) > 0) {
    return `${cacheKey}_${ids.join("_")}`;
  }
  // Check if the ids length is greater than 0.
  else if ((ids?.length || 0) > 0) {
    return `${cacheKey}${ids.join("_")}`;
  } else {
    return cacheKey;
  }
}

export function clearCache(cacheKey: string) {
  const apiUrl = `${process.env.API_URL}/api/revalidate/${cacheKey}`;
  const requestOptions: RequestInit = {
    method: "GET",
    cache: "no-store",
  };

  try {
    fetch(apiUrl, requestOptions)
      .then((response) => {
        // eslint-disable-next-line no-empty
        if (response.ok) {
        } else {
          //logger.error("RabbitMQ", "Have issue in route handler response");
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {
        //logger.error("RabbitMQ:", error);
      });
  } catch (error) {
    //logger.error("RabbitMQ:", ErrorStack(error));
  }
}

export function addCacheTagsIntoFilter(cacheTags: string, filter: IFilterTuple[]): void {
  filter.push({ filterName: "CacheTags", filterOperator: "", filterValue: cacheTags });
}

export function getDetailsFromHeader(key: string, headers?: any): string {
  return headers?.headerList?.get(key) ?? "";
}

export function generateTagNameArray(tagName: string, ...ids: string[]): string[] {
  const tagList: string[] = [];
  const tagCount: number = tagName.split(",").length;
  // check if ids are more than the tags provided
  if (tagCount < (ids?.length || 0)) {
    for (let index = 0; index < (ids || []).length; index++) {
      tagList.push(`${tagName}_${ids[index]}`);
    }
  }
  // check if tags are more than the ids provided
  else if (tagCount > (ids?.length || 0)) {
    for (let index = 0; index < tagCount; index++) {
      tagList.push(ids.length > index ? `${tagName.split(",")[index]}_${ids[index]}` ?? "" : tagName.split(",")[index] ?? "");
    }
  } else {
    for (let index = 0; index < tagCount; index++) {
      tagList.push(`${tagName.split(",")[index]}_${ids?.[index]}`);
    }
  }
  return tagList;
}
