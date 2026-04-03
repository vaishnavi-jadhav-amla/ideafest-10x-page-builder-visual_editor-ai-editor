import { IQuoteModel } from "@znode/types/quote";
import { QUOTE_STATUS } from "@znode/constants/quote";

//Check if the Quote is Valid For Convert To an Order
export function isQuoteValidForConvertToOrder(quoteModel: IQuoteModel): boolean {
  const expirationDate = quoteModel?.expirationDate ? new Date(quoteModel.expirationDate) : null;
  const today = new Date();

  const validStatuses = [QUOTE_STATUS.QUOTE_STATUS_IN_REVIEW];

  const isValidStatus = validStatuses.includes(quoteModel?.statusCode || "");
  const isExpiredToday = expirationDate && expirationDate.toDateString() === today.toDateString();

  return !(isExpiredToday || !isValidStatus);
}
