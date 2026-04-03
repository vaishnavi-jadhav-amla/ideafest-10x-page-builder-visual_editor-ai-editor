import { FALLBACK } from "@znode/constants/i18n";
import deepmerge from "deepmerge";
export async function getLocaleMessages(locale: string, lng = FALLBACK.code) {
  try {
    const userMessages = (await import(`../messages/${locale}.json`)).default;
    const defaultMessages = (await import(`../messages/${lng}.json`)).default;
    const messages = deepmerge(defaultMessages, userMessages);
    if (!messages) {
      return (await import(`../messages/${lng}.json`)).default;
    }
    return messages;
  } catch (error) {
    return (await import(`../messages/${lng}.json`)).default;
  }
}
