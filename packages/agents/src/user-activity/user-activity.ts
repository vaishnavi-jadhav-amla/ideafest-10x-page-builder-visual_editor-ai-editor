import { AREA, errorStack, logServer } from "@znode/logger/server";
import { calculateSessionDuration, parseBrowser, parseOS } from "@znode/utils/common";
import { USER_ACTIVITY_EVENT, USER_ENTITY_TYPE } from "@znode/constants/user-activity-event";
import { ILoginEvent, ILoginFailedEvent, ILogoutEvent, IOrderPlacedEvent, IPasswordEvents, IUserActivityLog, IUserActivityParams } from "@znode/types/user-activity";
import { convertPascalCase } from "@znode/utils/server";
import { User_activity } from "@znode/clients/custom";

export async function userActivity({
  eventName,
  activityError,
  activityStatus,
  orderId,
  orderTotal,
  loginTimestamp,
  userDetails,
  storeCode,
  localeCode,
  ua,
  referrerURL,
  ip,
  currency,
}: IUserActivityParams): Promise<void> {
  try {
    const timeStamp = new Date().toISOString();
    const browser = parseBrowser(ua);
    const device = parseOS(ua);

    const userEventData: IUserActivityLog = {
      eventName,
      applicationType: USER_ACTIVITY_EVENT.WEBSTORE,
      storeCode,
      eventDateTime: timeStamp,
      userId: userDetails.userId ?? null,
      userName: userDetails.userName ?? null,
      accountId: userDetails.accountId ?? null,
      accountCode: userDetails.accountCode ?? null,
      roleName: userDetails.roleName ?? null,
      ipAddress: ip,
      device,
      browser,
    };

    const getUserName = () => {
      if (userDetails.firstName && userDetails.lastName) {
        return `${userDetails.firstName} ${userDetails.lastName}`;
      }
      return userDetails.userName;
    };

    const getAccountDetails = () => {
      if (userDetails?.accountCode && userDetails?.accountId) {
        return ` associated with Account = ${userDetails.accountCode} | Account ID = ${userDetails.accountId}`;
      } else return "";
    };

    const formatCurrency = (amount: number, currency = "USD", locale = "en-US") => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount);
    };

    switch (eventName) {
      case USER_ACTIVITY_EVENT.LOGIN: {
        const loginData = userEventData as ILoginEvent;
        loginData.entityType = USER_ENTITY_TYPE.USER;
        loginData.activityStatus = activityStatus ?? USER_ACTIVITY_EVENT.COMPLETED;
        loginData.referrerURL = referrerURL;
        loginData.details = `${eventName} successful for ${getUserName()} | User ID = ${userDetails?.userId}${getAccountDetails()}. Referrer URL: ${referrerURL}`;
        break;
      }

      case USER_ACTIVITY_EVENT.LOGOUT: {
        const logoutData = userEventData as ILogoutEvent;
        logoutData.entityType = USER_ENTITY_TYPE.USER;
        logoutData.activityStatus = activityStatus ?? USER_ACTIVITY_EVENT.COMPLETED;
        logoutData.referrerURL = referrerURL;
        logoutData.details = `${eventName} successful for ${getUserName()} | User ID = ${userDetails?.userId}${getAccountDetails()}. Session Duration: ${calculateSessionDuration(
          loginTimestamp,
          timeStamp
        )}. Referrer URL: ${referrerURL}`;
        break;
      }

      case USER_ACTIVITY_EVENT.LOGIN_FAILED: {
        const loginFailedData = userEventData as ILoginFailedEvent;
        loginFailedData.activityError = activityError ?? "";
        loginFailedData.entityType = USER_ENTITY_TYPE.USER;
        loginFailedData.referrerURL = referrerURL;
        loginFailedData.activityStatus = activityStatus ?? USER_ACTIVITY_EVENT.FAILED;
        break;
      }

      case USER_ACTIVITY_EVENT.PASSWORD_RESET:
      case USER_ACTIVITY_EVENT.FORGOT_PASSWORD: {
        const passwordData = userEventData as IPasswordEvents;
        passwordData.activityStatus = activityStatus ?? USER_ACTIVITY_EVENT.REQUESTED;
        passwordData.referrerURL = referrerURL;
        passwordData.entityType = USER_ENTITY_TYPE.USER;
        if (activityError) passwordData.activityError = activityError ?? "";
        break;
      }

      case USER_ACTIVITY_EVENT.ORDER_PLACED: {
        const orderPlacedData = userEventData as IOrderPlacedEvent;
        orderPlacedData.entityType = USER_ENTITY_TYPE.ORDER;
        orderPlacedData.entityId = orderId;
        orderPlacedData.activityStatus = activityStatus ?? USER_ACTIVITY_EVENT.COMPLETED;
        orderPlacedData.referrerURL = referrerURL;
        orderPlacedData.details = `Order Placed successfully for ${getUserName()} | User ID = ${
          userDetails?.userId
        }${getAccountDetails()}. Order ID: ${orderId}. Order Total: ${formatCurrency(orderTotal ?? 0, currency, localeCode)}. Referrer URL: ${referrerURL}`;
        break;
      }
      default:
        break;
    }

    const userEventBody = [convertPascalCase(userEventData)];
    await User_activity(userEventBody);
  } catch (error) {
    logServer.error(AREA.USER_ACTIVITY, errorStack(error));
    throw error;
  }
}
