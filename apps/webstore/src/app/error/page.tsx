import { PortalDataNotFound } from "@znode/base-components/error/PortalDataNotFound";
import { StoreNotPublished } from "@znode/base-components/error/StoreNotPublished";
import { ThemeNotFound } from "@znode/base-components/error/ThemeNotFound";
import { DomainDetailApiNotWorking } from "@znode/base-components/error/DomainDetailApiNotWorking";

import { ErrorCodes } from "@znode/types/enums";
import { headers } from "next/headers";

const ErrorPage = () => {
  const errorCode = Number(headers().get("x-error-code"));
  const devErrorMessage = headers().get("dev-error-code");
  if (errorCode == Number(ErrorCodes.StoreDataNotFound)) {
    return <PortalDataNotFound />;
  } else if (errorCode == Number(ErrorCodes.StoreNotPublished)) {
    return <StoreNotPublished />;
  } else if (errorCode == Number(ErrorCodes.ThemeNotFound)) {
    return <ThemeNotFound />;
  } else if (errorCode == Number(ErrorCodes.DomainNotFound)) {
    return <DomainDetailApiNotWorking />;
  } else if (errorCode == Number(ErrorCodes.DomainInActive)) {
    return <DomainDetailApiNotWorking />;
  } else {
    return (
      <>
        {devErrorMessage ? (
          <div className="font-sans flex flex-col items-center justify-center h-[10vh]">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold pl-2.5">{devErrorMessage}</h1>
            </div>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  }
};

export default ErrorPage;
