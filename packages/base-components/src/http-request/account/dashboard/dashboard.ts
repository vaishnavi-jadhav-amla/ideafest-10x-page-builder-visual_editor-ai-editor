import { IDashboardDetailData, IDashboardRequest } from "@znode/types/account";

import { httpRequest } from "../../base";

export const getDashBoard = async (props: IDashboardRequest) => {
  const { isAddressBook } = props;
  const cardModel = await httpRequest<IDashboardDetailData>({ endpoint: `/api/account/dashboard?isAddressBook=${isAddressBook}` });
  return cardModel;
};
