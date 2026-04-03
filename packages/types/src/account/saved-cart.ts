import { Dispatch, SetStateAction } from "react";
import { IPaginationDetail, ITemplateCartItems } from "./order-templates";
import { IQuoteSearchByKey, IQuoteSort } from "./quote";

export interface ISavedCartList {
  paginationDetail: IPaginationDetail;
  collectionDetails: ISavedCartCollectionDetails[] | undefined;
}

export interface ISavedCartCollectionDetails {
  quantity: number;
  createdDate: string;
  modifiedDate: string;
  className: string;
  classNumber: string;
  cultureCode?: string;
}

export interface ISavedCartTemplate {
  itemList: ITemplateCartItems[] | undefined;
  className: string | undefined;
  classNumber: string | undefined;
  isSuccess?: string | undefined;
}

export interface ISavedCartListModel {
  classType: string;
  pageSize: number;
  pageIndex: number;
  sortValue: IQuoteSort;
  currentFilters: IQuoteSearchByKey[];
}

export interface ISavedCart {
  templateName?: string;
  items?: number;
  templateType?: string;
  templateCartItems?: ITemplateCartItems[];
  omsTemplateLineItemId?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedBy?: number;
  isEditTemplate?: boolean;
  cultureCode?: string;
  currencyCode?: string;
  classNumber: string;
  itemList?: ITemplateCartItems[] | undefined;
  className: string;
  quantity?: number;
}

export interface ISavedCartItems {
  cartNumber: string | number;
  className: string;
  classType: string;
}

export interface IEditSavedCartRowData {
  templateData: ISavedCartTemplate;
  getTemplateDetails?: () => void;
  className?:string;

}

export interface SavedCartConfirmDeleteProps {
  classNumber?: string;
  templateId?: string[];
  updatedSaveCartList?: () => void;
  getTemplateListDetails?: () => void;
  setSelectedRowKeys?: Dispatch<SetStateAction<string[]>>;
  setIsSelectAllChecked?: Dispatch<SetStateAction<boolean>>;
}
