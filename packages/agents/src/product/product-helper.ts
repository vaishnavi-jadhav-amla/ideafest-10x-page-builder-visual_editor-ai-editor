import { ExpandCollection, ExpandKeys } from "@znode/utils/server";

import { IBaseAttribute } from "@znode/types/attribute";
import { IHighlight } from "@znode/types/product";
import { PRODUCT } from "@znode/constants/product";

export const getHighlightListFromAttributes = (attributes: IBaseAttribute[], sku: string, publishProductId: number): IHighlight[] => {
  const highlightList: IHighlight[] = [];

  const highlightsAttribute = attributes.find((attr) => attr.attributeCode === PRODUCT.HIGHLIGHTS);

  if (highlightsAttribute) {
    const sortedHighlightValues = highlightsAttribute?.selectValues?.sort((selectValueA, selectValueB) => (selectValueA.displayOrder || 0) - (selectValueB.displayOrder || 0));

    for (const { value, code, path, displayOrder } of sortedHighlightValues || []) {


      highlightList.push({
        highlightName: value,
        highlightCode: code,
        mediaPath: path ?? "",
        publishProductId,
        sku,
        displayOrder: displayOrder ?? 0,
      });
    }
  }
  return highlightList;
};


export function getProductInventoryExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.Promotions);
  expands.add(ExpandKeys.Inventory);
  expands.add(ExpandKeys.ProductReviews);
  expands.add(ExpandKeys.Pricing);
  expands.add(ExpandKeys.ProductTemplate);
  expands.add(ExpandKeys.AddOns);
  return expands;
}
