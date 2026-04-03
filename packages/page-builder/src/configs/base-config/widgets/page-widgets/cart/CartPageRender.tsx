import { ICartRenderProps } from "./CartPageConfig";
import { CartPage } from "@znode/base-components/page-widget/cart-page";
import { ICartSettings } from "@znode/types/cart";
import { IUser } from "@znode/types/user";
import { ICartPageDetailsResponse } from "@znode/types/cart-page-details";
import { useIsEditing } from "../../../../../utils/use-puck";

export function CartPageRender(props: ICartRenderProps) {
  const isEditing = useIsEditing(props.puck);

  if (!props.response || !props.response.data) {
    return null;
  }

  const data: ICartPageDetailsResponse = props.response?.data;

  const cartPagePortalDetails: ICartSettings | null = data?.cartPagePortalDetails || null;
  const user: IUser | null = data?.user || null;

  return <CartPage cartPagePortalDetails={cartPagePortalDetails} user={user} isEditing={isEditing} />;
}