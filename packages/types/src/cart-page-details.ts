import { ICartSettings } from "./cart";
import { IUser } from "./user";


export interface ICartPageDetailsResponse {
  cartPagePortalDetails: ICartSettings | null;
  user: IUser | null;
  isEditing?: boolean;
}
