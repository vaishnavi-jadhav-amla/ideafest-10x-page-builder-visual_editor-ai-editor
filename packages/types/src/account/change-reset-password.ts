export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  reTypeNewPassword: string;
  }
  
/** Represents the login user details. */
export interface IResetPasswordRequest {
  userName: string;
  passwordToken: string;
  newPassword: string;
  password?: string;
  baseUrl?: string;
  reTypeNewPassword?: string;
  currentPassword?: string;
}
