import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Customer_getCustomerPortalProfilelist, PortalProfile_list } from "@znode/clients/v1";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase } from "@znode/utils/server";

import { COMMON } from "@znode/constants/common";
import { IAddress } from "@znode/types/address";
import { IFilterTuple } from "@znode/types/filter";
import { IProfileData } from "@znode/types/profile";
import { IUser } from "@znode/types/user";
// import { orderHistory } from "../order";
import { getAddressListData } from "../../address/checkout/address";

const sortDashBoardAddress = (billingAddress: IAddress, shippingAddress: IAddress) => {
  const formatAddress = (address: IAddress) => ({
    companyName: address.companyName,
    displayName: address.displayName,
    firstName: address.firstName,
    lastName: address.lastName,
    address1: address.address1,
    address2: address.address2,
    cityName: address.cityName,
    stateName: address.stateName,
    countryName: address.countryName,
    postalCode: address.postalCode,
    phoneNumber: address.phoneNumber,
  });

  const dashboardData: IAddress = {
    dashboardBillingAddress: { ...formatAddress(billingAddress), addressId: billingAddress.addressId },
    dashboardShippingAddress: {
      ...formatAddress(shippingAddress),
      addressId: shippingAddress.addressId,
    },
  };

  return dashboardData;
};

// Get user dashboard data to display.
export async function getDashBoard(userId: number, portalId: number, isAddressBook: boolean) {
  try {
    const userModel: IUser = {};
    await bindDashBoardData(userModel, userId, portalId, isAddressBook);
    const billingAddress = userModel?.addressList?.billingAddress || {};
    const shippingAddress = userModel?.addressList?.shippingAddress || {};

    let dashboardData = {};
    if (billingAddress && shippingAddress) {
      dashboardData = sortDashBoardAddress(billingAddress, shippingAddress);
    }
    return dashboardData;
  } catch (error) {
    logServer.error(AREA.DASHBOARD, errorStack(error));
    return null;
  }
}

//Bind dashboard data.
export async function bindDashBoardData(userModel: IUser, userId: number, portalId: number, isAddressBook: boolean) {
  if (userModel) {
    userModel.addressList = await getAddressListData(userId, isAddressBook ?? false);
    // userModel.orderList = await orderHistory(portalId);
    await bindUserProfileDropdownData(userModel, userId, portalId);
    return userModel;
  } else return null;
}

//Bind customer profile data.
export async function bindUserProfileDropdownData(userModel: IUser, userId: number, portalId: number): Promise<IProfileData | null> {
  try {
    const filters: IFilterTuple[] = getDashBoardFilters(portalId, undefined, userId, undefined, undefined);
    const sort: { [key: string]: string } = {};
    sort["profileId"] = COMMON.ASC;

    if (userModel.isAdminUser ?? false) {
      let profileData = PortalProfile_list(undefined, undefined, undefined, undefined, undefined);
      profileData = convertCamelCase(profileData);
      return profileData;
    } else {
      let customerProfile = await Customer_getCustomerPortalProfilelist(undefined, filters, sort, undefined, undefined);
      customerProfile = convertCamelCase(customerProfile);
      const customerName = customerProfile.customerName;
      const profiles = {
        profileId: customerProfile?.profiles?.profileId,
        profileName: customerProfile?.profiles?.profileName,
      };
      return { customerName, profiles };
    }
  } catch (error) {
    logServer.error(AREA.DASHBOARD, errorStack(error));
    return null;
  }
}

/**
 * Get filters for user.
 * @param portalId
 * @param localeId
 * @param catalogId
 * @returns filters.
 */
function getDashBoardFilters(portalId?: number, localeId?: number, userId?: number, isActive?: number, znodeCatalogId?: number) {
  const filters: FilterCollection = new FilterCollection();

  if (portalId !== undefined && portalId > 0) filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
  if (localeId !== undefined && localeId > 0) filters.add(FilterKeys.LocaleId, FilterOperators.Equals, localeId.toString());
  if (userId !== undefined && userId > 0) filters.add(FilterKeys.UserId, FilterOperators.Equals, userId.toString());
  if (isActive !== undefined) filters.add(FilterKeys.IsActive, FilterOperators.Equals, isActive.toString());
  if (znodeCatalogId !== undefined && znodeCatalogId > 0) filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, znodeCatalogId.toString());
  return filters.filterTupleArray;
}
