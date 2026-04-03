import "./navigation.scss";

import { useEffect, useRef } from "react";

import { MENU } from "@znode/constants/menu";
import MegaMenu from "../mega-menu/MegaMenu";
import { useModal } from "../../../../stores/modal";
import { useTranslations } from "next-intl";

export const Navigation = () => {
  const menuTranslations = useTranslations("Layout");
  const { isMenuShown, setIsMenuShown } = useModal();
  const isMenuShownRef = useRef(isMenuShown);

  // when we try to open modal other than mega-menu #Z10-24346
  useEffect(() => {
    isMenuShownRef.current = isMenuShown;
  }, [isMenuShown]);

  const displayMenu = () => {
    document.body.classList.add("overflow-hidden");
    isMenuShown === false ? setIsMenuShown(true) : setIsMenuShown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target || !(event.target instanceof Element)) return;
      if (event.target?.parentElement?.classList.contains("shop-department-chevron")) return;

      if (!event.target.classList.contains("shop-department-wrapper")) {
        setIsMenuShown(false);
      }
      if (isMenuShownRef.current) {
        document.body.classList.remove("overflow-hidden");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <nav>
      <ul className="flex items-center gap-6 mt-1 font-semibold uppercase" data-test-selector="listNavigationContainer">
        <li className="self-end" data-test-selector="listShopDepartment">
          <button className="w-full py-1 font-medium uppercase text-start" onClick={displayMenu} data-test-selector="btnDepartment">
            <span>{menuTranslations("shopDepartment")}</span>
          </button>
          <MegaMenu type={MENU.DESKTOP} customClass="mega-menu absolute left-0 top-full" isVisible={isMenuShown} />
        </li>
      </ul>
    </nav>
  );
};
