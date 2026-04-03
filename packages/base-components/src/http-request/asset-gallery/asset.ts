import { httpRequest } from "../base";

interface IGalleryResponse {
  imagesData: {
    mediaServerPath: string;
    fileName: string;
  }[];
  totalResults: number;
}

export const getAssetGalleryImages = async (props: { pageIndex: number; pageSize: number; mediaType: string; query?: string }) => {
  const response = await httpRequest<IGalleryResponse>({ endpoint: "/api/asset-gallery", queryParams: props });
  return response;
};
