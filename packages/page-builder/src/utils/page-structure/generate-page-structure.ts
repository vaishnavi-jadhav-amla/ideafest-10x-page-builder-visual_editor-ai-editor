import { Data } from "@measured/puck";
import { IPageStructure } from "@znode/types/visual-editor";

export function generatePageStructure(schema: Data, params: { url: string }, pageStructure?: IPageStructure): { key: string; data: Data } {
  const contentJson: { key: string; data: Data; widgets: any[] } = {
    key: params.url,
    data: schema,
    widgets: pageStructure?.widgets || [],
    ...(pageStructure?.pageVersion && { pageVersion: pageStructure.pageVersion }),
  };

  return contentJson;
}
