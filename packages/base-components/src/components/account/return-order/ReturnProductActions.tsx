import React, { useReducer } from "react";
import { createReturnOrder, deleteReturnOrder, updateDetailsReturnOrder } from "../../../http-request/order/order";

import Button from "../../common/button/Button";
import { IReturnOrderAction } from "@znode/types/order";
import { LoaderComponent } from "../../common/loader-component/LoaderComponent";
import { RETURN_ORDER } from "@znode/constants/return-order";
import { encodeId } from "@znode/utils/common";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../stores/user-store";

type ActionType = { type: "DELETE_RETURN" } | { type: "SAVE_AS_DRAFT" } | { type: "SUBMIT_RETURN" } | { type: "RESET" };

interface IStateType {
  isDeleting: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
}

const initialState: IStateType = {
  isDeleting: false,
  isSaving: false,
  isSubmitting: false,
};

const reducer = (state: IStateType, action: ActionType): IStateType => {
  switch (action.type) {
    case "DELETE_RETURN":
      return { isDeleting: true, isSaving: false, isSubmitting: false };
    case "SAVE_AS_DRAFT":
      return { isDeleting: false, isSaving: true, isSubmitting: false };
    case "SUBMIT_RETURN":
      return { isDeleting: false, isSaving: false, isSubmitting: true };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

function ReturnProductActions({
  requestLineItems,
  orderNumber,
  convertedClassNumber,
  isEditable,
  isGuest = false,
  isValidLineItems = false,
  note,
  isValidInputQty = false,
  isValid = false,
  userId ,
}: IReturnOrderAction) {
  const returnOrderTranslations = useTranslationMessages("ReturnOrder");
  const commonTranslations = useTranslationMessages("Common");
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { success, error } = useToast();
  const { user } = useUser();

  const handledDeleteReturn = async () => {
    dispatch({ type: "DELETE_RETURN" });
    const apiResponse = await deleteReturnOrder(convertedClassNumber);
    if (apiResponse) {
      success(returnOrderTranslations("deleteReturnSuccess"));
      router.push("/account/return-order");
    } else {
      error(returnOrderTranslations("deleteReturnError"));
    }
    dispatch({ type: "RESET" });
  };

  const handledSaveAsDraft = async () => {
    dispatch({ type: "SAVE_AS_DRAFT" });
    let apiResponse;
    if (isEditable) {
      apiResponse = await updateDetailsReturnOrder({ returnNumber: convertedClassNumber, returnStateCode: RETURN_ORDER.NOT_SUBMITTED, returnLineItems: requestLineItems, note });
    } else {
      apiResponse = await createReturnOrder({ orderNumber, returnStateCode: RETURN_ORDER.NOT_SUBMITTED, returnLineItems: requestLineItems, note });
    }
    if (apiResponse.isSuccess && apiResponse.classNumber) {
      success(returnOrderTranslations(isEditable ? "draftSaved" : "returnSavedSuccess"));
      isEditable ? router.push("/account/return-order") : router.push(`/account/return-order/edit?orderNumber=${orderNumber}&returnNumber=${apiResponse.classNumber}`);
    } else {
      error(returnOrderTranslations("orderNotEligible"));
    }
    dispatch({ type: "RESET" });
  };

  const handledSubmitReturn = async () => {
    dispatch({ type: "SUBMIT_RETURN" });
    let apiResponse;
    if (isEditable) {
      apiResponse = await updateDetailsReturnOrder({ returnNumber: convertedClassNumber, returnStateCode: RETURN_ORDER.SUBMITTED, returnLineItems: requestLineItems, note });
    } else {
      apiResponse = await createReturnOrder({ orderNumber, returnStateCode: RETURN_ORDER.SUBMITTED, returnLineItems: requestLineItems, note });
    }
    if (apiResponse.isSuccess && apiResponse.classNumber) {
      success(returnOrderTranslations("returnSubmittedSuccess"));
      if ((user?.userId ?? 0) !== 0 && !isGuest) {
        router.push(`/account/return-order/receipt/${apiResponse.classNumber}`);
      } else {
        const encodedId = encodeId(userId as number);
        router.push(`/return/receipt/${apiResponse.classNumber}?userId=${encodedId}`);
      }
    } else {
      error(returnOrderTranslations("orderNotEligible"));
    }
    dispatch({ type: "RESET" });
  };

  return (
    <>
      <div>
        <div className="mt-4 flex justify-end">
          {isEditable && user?.userId !== 0 && RETURN_ORDER.DISPLAY_DRAFT && (
            <Button
              ariaLabel="delete return button"
              className="mr-2"
              type="secondary"
              dataTestSelector="btnDeleteReturn"
              onClick={handledDeleteReturn}
              disabled={!(!isValidLineItems && isValidInputQty) || state.isSaving || state.isSubmitting}
              loaderText={commonTranslations("loading")}
              loading={state.isDeleting}
              showLoadingText={true}
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
            >
              {returnOrderTranslations("deleteReturn")}
            </Button>
          )}

          {(user?.userId ?? 0) !== 0 && RETURN_ORDER.DISPLAY_DRAFT && (
            <Button
              ariaLabel="save draft return button"
              className="mr-2"
              type="secondary"
              dataTestSelector="btnSaveReturn"
              onClick={handledSaveAsDraft}
              disabled={isValid || !(!isValidLineItems && isValidInputQty) || state.isDeleting || state.isSubmitting}
              loaderText={commonTranslations("loading")}
              loading={state.isSaving}
              showLoadingText={true}
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
            >
              {returnOrderTranslations("saveAsDraft")}
            </Button>
          )}

          <Button
            type="primary"
            ariaLabel="submit return button"
            dataTestSelector="btnSubmitReturn"
            onClick={handledSubmitReturn}
            disabled={isValid || !(!isValidLineItems && isValidInputQty) || state.isDeleting || state.isSaving}
            loaderText={commonTranslations("loading")}
            loading={state.isSubmitting}
            showLoadingText={true}
            loaderColor="currentColor"
            loaderWidth="20px"
            loaderHeight="20px"
          >
            {returnOrderTranslations("submitReturn")}
          </Button>
        </div>
      </div>
      {(state.isDeleting || state.isSaving || state.isSubmitting) && (
        <div className="flex justify-center items-center">
          <LoaderComponent isLoading={true} width="50px" height="50px" overlay />
        </div>
      )}
    </>
  );
}

export default ReturnProductActions;
