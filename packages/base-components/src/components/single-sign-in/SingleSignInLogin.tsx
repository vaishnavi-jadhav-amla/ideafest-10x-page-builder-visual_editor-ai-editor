"use client";

import { useEffect, useState } from "react";

import { ValidationMessage } from "../common/validation-message";
import { deleteUserSession } from "@znode/utils/component";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

interface IUserSignIn {
  token: string;
  isUserLoggedIn: boolean;
  portalId: number;
  redirectUrl: string;
}

export const SingleSignInLogin = ({ token, isUserLoggedIn, portalId, redirectUrl }: IUserSignIn) => {
  const loginMessages = useTranslations("SingleSignIn");
  const [loginError, setLoginError] = useState<string>("");

  const createUserSession = async (domainName: string) => {
    const userData = await signIn("credentials", {
      redirect: false,
      portalId: portalId,
      singleSignIn: token,
      domainName: domainName,
    });

    if (userData && userData.error && userData.status === 401) {
      setLoginError(loginMessages("loginError"));
    } else if (userData) {
      if (redirectUrl) {
        const redirectPath = redirectUrl.startsWith("/") ? redirectUrl : `/${redirectUrl}`;
        window.location.href = `${domainName}${redirectPath}`;
      } else {
        window.location.href = "/";
      }
    }
  };

  const loginAsAdmin = async (domainName: string) => {
    try {
      if (!isUserLoggedIn) {
        createUserSession(domainName);
      } else {
        deleteUserSession();
        createUserSession(domainName);
      }
    } catch (error) {
      setLoginError(loginMessages("loginError"));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      loginAsAdmin(window.location.origin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {!loginError ? (
        <div className="flex justify-center items-center">{loginMessages("loading")}</div>
      ) : (
        <ValidationMessage message={loginError} dataTestSelector="loginError" customClass="mt-4 text-center text-errorColor" />
      )}
    </div>
  );
};
