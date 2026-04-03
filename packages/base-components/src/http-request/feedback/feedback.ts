import { IFeedbackFormValues, IFeedbackResponse } from "@znode/types/feedback";
import { httpRequest } from "../base";

export const submitFeedback = async (payload: IFeedbackFormValues) => {
    const data = await httpRequest<IFeedbackResponse>({
        endpoint: "/api/submit-feedback",
        method: "POST",
        body: payload
      });
      return data;
  };