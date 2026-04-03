import { Heading } from "../../common/heading/Heading";
import { useTranslationMessages } from "@znode/utils/component";

export function OrderTemplateHead() {
  const orderTemplatesTranslations = useTranslationMessages("OrderTemplates");

  return (
    <div>
      <Heading name={orderTemplatesTranslations("orderTemplates")} level="h1" customClass="uppercase" dataTestSelector="hdgOrderTemplates" showSeparator />
      <p className="mb-5" data-test-selector="paraOrderTemplateText">
        {orderTemplatesTranslations("orderTemplateText")}
      </p>
    </div>
  );
}
export default OrderTemplateHead;
