import { ATTRIBUTE } from "@znode/constants/attribute";
import { IPortalDetail } from "@znode/types/portal";
import { SETTINGS } from "@znode/constants/settings";

/**
 * Generic function to check if a specific feature is enabled based on portal global attributes
 * @param portalData - The portal data containing global attributes
 * @param attributeCode - The attribute code to check (e.g., SETTINGS.ENABLE_PREVIOUS_PURCHASES)
 * @returns boolean - True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(portalData: IPortalDetail | null | undefined, attributeCode: string): boolean {
  if (!portalData?.globalAttributes) {
    return false;
  }

  const attribute = portalData.globalAttributes.find((attr) => attr.attributeCode === attributeCode);

  return attribute?.attributeValue === ATTRIBUTE.TRUE_VALUE;
}

/**
 * Generic function to check if a specific feature is enabled based on user settings global attributes
 * @param attributesMap - The mapped global attributes from user settings
 * @param attributeCode - The attribute code to check (e.g., SETTINGS.ENABLE_PREVIOUS_PURCHASES)
 * @returns boolean - True if the feature is enabled, false otherwise
 */
export function isFeatureEnabledFromUserSettings(attributesMap: Record<string, string | boolean | number>, attributeCode: string): boolean {
  return attributesMap[attributeCode] === ATTRIBUTE.TRUE_VALUE;
}

/**
 * Specific function to check if previous purchases are enabled
 * @param portalData - The portal data containing global attributes
 * @returns boolean - True if previous purchases are enabled, false otherwise
 */
export function isPreviousPurchasesEnabled(portalData: IPortalDetail | null | undefined): boolean {
  return isFeatureEnabled(portalData, SETTINGS.ENABLE_PREVIOUS_PURCHASES);
}

/**
 * Specific function to check if previous purchases are enabled from user settings
 * @param attributesMap - The mapped global attributes from user settings
 * @returns boolean - True if previous purchases are enabled, false otherwise
 */
export function isPreviousPurchasesEnabledFromUserSettings(attributesMap: Record<string, string | boolean | number>): boolean {
  return isFeatureEnabledFromUserSettings(attributesMap, SETTINGS.ENABLE_PREVIOUS_PURCHASES);
}

/**
 * Specific function to check if quote request is enabled
 * @param portalData - The portal data containing global attributes
 * @returns boolean - True if quote request is enabled, false otherwise
 */
export function isQuoteRequestEnabled(portalData: IPortalDetail | null | undefined): boolean {
  return isFeatureEnabled(portalData, SETTINGS.ENABLE_QUOTE_REQUEST);
}

/**
 * Specific function to check if quote request is enabled from user settings
 * @param attributesMap - The mapped global attributes from user settings
 * @returns boolean - True if quote request is enabled, false otherwise
 */
export function isQuoteRequestEnabledFromUserSettings(attributesMap: Record<string, string | boolean | number>): boolean {
  return isFeatureEnabledFromUserSettings(attributesMap, SETTINGS.ENABLE_QUOTE_REQUEST);
}

/**
 * Specific function to check if return order request is enabled
 * @param portalData - The portal data containing global attributes
 * @returns boolean - True if return order request is enabled, false otherwise
 */
export function isReturnOrderRequestEnabled(portalData: IPortalDetail | null | undefined): boolean {
  return isFeatureEnabled(portalData, SETTINGS.ENABLE_RETURN_ORDER_REQUEST);
}

/**
 * Specific function to check if return order request is enabled from user settings
 * @param attributesMap - The mapped global attributes from user settings
 * @returns boolean - True if return order request is enabled, false otherwise
 */
export function isReturnOrderRequestEnabledFromUserSettings(attributesMap: Record<string, string | boolean | number>): boolean {
  return isFeatureEnabledFromUserSettings(attributesMap, SETTINGS.ENABLE_RETURN_ORDER_REQUEST);
}
