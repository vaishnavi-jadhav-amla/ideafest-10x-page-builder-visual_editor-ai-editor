"use client";

import { CheckCircleIcon, CrossCircleIcon } from "../common/icons";

import Button from "../common/button/Button";
import { CustomImage } from "../common/image";
import { NavLink } from "../common/nav-link";
import { useProduct } from "../../stores";
import { useTranslations } from "next-intl";

const AddToCartNotification = () => {
  const commonMessages = useTranslations("Common");
  const {
    product: { addToCartNotificationData, addToCartTriggerNotification },
    setAddToCartTriggerNotification,
    setAddToCartNotificationData,
  } = useProduct();

  if (addToCartNotificationData === null && !addToCartTriggerNotification) {
    return null;
  }
  const { imageLargePath, sku, quantity } = addToCartNotificationData || {};
  return (
    <div className="fixed top-0 right-0 z-50 w-full pb-4 bg-transparent rounded-md drop-shadow-md">
      <div className="relative p-4 bg-gray-200 shadow-lg">
        <div className="flex flex-col items-center grid-cols-8 gap-4 md:grid">
          <div className="flex items-center col-span-2 text-xl font-semibold text-green-500 uppercase md:ml-5">
            <CheckCircleIcon viewBox="0 0 35 28" height="32px" width="32px" color="#16a34a" dataTestSelector="svgAddToCart" />
            <span data-test-selector="spnAddToCart">{commonMessages("addToCart")}</span>
          </div>
          <div className="col-span-4">
            <div className="flex items-center justify-center">
              <div className="flex w-12 h-12 md:w-16 md:h-16">
                <CustomImage
                  src={imageLargePath ?? ""}
                  alt="product image"
                  width={80}
                  height={80}
                  className="h-full object-contain"
                  loading="lazy"
                  dataTestSelector="imgProduct"
                />
              </div>
              <div className="flex text-md">
                <p className="px-3">
                  <span className="font-medium">{commonMessages("sku")}: </span>
                  {sku}
                </p>
                {quantity ? (
                  <p>
                    <span className="font-medium uppercase">{commonMessages("qty")}: </span>
                    {quantity}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end col-span-2 md:mr-5" data-test-selector="divViewCartAndCheckout">
            <NavLink
              url="/cart"
              dataTestSelector="linkViewCartAndCheckout"
              className="btn btn-primary text-sm md:mr-8 md:px-5"
              onClick={() => {
                setAddToCartTriggerNotification(false);
                setAddToCartNotificationData(null);
              }}
             ariaLabel="Go to cart"
            >
              {commonMessages("viewCartAndCheckout")}
            </NavLink>
            <Button
              type="text"
              size="small"
              dataTestSelector="btnCartNotificationClose"
              className="absolute top-2 right-2 md:static"
              startIcon={<CrossCircleIcon viewBox="0 0 36 28" height="23px" width="23px" color="#000" dataTestSelector="svgCartNotificationClose" />}
              onClick={() => {
                setAddToCartTriggerNotification(false);
                setAddToCartNotificationData(null);
              }}
              ariaLabel="cart cross circle icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartNotification;
