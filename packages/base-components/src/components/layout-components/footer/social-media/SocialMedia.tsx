import { LinkWidget } from "../../../znode-widget/link";
import { useTranslations } from "next-intl";

export default function SocialMedia({ cmsMappingId }: { cmsMappingId: number }) {
  const t = useTranslations("Layout");

  return (
    <>
      <div className="mb-4 text-lg font-medium uppercase lg:text-xl " data-test-selector="divFollowMaxwellsLifestyle">
        {t("followMaxwellsLifestyle")}
      </div>
      {cmsMappingId && (
        <LinkWidget
          widgetKey="222"
          widgetCode="LinkPanel"
          typeOfMapping="PortalMapping"
          displayName="MENU WIDGET"
          cmsMappingId={cmsMappingId}
          contentOrientation="horizontal"
          customClass="break-words text-left text-footerSecondaryTextColor"
        ></LinkWidget>
      )}
    </>
  );
}
