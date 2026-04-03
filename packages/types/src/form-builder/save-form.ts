/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFormResponse } from "./get-form";

export interface ISaveFormRequest {
  formBuilderId: number;
  formCode: string;
  customerEmail?: string;
  isSuccess?: boolean;
  attributes: IFormResponse["attributes"];
  values: Record<string, any>;
  formTitle?: string;
  widgetKey: string;
}

export interface IFormSubmitAttributes {
  /** The global attribute identifier. */
  globalAttributeId: number;
  /** The global attribute value identifier. This value is nullable. */
  globalAttributeValueId?: number;
  /** The global attribute default value identifier. This value is nullable. */
  globalAttributeDefaultValueId?: number;
  /** The attribute code. */
  attributeCode?: string;
  /** The attribute value. */
  attributeValue?: string;
  /** The locale identifier. */
  localeId: number;
  /** The attribute name. */
  attributeName?: string;
  attributeType?: string;
}

export interface ISaveFormResponse {
  formBuilderId?: number;
}

export interface IFormSubmitModel {
  /** The form builder identifier. */
  formBuilderId?: number;
  /** The locale identifier. */
  localeId?: number;
  /** The portal identifier. */
  portalId?: number;
  /** The list of attributes associated with the form submission response. */
  attributes?: IFormSubmitAttribute[];
}

export interface IFormSubmitAttribute {
  /** The global attribute identifier. */
  globalAttributeId?: number;
  /** The global attribute value identifier. This value is nullable. */
  globalAttributeValueId?: number;
  /** The global attribute default value identifier. This value is nullable. */
  globalAttributeDefaultValueId?: number;
  /** The attribute code. */
  attributeCode?: string;
  /** The attribute value. */
  attributeValue?: string;
  /** The locale identifier. */
  localeId?: number;
  /** The attribute name. */
  attributeName?: string;
}
