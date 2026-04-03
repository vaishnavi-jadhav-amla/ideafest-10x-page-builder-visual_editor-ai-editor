"use client";

import { Heading } from "../../common/heading";
import { SAVED_CART } from "@znode/constants/saved-cart";
import { SaveNewCart } from "./SaveNewCart";
import { SavedCartList } from "./SavedCartList";
import { useState } from "react";
import { useTranslationMessages } from "@znode/utils/component";

export const SavedCart = () => {
  const savedCartTranslation = useTranslationMessages("SavedCart");
  const [activeTab, setActiveTab] = useState<string>("SaveNewCart");

  return (
    <div className="sm:w-[24rem] xs:w-full">
      <Heading name="Saved Cart" customClass="uppercase" dataTestSelector="hdgSavedCart" showSeparator />
      <div>
        <ul className="flex w-full separator-sm my-0" data-test-selector="listSaveCartTabsContainer">
          <li
            className={`cursor-pointer uppercase font-medium p-2 ${activeTab === SAVED_CART.SAVED_CART ? "separator-sm my-0" : ""}`}
            onClick={() => setActiveTab("SavedCart")}
            data-test-selector="listSavedCartsTab"
          >
            {savedCartTranslation("savedCarts")}
          </li>
          <li
            className={`cursor-pointer uppercase font-medium p-2 ${activeTab === SAVED_CART.SAVE_NEW_CART ? "separator-sm my-0" : ""}`}
            onClick={() => setActiveTab("SaveNewCart")}
            data-test-selector="listSaveNewCartTab"
          >
            {savedCartTranslation("saveNewCart")}
          </li>
        </ul>
        <div className="p-3">
          {activeTab === SAVED_CART.SAVE_NEW_CART && <SaveNewCart />}
          {activeTab === SAVED_CART.SAVED_CART && <SavedCartList />}
        </div>
      </div>
    </div>
  );
};
