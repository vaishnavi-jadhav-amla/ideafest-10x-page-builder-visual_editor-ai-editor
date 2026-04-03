
import { httpRequest } from "../base";
import { IContactFormValues, IContactResponse } from "@znode/types/contact";

export const contactUs = async (payload: IContactFormValues) => {
    const data = await httpRequest<IContactResponse>({
        endpoint: "/api/contact-us",
        method: "POST",
        body: payload
      });
      return data;
  };