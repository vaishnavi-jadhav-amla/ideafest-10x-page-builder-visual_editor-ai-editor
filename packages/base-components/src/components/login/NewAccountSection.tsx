"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Button from "../common/button/Button";
import { Heading } from "../common/heading";
import { useTranslations } from "next-intl";

const NewAccountSection = () => {
  const signUpMessages = useTranslations("SignUp");
  const searchParams = useSearchParams();
  const router = useRouter();

  let returnUrl;
  if (searchParams) {
    returnUrl = searchParams.get("returnUrl");
  }
  const href = returnUrl == null ? "/signup" : "/signup?returnUrl=" + String(returnUrl);
  return (
    <div className="col-span-1 mt-4 sm:mt-0">
      <Heading name={signUpMessages("newAccount")} customClass="text-center uppercase" level="h1" dataTestSelector="hdgNewAccount" showSeparator />
      <div className="mt-0 lg:px-8 sm:mt-8">
        <p className="mb-6 xs:text-center" data-test-selector="paraCreateAccountForEasyShopping">
          {signUpMessages("newAccountText")}
        </p>
        <div className="flex flex-col items-center" data-test-selector="divCreateAccount">
          <Button
            type="primary"
            size="small"
            onClick={() => router.push(href)}
            className="w-full text-sm uppercase transition duration-300 ease-in-out btn btn-primary md:w-80"
            dataTestSelector="btnCreateAnAccount"
            ariaLabel="Create An Account"
          >
            {signUpMessages("createAnAccount")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewAccountSection;
