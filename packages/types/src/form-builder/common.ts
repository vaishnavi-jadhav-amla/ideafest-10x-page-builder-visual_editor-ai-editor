/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormikProps } from "formik";
import { IFormAttribute } from "./get-form";
import { IGeneralSetting } from "../general-setting";

export interface IDynamicFormFieldProps {
  attributeTypeName: string;
  attribute: IFormAttribute & {
    options?: Array<{
      code: string;
      label: string;
      value: string;
      displayOrder: number | undefined;
    }>;
  };
  formik: FormikProps<any>;
  attributeValidations: Record<string, any>;
  generalSettings: IGeneralSetting | undefined;
  RichTextEditorElement: React.ComponentType<{
    editorText: string;
    onEditorTextChange: (_value: string) => void;
    onEditorBlur?: (_value: string) => void;
  }> | undefined;
}

export type IAttributeTypeMap = Pick<IDynamicFormFieldProps, "attribute" | "attributeValidations" | "formik" | "generalSettings" | "RichTextEditorElement">;

export type IAttributeTypeProps = IAttributeTypeMap;
