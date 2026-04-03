import { IDynamicFormFieldProps } from "@znode/types/form-builder/common";
import { AttributeTypeDate } from "./AttributeTypeDate";
import { AttributeTypeFile } from "./AttributeTypeFile";
import { AttributeTypeImage } from "./AttributeTypeImage";
import { AttributeTypeLabel } from "./AttributeTypeLabel";
import { AttributeTypeMultiSelect } from "./AttributeTypeMultiSelect";
import { AttributeTypeNumber } from "./AttributeTypeNumber";
import { AttributeTypeSimpleSelect } from "./AttributeTypeSimpleSelect";
import { AttributeTypeText } from "./AttributeTypeText";
import { AttributeTypeTextArea } from "./AttributeTypeTextArea";
import { AttributeTypeYesNo } from "./AttributeTypeYesNo";

export const attributeTypeMap = new Map<
  string,
  React.ComponentType<Pick<IDynamicFormFieldProps, "attribute" | "formik" | "attributeValidations" | "generalSettings" | "RichTextEditorElement">>
>([
  ["Date", AttributeTypeDate],
  ["File", AttributeTypeFile],
  ["Image", AttributeTypeImage],
  ["Label", AttributeTypeLabel],
  ["Multi Select", AttributeTypeMultiSelect],
  ["Number", AttributeTypeNumber],
  ["Simple Select", AttributeTypeSimpleSelect],
  ["Text", AttributeTypeText],
  ["Text Area", AttributeTypeTextArea],
  ["Yes/No", AttributeTypeYesNo],
]);
