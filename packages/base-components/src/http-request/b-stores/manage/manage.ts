import { httpRequest } from "../../base";

export const manageBStore = async () => {
  const response = await httpRequest<string>({
    endpoint: "/api/b-stores/manage",
    method: "POST",
  });
  return response;
};
