import { useTranslations } from "next-intl";

export default function Copyright() {
  const t = useTranslations("Layout");

  return (
    <div className="copyright-section" data-test-selector="divCopyRightTextContainer">
      <div className="px-10 py-4 mx-4 font-normal text-center md:text-left md:px-0">
        <span data-test-selector="spnCopyRightText">{t("copyrightAllReserved")}</span>
      </div>
    </div>
  );
}
