import { useTranslationMessages } from "@znode/utils/component";
export function NotFound({ viewCustom404 = false }) {
  const common = useTranslationMessages("Common");
  return (
    <div className="content-center text-center">
      <h2 className="text-2xl">{viewCustom404 ? common("pageNotFound") : common("widgetNotFound")}</h2>
    </div>
  );
}
