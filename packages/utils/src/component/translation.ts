/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslations } from "next-intl";

export function useTranslationMessages(name: string) {
  return useTranslations(name);
}
