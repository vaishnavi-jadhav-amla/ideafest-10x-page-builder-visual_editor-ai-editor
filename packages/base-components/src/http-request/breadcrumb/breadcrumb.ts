import { objectToQueryString } from "@znode/utils/component";

export async function getBreadcrumbs(breadcrumbProps: { id: number; isParentCategory: number }) {
  const queryString: string = objectToQueryString(breadcrumbProps);
  const breadcrumbsData = await fetch(`/api/breadcrumbs?${queryString}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await breadcrumbsData.json();
  return response;
}
