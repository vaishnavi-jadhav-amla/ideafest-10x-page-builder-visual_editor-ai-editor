import { IProductHighlights } from "@znode/types/product";
import { httpRequest } from "../base";

export const getHighlightInfoByCode = async (props: IProductHighlights) => {
  const highlightData = await httpRequest<IProductHighlights>({ endpoint: "/api/highlight/highlight-code", method: "POST", body: props });
  return highlightData;
};