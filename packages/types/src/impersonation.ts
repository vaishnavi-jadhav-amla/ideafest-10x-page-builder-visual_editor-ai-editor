import { IAddress } from "./address";
import { IProfile, IWishListModel } from "./user";

export interface IImpersonation {
    token: string;
    crsName?: string;
    shopperName?: string;
    crsUserId?: number;
    webstoreUserId?: number;
    isImpersonation?: boolean;
    userName?: string;
    result?: boolean;
    portalId?: number;
    domainName?: string;
    storeCode: string;
    adminUserName?: string;
}

export interface IImpersonationResponse {
    permissionCode?: string;
    budgetAmount?: number;
    hasError?: boolean;
    errorMessage?: string;
    addressList?: IAddress[]; // Changed to an array of addresses
    isAdminUser?: boolean;
    roleName?: string;
    portalId?: number;
    baseUrl?: string;
    userName?: string;
    fullName?: string;
    roleId?: string;
    externalId?: string;
    crsName?: string;
    token?: string;
    userId?: number;
    accountId?: number;
    username?: string;
    password?: string;
    aspNetUserId?: string;
    email?: string;
    firstName?: string;
    phoneNumber?: string;
    profiles?: IProfile[];
    wishList?: IWishListModel[];
    profileId?: number;
    publishCatalogId?: number;
    rememberMe?: boolean;
    lastName?: string;
    emailOptIn?: boolean;
    smsOptIn?: boolean;
    storeCode?: string;
}

export interface IImpersonationRequest {
    token: string;
    domainName: string;
}