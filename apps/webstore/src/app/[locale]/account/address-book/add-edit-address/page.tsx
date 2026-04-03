import { getAddressListCount, getUserAccessFlag } from "@znode/agents/address";
import { getCartPageSettings } from "@znode/agents/cart";
import { AddEditAddress } from "@znode/base-components/address/index";
import { ADDRESS } from "@znode/constants/address";
import { IAddAddressRequest, IEditAddressRequest } from "@znode/types/address";
import { IUser } from "@znode/types/user";
import { getSavedUserSession } from "@znode/utils/common";
import { getResourceMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";
import { redirect } from "next/navigation";

export default async function AddEditAddressPage(urlParams: {
  searchParams: {
    addressId: number;
  };
}) {
  const addressListCount = await getAddressListCount();
  const addressMessages = await getResourceMessages("Address");
  const commonMessages = await getResourceMessages("Common");
  const userDetails = await getSavedUserSession();
  const checkoutPortalData = await getCartPageSettings();
  const accessFlag = getUserAccessFlag(userDetails as IUser);

  const addressId = urlParams?.searchParams?.addressId;

  const addAddressRequestForAddressBook: IAddAddressRequest = {
    type: ADDRESS.ADDRESS_BOOK_TYPE,
    addressListCount: addressListCount,
  };

  const editAddressRequestForAddressBook: IEditAddressRequest = {
    addressId: addressId ?? 0,
    otherAddressId: 0,
    type: ADDRESS.ADDRESS_BOOK_TYPE,
    isFromEdit: true,
    isGuestUser: false,
  };
  if (!accessFlag) return redirect("/404");
  return (
    <NextIntlClientProvider locale="en" messages={{ ...addressMessages, ...commonMessages }}>
      <AddEditAddress
        editAddressData={editAddressRequestForAddressBook}
        addAddressData={addAddressRequestForAddressBook}
        addressType={addressId > 0 ? ADDRESS.EDIT : ADDRESS.ADD}
        userDetails={userDetails as IUser}
        enableAddressValidation={checkoutPortalData?.enableAddressValidation as boolean}
      />
    </NextIntlClientProvider>
  );
}
