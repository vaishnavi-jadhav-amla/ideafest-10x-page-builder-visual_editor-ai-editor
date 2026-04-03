"use client";

import "./change-locale.scss";
import { useEffect, useRef, useState } from "react";
import { IPortalLocale } from "@znode/types/portal";
import { useTranslations } from "next-intl";
import { useCommonDetails } from "../../../../stores/common";
import { FALLBACK, LOCALES } from "@znode/constants/i18n";
import { ZIcons } from "../../../common/icons";
import { SETTINGS } from "@znode/constants/settings";

export function ChangeLocale({ isMobile = false }: Readonly<{ isMobile?: boolean }>) {
  const { portalLocale } = useCommonDetails();
  const locales = LOCALES;
  const fallBackLng = FALLBACK;
  const ChangeLocaleMessages = useTranslations("ChangeLocale");
  const [isLocaleMenuOpen, setLocaleMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<IPortalLocale | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkPortalLocales = async () => {
    if (portalLocale && portalLocale.length > 0) {
      const currentUrl = window.location.pathname.split("/")[1];
      const matchingLocale = portalLocale.find((locale: { code: string; isActive: boolean }) => locale.code === currentUrl && locale.isActive);
      if (matchingLocale) {
        setActiveLanguage(matchingLocale);
      } else {
        const defaultLocale = portalLocale.find((locale: { isDefault: boolean; isActive: boolean }) => locale.isDefault && locale.isActive);
        setActiveLanguage(defaultLocale || portalLocale[0]);
      }
    }
  };

  const checkFallBackLanguage = (language: IPortalLocale) => {
    return locales.includes(language.code) ? language : fallBackLng;
  };

  const applyCurrentLanguage = (selectedLocale: IPortalLocale) => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    let currentPathName = url.pathname;
    locales.forEach((lang) => {
      currentPathName = currentPathName.replace(new RegExp(`/${lang}`, "g"), "");
    });
    const routeWithTranslation = `${window.location.origin}/${selectedLocale.code}${currentPathName}${url.search || ""}${url.hash || ""}`;
    window.location.href = routeWithTranslation;
  };

  const switchLocale = (selectedLocale: IPortalLocale) => {
    const selectedLanguage = checkFallBackLanguage(selectedLocale);
    setActiveLanguage(selectedLanguage);
    applyCurrentLanguage(selectedLanguage);
  };

  const toggleLanguageMenu = () => {
    setLocaleMenuOpen((prevState) => !prevState);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setLocaleMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    checkPortalLocales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalLocale]);

  const renderLocales = () => {
    return (
      portalLocale &&
      portalLocale.map((locale: IPortalLocale, index: number) => (
        <li
          key={locale.localeId}
          className={`cursor-pointer px-2 py-[3px] text-textColor ${index !== portalLocale.length - 1 ? "mb-1.5" : ""} 
            ${locale.localeId === activeLanguage?.localeId ? "bg-gray-100" : ""} hover:bg-gray-100`}
          onClick={() => switchLocale(locale)}
        >
          {locale.name}
        </li>
      ))
    );
  };

  return (
    <div className="relative font-semibold local-menu cursor-pointer" role="menu" ref={dropdownRef} onClick={toggleLanguageMenu}>
      <div className="flex items-center justify-center local-menu" role="menuitem">
        <div data-test-selector="paraLocaleInitial" className="flex items-center justify-center w-6 h-6 bg-white rounded-full lg:bg-black local-menu">
          <span className="text-[11px] uppercase text-textColor lg:text-white">{activeLanguage?.code ? activeLanguage.code.slice(0, 2) : fallBackLng.code.slice(0, 2)}</span>
        </div>
        <div data-test-selector="btnChangeLocale" className="flex text-[13px] text-white cursor-pointer lg:text-textColor local-menu">
          <ZIcons name="chevron-down" className="ml-0.5" data-test-selector="svgLocaleArrowDown" color={`${isMobile ? SETTINGS.ARROW_COLOR_WHITE : SETTINGS.ARROW_COLOR}`} />
        </div>
      </div>
      {isLocaleMenuOpen && (
        <div className="locale-popover">
          <div className="locale-arrow-container">
            <div className="hidden locale-arrow-border md:flex"></div>
            <div className="hidden locale-arrow-center md:flex"></div>
          </div>
          <div className="content lg:min-w-max">
            <div className="flex items-center mb-0 md:mb-2">
              <ul className="w-full p-2 bg-white md:p-0">
                <li className="items-center hidden w-full pb-2 mb-2 text-sm border-b border-black md:flex" data-test-selector="listSelectLocaleLabel">
                  {ChangeLocaleMessages("selectLocale")}
                </li>
                {renderLocales()}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
