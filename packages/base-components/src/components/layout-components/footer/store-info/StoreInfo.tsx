import { LinkWidget } from "../../../znode-widget/link";
import { useTranslations } from "next-intl";

export default function StoreInfo({ cmsMappingId }: { cmsMappingId: number }) {
  const t = useTranslations("Layout");

  return (
    <div className="mr-4" data-test-selector="divStoreInfo">
      <h2 className="mb-4 text-lg font-medium uppercase" data-test-selector="hdgStoreInfo">
        {t("storeInfo")}
      </h2>
      {cmsMappingId && (
        <LinkWidget
          widgetKey="2253"
          widgetCode="LinkPanel"
          typeOfMapping="PortalMapping"
          displayName="MENU WIDGET"
          cmsMappingId={cmsMappingId}
          contentOrientation="vertical"
          customClass="mb-2 text-footerSecondaryTextColor"
          isFont={true}
        ></LinkWidget>
      )}
    </div>
  );
}
