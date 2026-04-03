import { TYPE_AHEAD } from "@znode/constants/type-ahead";
import { convertCamelCase } from "@znode/utils/server";
import { ITypeAheadList, ITypeAheadRequest, ITypeAhead } from "@znode/types/type-ahead";
import { TypeAheadEnum, TypeAheadTypeNameEnum } from "@znode/types/enums";
import { Typeahead_getTypeAheadResponse, TypeaheadRequestModel } from "@znode/clients/v1";
import { logServer, AREA, errorStack } from "@znode/logger/server";

export async function getAutocompleteList(searchTerm: string, searchType: string, pageSize: number, portalId: number): Promise<ITypeAheadList> {
  try {
    const typeAheadDetails = await getTypeaheadRequestModel(searchTerm, searchType, pageSize, portalId);
    const typeAheadList = await Typeahead_getTypeAheadResponse(typeAheadDetails as TypeaheadRequestModel);
    const typeAheadResponse = convertCamelCase(typeAheadList);
    const orderListData = typeAheadResponse.typeAheadList.map((list: ITypeAhead) => list.name);
    return orderListData;
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return {} as ITypeAheadList;
  }
}

//To bind the Typeahead RequestModel
export async function getTypeaheadRequestModel(searchTerm: string, searchType: string, pageSize: number, portalId: number): Promise<ITypeAheadRequest> {
  const typeaheadRequest: ITypeAheadRequest = { searchTerm: "" };

  typeaheadRequest.searchTerm = searchTerm;

  if (searchType === TYPE_AHEAD.ELIGIBLE_RETURN_ORDER_NUMBER_LIST) {
    typeaheadRequest.type = TypeAheadEnum.EligibleReturnOrderNumberList;
    typeaheadRequest.typeName = TypeAheadTypeNameEnum.ReturnOrders.toString();
    typeaheadRequest.mappingId = portalId;
    typeaheadRequest.pageSize = pageSize;
  }
  return typeaheadRequest;
}
