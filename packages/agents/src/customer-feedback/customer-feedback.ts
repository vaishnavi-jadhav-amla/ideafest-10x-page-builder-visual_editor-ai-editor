import { IContactUsRequest, IFeedbackRequest } from "@znode/types/customer-feedback";
import { errorStack, logServer } from "@znode/logger/server";

import { CUSTOMER_FEEDBACK } from "@znode/constants/customer-feedback";
// import { WebStoreCaseRequest_createContactUs } from "@znode/clients/v1";
import { WebStoreCaseRequests_contactUs } from "@znode/clients/v2";
import { convertPascalCase } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";

export async function submitCustomerFeedback(feedbackModel: IFeedbackRequest, storeCode: string) {
  const currentUser = await getSavedUserSession();
  const userId = currentUser?.userId ?? undefined;

  const newFeedbackModel = {
    storeCode,
    description: feedbackModel.allowSharingWithCustomers
      ? formatMessage(CUSTOMER_FEEDBACK.MESSAGE_CUSTOMER_FEEDBACK_TRUE, [feedbackModel.comments, feedbackModel.city, feedbackModel.state])
      : formatMessage(CUSTOMER_FEEDBACK.MESSAGE_CUSTOMER_FEEDBACK_FALSE, [feedbackModel.comments, feedbackModel.city, feedbackModel.state]),
    caseStatusId: CUSTOMER_FEEDBACK.CASE_STATUS_ID,
    casePriorityId: CUSTOMER_FEEDBACK.CASE_PRIORITY_ID,
    caseTypeId: CUSTOMER_FEEDBACK.CASE_TYPE_ID,
    caseOrigin: CUSTOMER_FEEDBACK.CASE_ORIGIN_CUSTOMER_FEEDBACK,
    title: CUSTOMER_FEEDBACK.CASE_REQUEST_CUSTOMER_FEEDBACK_TITLE,
    ownerUserId: userId,
    userName: feedbackModel.emailId,
    firstName: feedbackModel.firstName,
    lastName: feedbackModel.lastName,
    emailId: feedbackModel.emailId,
    phoneNumber: "",
    companyName: "",
    comments: feedbackModel.comments,
    custom1: "",
    custom2: "",
    custom3: "",
    custom4: "",
    custom5: "",
  };

  // Remove ownerUserId if undefined, null, or blank (for guests)
  if (userId === undefined || userId === null) {
    delete newFeedbackModel.ownerUserId;
  }

  const feedbackData = await WebStoreCaseRequests_contactUs(convertPascalCase(newFeedbackModel));
  // return contactUsData.CaseRequest;
  if (!feedbackData.HasError) {
    return {
      success: true,
    };
  }
  return {
    success: false,
  };
}

export async function submitContactUs(requestModel: IContactUsRequest, storeCode: string) {
  const currentUser = await getSavedUserSession();
  const ownerUserId = currentUser?.userId || null;
  try {
    const contactUsModel = {
      storeCode,
      userName: requestModel.emailId,
      firstName: requestModel.firstName,
      lastName: requestModel.lastName,
      companyName: requestModel.companyName,
      emailId: requestModel.emailId,
      phoneNumber: requestModel.phoneNumber,
      description: requestModel.comments,
      caseStatusId: CUSTOMER_FEEDBACK.CASE_STATUS_ID,
      casePriorityId: CUSTOMER_FEEDBACK.CASE_PRIORITY_ID,
      caseTypeId: CUSTOMER_FEEDBACK.CASE_TYPE_ID,
      CaseOrigin: CUSTOMER_FEEDBACK.CASE_ORIGIN_CONTACT_US,
      title: CUSTOMER_FEEDBACK.CASE_REQUEST_CONTACT_US_TITLE,
      ownerUserId: ownerUserId,
      custom1: "",
      custom2: "",
      custom3: "",
      custom4: "",
      custom5: "",
    };
    const createResponse = await WebStoreCaseRequests_contactUs(convertPascalCase(contactUsModel));

    if (!createResponse.HasError) {
      return { success: true };
    }

    return {
      hasError: true,
      errorCode: createResponse.ErrorCode,
      errorMessage: createResponse.ErrorMessage,
    };
  } catch (error) {
    logServer.error("Error in submitContactUs", errorStack(error));
    throw error;
  }
}

function formatMessage(template: string, values: string[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => values[index] || match);
}
