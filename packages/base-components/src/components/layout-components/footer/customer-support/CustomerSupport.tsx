import { useTranslations } from "next-intl";

export default function CustomerSupport({ customerServiceNumber }: { customerServiceNumber: string | undefined }) {
  const t = useTranslations("Layout");

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold uppercase text-footerPrimaryTextColor" data-test-selector="hdgCustomerSupport">
        {t("customerSupport")}
      </h2>
      <div className="mb-3 text-sm footer-text text-footerSecondaryTextColor" data-test-selector="divCustomerSupportLabel">
        {t("customerSupportMessageStart")}
        <br />
        <a href="mailto:youremail@example.com" className="underline text-linkColor hover:text-hoverColor" data-test-selector="linkMailTo">
          {t("email")}
        </a>{" "}
        {t("customerSupportMessageEnd")}
      </div>
      {customerServiceNumber ? (
        <h3 className="mb-2 text-sm footer-text text-footerSecondaryTextColor" aria-label={t("customerServiceNumber")} data-test-selector="hdgCustomerServicePhoneNumber">
          {customerServiceNumber}
        </h3>
      ) : null}
    </div>
  );
}
