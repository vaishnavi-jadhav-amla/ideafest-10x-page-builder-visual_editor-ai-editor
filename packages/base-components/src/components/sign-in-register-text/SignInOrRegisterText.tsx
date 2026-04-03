import Link from "next/link";
import { useTranslationMessages } from "@znode/utils/component";

const SignInOrRegisterText = ({ isReadyCheckoutTextShow = true }) => {
  const cartTranslations = useTranslationMessages("Common");
  return (
    <div {...(isReadyCheckoutTextShow && { className: "pr-10 mr-10" })}>
      {isReadyCheckoutTextShow && <p className="font-medium text-xl">Ready for checkout?</p>}
      <p className="text-xs flex gap-1 items-center">
        <Link href="/login" prefetch={false}>
          <p className="text-linkColor underline flex gap-1 items-center whitespace-nowrap">{cartTranslations("signIn")}</p>
        </Link>{" "}
        {cartTranslations("or")}{" "}
        <Link href="/signup" prefetch={false}>
          <p className="text-linkColor underline flex gap-1 items-center">{cartTranslations("register")}</p>
        </Link>{" "}
        {isReadyCheckoutTextShow && "to view prices and place orders."}
      </p>
    </div>
  );
};

export default SignInOrRegisterText;
