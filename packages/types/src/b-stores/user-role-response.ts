export interface IBStoresUserRoleModel {
  userId: number;
  portalId: number;
  isOwner: boolean;
  isManager: boolean;
}

export interface IBStoresUserRoleResponseModel {
  errorCode?: number;
  errorMessage?: string;
  hasError?: boolean;
  bStoresUserRole?: IBStoresUserRoleModel;
}
