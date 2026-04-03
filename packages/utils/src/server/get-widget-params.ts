interface IGetWidgetParams {
  widgetKey: string;
  typeOfMapping: string;
  widgetComponentKey: string;
  cmsMappingID?: string;
}
export function getWidgetParams(req: Request): IGetWidgetParams {
  const url = new URL(req.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);

  return {
    widgetKey: urlSearchParams.get("widgetKey") || "",
    typeOfMapping: urlSearchParams.get("typeOfMapping") || "",
    widgetComponentKey: urlSearchParams.get("widgetComponentKey") || "",
    cmsMappingID: urlSearchParams.get("cmsMappingID") || "",
  };
}