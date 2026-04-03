/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGeneralSetting } from "../general-setting";

export interface IFormResponse {
  formBuilderId?: number | undefined;
  formCode: string;
  formTitle: string;
  buttonText: string;
  textMessage: string;
  redirectURL: string;
  isTextMessage: boolean;
  isShowCaptcha: boolean;
  groups: IFormGroup[];
  attributes: IFormAttribute[];
  localeId: number;
  generalSettings: IGeneralSetting | undefined;
}

export interface IFormGroup {
  globalAttributeGroupId?: number;
  groupCode?: string | undefined;
  attributeGroupName?: string | undefined;
  displayOrder?: number | undefined;
}

export interface IFormAttribute {
  globalAttributeId?: number;
  globalAttributeGroupId?: number | null;
  attributeTypeName: string;
  attributeDefaultValue?: string;
  attributeDefaultValueCode?: string;
  attributeCode: string;
  isRequired: boolean;
  isLocalizable: boolean;
  attributeName: string;
  isEditable: boolean;
  mediaId: any;
  helpDescription: any;
  validations: any;
  validationList: ValidationList[];
  displayOrder: number | undefined;
}

export interface ValidationList {
  controlName: string;
  validationName: string;
  subValidationName: any;
  regExp: any;
  validationValue?: string | null;
  isRegExp: boolean;
}
