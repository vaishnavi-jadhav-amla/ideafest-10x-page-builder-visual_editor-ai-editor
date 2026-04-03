
import {  INewsLetterResponse } from "@znode/types/common";
import { httpRequest } from "../base";

export const signUpForNewsLetter = async (payload:{email:string}) => {
  const response = await httpRequest<INewsLetterResponse>({ endpoint: "/api/common/sign-up-news-letter" ,
    method: "POST",
    body: payload
  });
  return response;
};