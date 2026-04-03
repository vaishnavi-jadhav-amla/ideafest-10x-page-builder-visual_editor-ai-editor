import Button from "../../common/button/Button";
import { DynamicFormField } from "./form-field/DynamicFormField";
import { FormikHelpers, useFormik } from "formik";
import { useMemo } from "react";
import { saveFormAPI } from "../../../http-request";
import { IFormResponse, IFormAttribute } from "@znode/types/form-builder/get-form";
import { useToast } from "../../../stores";
import { useRouter } from "next/navigation";
import { generateFormConfig } from "./generate-form/generate-form-config";
import Heading from "../../common/heading/Heading";
import { ATTRIBUTE_TYPE_NAME } from "@znode/constants/form-builder";

interface IFormWidgetProps {
  response: IFormResponse;
  widgetKey: string;
  RichTextEditor: Parameters<typeof DynamicFormField>[0]["RichTextEditorElement"] | undefined;
}

export function FormWidget(props: IFormWidgetProps) {
  const { response, widgetKey, RichTextEditor } = props;

  const { error, success } = useToast();
  const router = useRouter();

  const formTemplateResponse = response;

  const { initialValues, validationSchema, attributeValidations, normalizeAttributes } = useMemo(() => generateFormConfig({ ...formTemplateResponse }), [formTemplateResponse]);

  const renderAttributeList = useMemo(() => generateRenderAttributes(normalizeAttributes, formTemplateResponse.groups), [formTemplateResponse, normalizeAttributes]);

  const buttonText = formTemplateResponse?.buttonText ? formTemplateResponse?.buttonText : "Submit";

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values: Record<string, unknown>, formikHelpers: FormikHelpers<Record<string, unknown>>) {
    // Remove White Spaces from Text and Text Area
    for (const [key, value] of Object.entries(values)) {
      const getAttribute = formTemplateResponse.attributes.find((i) => i.attributeCode === key);

      if (getAttribute) {
        const hasTextOrTextArea = getAttribute?.attributeTypeName === ATTRIBUTE_TYPE_NAME.TEXT || getAttribute?.attributeTypeName === ATTRIBUTE_TYPE_NAME.TEXT_AREA;

        if (hasTextOrTextArea) {
          values[key] = (value as string).trim();
        }
      }
    }

    const saveFormResponse = await saveFormAPI({
      formBuilderId: Number(formTemplateResponse.formBuilderId),
      customerEmail: "",
      formCode: formTemplateResponse.formCode,
      attributes: formTemplateResponse.attributes,
      values: values,
      isSuccess: false,
      formTitle: formTemplateResponse.formTitle,
      widgetKey: widgetKey,
    });

    if (saveFormResponse.formBuilderId) {
      // Reset Form
      formikHelpers.resetForm();

      // Success Text Message
      if (formTemplateResponse.isTextMessage && formTemplateResponse.textMessage) {
        success(formTemplateResponse.textMessage);
      }

      // Redirect URL
      const hasRedirect = !formTemplateResponse.isTextMessage;
      if (hasRedirect) {
        router.push(formTemplateResponse?.redirectURL || "");
      }
    } else if (
      saveFormResponse &&
      typeof saveFormResponse === "object" &&
      "errorMessage" in saveFormResponse &&
      typeof saveFormResponse.errorMessage === "string" &&
      saveFormResponse.errorMessage
    ) {
      error(saveFormResponse.errorMessage);
    } else {
      error("Please check your form fields!...");
    }
  }

  return (
    <div data-test-selector={`divForm${formTemplateResponse?.formBuilderId}${widgetKey}`}>
      <form method="post" onSubmit={formik.handleSubmit} id={formTemplateResponse?.formCode} className="flex flex-col mb-4">
        <Heading name={formTemplateResponse.formTitle} dataTestSelector={`hdg${formTemplateResponse.formTitle}`} level="h1" customClass="uppercase" showSeparator />

        <div className="flex flex-col gap-4 mb-4 mt-2">
          {renderAttributeList.map((item) => {
            if (item.type === "group-attribute") {
              const attributes = item.attributes || [];
              return (
                <div key={item.groupId} className="bg-slate-100 p-2 mb-4">
                  <p className=" uppercase font-semibold w-full flex justify-start border-b-1 border-gray-400 pt-2 mb-2">{item.attributeGroupName}</p>
                  <hr className="mb-2" />
                  <div className="p-4 flex flex-col gap-4">
                    {attributes.map((attribute) => {
                      return (
                        <DynamicFormField
                          key={attribute.attributeCode}
                          attributeTypeName={attribute.attributeTypeName}
                          attribute={attribute}
                          formik={formik}
                          attributeValidations={attributeValidations[attribute.attributeCode]}
                          generalSettings={response.generalSettings}
                          RichTextEditorElement={RichTextEditor}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            }

            const attribute = item.attribute;

            if (!attribute) return null;

            return (
              <DynamicFormField
                key={attribute.attributeCode}
                attributeTypeName={attribute.attributeTypeName}
                attribute={attribute}
                formik={formik}
                attributeValidations={attributeValidations[attribute.attributeCode]}
                generalSettings={response.generalSettings}
                RichTextEditorElement={RichTextEditor}
              />
            );
          })}
        </div>

        <Button
          htmlType="submit"
          className="w-full sm:w-auto sm:max-w-xs sm:self-start"
          type="primary"
          size="small"
          dataTestSelector={`btn${buttonText}`}
          showLoadingText={true}
          loading={formik.isSubmitting}
          loaderColor="currentColor"
          loaderWidth="20px"
          loaderHeight="20px"
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
}

function generateRenderAttributes(attributes: Array<IFormAttribute>, groups: IFormResponse["groups"]) {
  const result: Array<{
    attributes: Array<IFormAttribute> | null;
    attribute: IFormAttribute | null;
    displayOrder: number | undefined;
    type: "attribute" | "group-attribute";
    groupId: number | null;
    attributeGroupName?: string | null;
  }> = [];

  for (const attr of attributes) {
    const groupId = attr?.globalAttributeGroupId;

    if (groupId) {
      const hasExist = result.find((i) => i.type === "group-attribute" && Number(i.groupId) === Number(groupId));

      if (hasExist) {
        hasExist.attributes?.push(attr);
      } else {
        const globalGroup = groups.find((i) => i.globalAttributeGroupId === groupId);

        result.push({
          type: "group-attribute",
          groupId: groupId,
          attributes: [attr],
          displayOrder: globalGroup?.displayOrder || undefined,
          attribute: null,
          attributeGroupName: globalGroup?.attributeGroupName || null,
        });
      }
    } else {
      result.push({
        type: "attribute",
        groupId: null,
        attributes: [],
        displayOrder: attr.displayOrder,
        attribute: attr,
      });
    }
  }

  return result;
}
