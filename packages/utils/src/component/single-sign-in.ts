import { SESSION_COOKIE } from "@znode/constants/cookie";
import { deleteCookie } from "./cookies";

export const deleteUserSession = () => {
  deleteCookie(SESSION_COOKIE.CSRF_TOKEN);
  deleteCookie(SESSION_COOKIE.CALLBACK_URL);
  deleteCookie(SESSION_COOKIE.SESSION_TOKEN);
};
