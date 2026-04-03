"use client";

import Button from "../common/button/Button";
import { useProduct } from "../../stores";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

const CheckOutGuestButton = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const loginTranslation = useTranslations("Login");

  const { product } = useProduct();

  const router = useRouter();

  const handleGuestCheckout = () => {
    setLoading(true);
    if (product.cartCount > 0) {
      router.push("/checkout");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center my-6">
        <hr className="w-10/12 my-3 border-gray-400" />
        <div className="px-4 font-semibold text-gray-700">{loginTranslation("or")}</div>
        <hr className="w-10/12 my-3 border-gray-400" />
      </div>
      <div className="text-center">
        <p data-test-selector="paraNoCreateAccountToOrder">{loginTranslation("accountNotRequired")}</p>
        <div className="flex justify-center mt-6" data-test-selector="divCheckoutGuest">
          <Button
            className="w-full md:w-80"
            type="primary"
            size="small"
            dataTestSelector="btnCheckoutAsGuest"
            loading={isLoading}
            showLoadingText={true}
            loaderColor="currentColor"
            loaderWidth="20px"
            loaderHeight="20px"
            ariaLabel="Checkout As Guest"
            onClick={() => handleGuestCheckout()}
          >
            {loginTranslation("guest")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckOutGuestButton;
