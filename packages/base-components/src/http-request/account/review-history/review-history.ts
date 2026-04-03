import { IPageList } from "@znode/types/portal";
import { IReview } from "@znode/types/review";
import { httpRequest } from "../../base";

export const getUserReviewHistory = async (props: { pageSize: number | string; pageNumber: number | string }) => {
  const { pageSize, pageNumber } = props;

  return await httpRequest<{ data: IReview[]; totalResults: number; totalPages: number; pageNumber: number; pageSize: number; pageList: IPageList[]; pageIndex: number }>({
    endpoint: "/api/account/review/get-history",
    method: "GET",
    queryParams: { pageSize, pageNumber },
  });
};
