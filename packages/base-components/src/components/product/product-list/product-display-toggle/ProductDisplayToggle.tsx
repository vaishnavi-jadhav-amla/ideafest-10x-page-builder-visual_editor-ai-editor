import { LayoutGrid, List } from "lucide-react";

import { IProductDisplayToggle } from "@znode/types/product";
import { MODE } from "@znode/constants/mode";
import React from "react";
import { formatTestSelector } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";

const ProductDisplayToggle: React.FC<IProductDisplayToggle> = ({ selectedMode, viewChange }) => {
  const t = useTranslationMessages("Product");

  const handleIconClick = (icon: string) => {
    viewChange(icon);
  };

  const iconList = [
    {
      title: t("gridView"),
      icon: LayoutGrid,
      mode: MODE.GRID_MODE,
      size: 18,
    },
    {
      title: t("listView"),
      icon: List,
      mode: MODE.LIST_MODE,
      size: 22,
    },
  ];

  return (
    <div className="flex items-center">
      <label className="pr-2 ml-3 text-sm" data-test-selector="lblView">
        {t("view")}:
      </label>
      <div className="flex items-center gap-2">
        {iconList.map(({ icon: Icon, mode, title, size }, index) => {
          const selector = formatTestSelector("svg", title);

          return (
            <div className="cursor-pointer" key={`${title}-${index}`} title={title} onClick={() => handleIconClick(mode)}>
              <Icon size={size} data-test-selector={selector} color={selectedMode === mode ? "#000000" : "#9e9e9e"} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductDisplayToggle;
