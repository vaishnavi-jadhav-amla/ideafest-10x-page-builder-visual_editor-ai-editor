import { PRODUCT_TYPE } from "@znode/constants/product";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";

interface ITypicalLeadTime {
  typicalLeadTime: number ;
  productType: string;
  customLabelWidth?: string;
}

const TypicalLeadTiming = ({ typicalLeadTime , productType, customLabelWidth }: ITypicalLeadTime) => {
  const commonTranslations  = useTranslationMessages("Common");
  const renderTypicalLeadTime = () => {
    if (productType === PRODUCT_TYPE.SIMPLE_PRODUCT && typicalLeadTime !== null) {
      return (
        <>
          <p className={`font-medium ${customLabelWidth}`}>{commonTranslations("typicalLeadTime")}:</p>
          <p>
            {typicalLeadTime} {commonTranslations("days")}
          </p>
        </>
      );
    }
    return null;
  };

  return <>{renderTypicalLeadTime()}</>;
};

export default TypicalLeadTiming;
