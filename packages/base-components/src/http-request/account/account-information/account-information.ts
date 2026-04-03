import { IAccountAddress } from "@znode/types/account";

export const getAccountInformation = async () => {
  const accountUserOrderData = await fetch("/api/account/account-information", { cache: "no-store" });
  const response = await accountUserOrderData.json();
  return response;
};

export const updateAccountInformation = async (props: IAccountAddress) => {
  const updateInformationReq = await fetch("/api/account/account-information/update-address", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      cache: "no-store",
    },
    body: JSON.stringify(props),
  });
  const response = await updateInformationReq.json();
  return response;
};