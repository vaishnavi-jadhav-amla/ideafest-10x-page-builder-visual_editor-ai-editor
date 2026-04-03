import { getPreviewContentPageByPageCode, getProductionContentPageByPageCode } from "@znode/agents/visual-editor";

export const getPreviewContentPageDetails = async (props: {contentPageCode: string, portalCode: string, versionNumber?: number}) => {

  const pageData = await getPreviewContentPageByPageCode(props.contentPageCode, props.portalCode, "All", props?.versionNumber);
  return pageData;
};

export const getProductionContentPageDetails = async (props: {contentPageCode: string, portalCode: string}) => {
  
  const pageData = await getProductionContentPageByPageCode(props.contentPageCode, props.portalCode, "All");
  return pageData;
};
