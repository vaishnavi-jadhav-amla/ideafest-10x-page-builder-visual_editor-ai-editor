import Button from "../../common/button/Button";
import Heading from "../heading/Heading";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function AlreadyHaveAccount({ isCheckoutAsGuest, headingClass, linkClass }: { isCheckoutAsGuest: boolean; headingClass?: string; linkClass?: string }) {
  const registerMessages = useTranslations("Register");
  const router = useRouter();

  return (
    <div>
      {!isCheckoutAsGuest && (
        <div className={`col-span-1 ${linkClass?.includes("mt-4") ? "mt-4" : "md:mt-0"}`}>
          <Heading
            name={registerMessages("alreadyHaveAnAccount")}
            customClass={`uppercase text-center ${headingClass}`}
            level="h1"
            showSeparator
            dataTestSelector="hdgAlreadyHaveAccount"
          />
          <div className="text-center lg:px-8 mt-8">
            <Button
              type="primary"
              size="small"
              onClick={() => router.push("/login")}
              className={`px-5 text-sm tracking-wider uppercase btn btn-primary ${linkClass}`}
              dataTestSelector="btnLoginNow"
              ariaLabel="Login Now"
            >
              {registerMessages("loginNow")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
