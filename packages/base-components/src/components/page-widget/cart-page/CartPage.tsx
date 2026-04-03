import { BreadCrumbs } from "../../common/breadcrumb";
import { Cart } from "../../cart";
import { ICartPageDetailsResponse } from "@znode/types/cart-page-details";

type ICartPageProps = ICartPageDetailsResponse;

export function CartPage(props: ICartPageProps) {
  const { cartPagePortalDetails, user, isEditing = false } = props;

  const BreadCrumbsData = {
    title: "Cart",
    routingLabel: "Home",
    routingPath: "/",
  };

  return (
    <>
      <BreadCrumbs customPath={BreadCrumbsData} />
      <Cart cartRequiredSettings={cartPagePortalDetails} userDetails={user}  isEditing={isEditing} />
    </>
  );
}
