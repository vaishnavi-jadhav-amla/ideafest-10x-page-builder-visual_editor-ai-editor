import { IReviewRequest, IWriteReviewResponse } from "@znode/types/review";
import { httpRequest } from "../base";

export const writeReview = async (props: IReviewRequest) => {
  const writeReviewResponse = await httpRequest<IWriteReviewResponse>({
    endpoint: "/api/review",
    method: "POST",
    body: props,
  });

  return writeReviewResponse;
};
