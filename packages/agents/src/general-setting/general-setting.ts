import { AREA, errorStack, logServer } from "@znode/logger/server";
import { DateFormatMapper, FilterCollection, FilterKeys, FilterOperators, TimeFormatMapper, TimezoneMapper, convertCamelCase } from "@znode/utils/server";
import { FilterTuple, GlobalSettings_globalSettingsGet } from "@znode/clients/v2";
import { IDateFormat, IGeneralSetting, ITimeFormat, ITimeZone } from "@znode/types/general-setting";

import { GENERAL_SETTINGS } from "@znode/constants/app";

export async function getGeneralSettingList() {
  const defaultGeneralSettings = {
    displayTimeZone: GENERAL_SETTINGS.DEFAULT_TIME_ZONE,
    dateFormat: GENERAL_SETTINGS.DATE_FORMAT,
    timeFormat: GENERAL_SETTINGS.TIME_ZONE,
    priceRoundOff: GENERAL_SETTINGS.PRICE_ROUND_OFF,
  };
  try {
    let generalSetting: IGeneralSetting;
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, "DefaultGlobalConfigCache");
    const generalSettingList = (await GlobalSettings_globalSettingsGet(cacheInvalidator.filterTupleArray as FilterTuple[]))?.GeneralSetting;

    const getDefaultData = <T extends { isDefault?: boolean }>(list: T[]): T | undefined => {
      return list?.length ? list.find((item) => item?.isDefault === true) : undefined;
    };

    if (generalSettingList) {
      const { timeZoneList, dateFormatList, timeFormatList, priceRoundOffList } = convertCamelCase(generalSettingList);

      const timeZoneData = getDefaultData<ITimeZone>(timeZoneList);
      const dateFormatData = getDefaultData<IDateFormat>(dateFormatList);
      const timeFormatData = getDefaultData<ITimeFormat>(timeFormatList);
      const priceRoundOff = priceRoundOffList.find((item: { featureName: string }) => item?.featureName === "PriceRoundOff")?.featureValues;

      generalSetting = {
        displayTimeZone: timeZoneData ? TimezoneMapper[timeZoneData.timeZoneDetailsDesc] : GENERAL_SETTINGS.DEFAULT_TIME_ZONE,
        dateFormat: dateFormatData ? DateFormatMapper[dateFormatData.dateFormat] : GENERAL_SETTINGS.DATE_FORMAT,
        timeFormat: timeFormatData ? TimeFormatMapper[timeFormatData.timeFormat] : GENERAL_SETTINGS.TIME_ZONE,
        priceRoundOff: Number(priceRoundOff),
      };
    } else {
      generalSetting = defaultGeneralSettings;
    }
    return generalSetting as IGeneralSetting;
  } catch (error) {
    logServer.error(AREA.GENERAL_SETTING, errorStack(error));
    return defaultGeneralSettings as IGeneralSetting;
  }
}
