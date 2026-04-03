import { IBase } from "./base";

export interface IBaseAttribute extends IBase {
  attributeCode?: string;
  attributeName?: string;
  attributeValues?: string;
  attributeTypeName?: string;
  isCustomField?: boolean;
  pimAttributeId?: number;
  isPersonalizable?: boolean;
  selectValues?: ISelectValue[];
  isConfigurable?: boolean;
  displayOrder?: number;
  isSwatch?: string;
  configurableAttribute?: IProductAttributes[];
  selectedAttributeValue?: string[];
}

export interface IAttributeDetails extends IBase, IBaseAttribute {
  isRequired?: boolean;
  pimAttributeId?: number;
  controlProperty?: IProperty;
  attributeDefaultValue?: string;
  attributeValue?: string;
  validationName?: string;
  controlName?: string;
  subValidationName?: string;
  validationValue?: string;
  attributeDefaultValueCode?: string;
  validation?: { [attributeCode: string]: { [validationName: string]: string } };
}

export interface ISelectValue extends IBase {
  value: string;
  code: string;
  swatchText: string;
  path: string;
  displayOrder?: number;
  variantDisplayOrder?: number;
  variantImagePath?: string;
  variantSKU?: string;
  actionMode?: string;
}

export interface IProperty {
  name?: string;
  id?: string;
  cssClass?: string;
  controlType?: string;
  value?: string;
  values?: string[];
  controlLabel?: string;
  isDetailView?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  htmlAttributes?: Record<string, any>;
  selectOptions?: ISelectListItem[];
  helpText?: string;
}

export interface ISelectListItem {
  text?: string;
  value?: string;
}

export interface IConfigurableAttribute extends IBase {
  configurableAttributes?: IProductAttributes[];
}

export interface IProductAttributes {
  attributeValue?: string;
  attributeName?: string;
  attributeCode?: string;
  imagePath?: string;
  isDisabled?: boolean;
  swatchText?: string;
  selectValues?: ISelectValuesDetails[];
  displayOrder?: number;
}

export interface ISelectValuesDetails {
  displayOrder?: number;
  code: string;
  swatchText: string;
  value: string;
  path: string;
}

export interface IGlobalAttributeGroupModel {
  groupCode: string;
  attributes?: IGlobalAttributeModel[];
}

export interface IGlobalAttributeModel {
  attributeName?: string;
  attributeTypeName?: string;
  attributeCode: string;
  attributeValue: string;
  globalAttributeId?: number;
}

export interface ITabData {
  id: string;
  title: string;
  content: string;
  isCustomField: boolean;
}
