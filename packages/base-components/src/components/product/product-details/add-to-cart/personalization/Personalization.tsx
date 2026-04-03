"use client";

import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { IAttributesDetails } from "@znode/types/product";
import { IProperty } from "@znode/types/attribute";
import { Input } from "../../../../common/input/Input";
import { ValidationMessage } from "../../../../../components/common/validation-message";
import { formatTestSelector } from "@znode/utils/common";
import { removeWhiteSpaces } from "@znode/utils/component";
import { useProduct } from "../../../../../stores";
import { useTranslations } from "next-intl";
import { Heading } from "../../../../../components/common/heading";

interface IPersonalization {
  attributes?: IAttributesDetails[];
  isProductCompare: boolean;
  personalizeCodesAndValues: { [key: string]: string };
  setPersonalizeCodesAndValues: Dispatch<SetStateAction<{ [key: string]: string }>>;
  setIsPersonalizedFormValid?: Dispatch<SetStateAction<boolean>>;
}

const Personalization = ({ attributes, isProductCompare, personalizeCodesAndValues, setPersonalizeCodesAndValues, setIsPersonalizedFormValid }: IPersonalization) => {
  const personalizeTranslations = useTranslations("Product");
  const [formError, setFormError] = useState<{ [key: string]: { isValid: boolean; errorMessage: string } }>({});
  const personalizedData = attributes;
  const { setIsPersonalized } = useProduct();
  const validateInput = (personalizeInput: string, formData: IProperty, formId: string): [boolean, string, string] => {
    let isValid = true;
    let errorMessage = "";

    if (formData?.htmlAttributes?.isRequired && personalizeInput === "") {
      isValid = false;
      errorMessage = `${formId} ${personalizeTranslations("fieldIsRequired")}`;
    } else if (formData?.htmlAttributes?.validation?.maxCharacters !== "" && Number(personalizeInput.length) > Number(formData?.htmlAttributes?.validation?.maxCharacters)) {
      isValid = false;
      errorMessage = `${formId} ${personalizeTranslations("exceedMaxLimitError")} ${formData?.htmlAttributes?.validation?.maxCharacters} ${personalizeTranslations("characters")}.`;
    } else if (
      formData?.htmlAttributes?.validation?.regularExpression &&
      personalizeInput.length > 0 &&
      personalizeInput.match(formData?.htmlAttributes?.validation?.regularExpression) == null
    ) {
      isValid = false;
      switch (formData?.htmlAttributes?.validation.validationRule) {
        case "Email":
          errorMessage = `${formId} ${personalizeTranslations("incorrectEmail")}`;
          break;
        case "URL":
          errorMessage = `${formId} ${personalizeTranslations("incorrectURL")}`;
          break;
        case "Alphanumeric":
          errorMessage = `${personalizeTranslations("onlyAlphanumericAllowed")} ${formId}.`;
          break;
        default:
          errorMessage = `${formId} ${personalizeTranslations("invalidInput")}`;
          break;
      }
    }

    return [isValid, errorMessage, formId];
  };

  const checkAllTheRequiredFieldHasValue = () => {
    const personalizeAttributes = attributes;
    const personalizationText = personalizeAttributes
      ?.filter((attribute: IAttributesDetails) => attribute.attributeTypeName === "Text" && attribute?.isPersonalizable)
      .map((attribute: IAttributesDetails) => {
        if (attribute?.controlProperty?.htmlAttributes?.isRequired) {
          const attributeName = attribute?.attributeName as string;
          if (
            !personalizeCodesAndValues[attributeName] ||
            personalizeCodesAndValues[attributeName] === "" ||
            !validateInput(personalizeCodesAndValues[attributeName], attribute?.controlProperty, attributeName)[0]
          ) {
            return false;
          }
        }
        return true;
      });
    return personalizationText?.every((value: boolean) => value === true);
  };

  const isPersonalizedEnabled = () => {
    const isPersonalizedList = attributes;
    const isPersonalized = isPersonalizedList?.some((attribute: IAttributesDetails) => attribute.attributeTypeName === "Text" && attribute.isPersonalizable);
    if (isPersonalized) {
      const isPersonalizedFormValid = checkAllTheRequiredFieldHasValue() ?? false;
      setIsPersonalizedFormValid && setIsPersonalizedFormValid(isPersonalizedFormValid);
      setIsPersonalized(!isPersonalizedFormValid);
    } else {
      setIsPersonalized(false);
    }
  };

  useEffect(() => {
    isPersonalizedEnabled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePersonalizeInputChange = (event: ChangeEvent<HTMLInputElement>, validation: IProperty, id: string) => {
    const personalizeInput = event.target.value;
    const personalizeCodesDictionary: { [key: string]: string } = personalizeCodesAndValues;
    if (personalizeInput.trim() !== "") {
      personalizeCodesDictionary[event.target.id] = personalizeInput;
    } else {
      delete personalizeCodesDictionary[event.target.id];
    }
    const [isValid, errorMessage, formId]: [boolean, string, string] = validateInput(personalizeInput, validation, id);

    setFormError((prevData) => ({
      ...prevData,
      [formId]: { isValid, errorMessage },
    }));

    setPersonalizeCodesAndValues(personalizeCodesDictionary);
    const isFormValid = checkAllTheRequiredFieldHasValue() ?? false;
    const isFormValidate = Object.values({ ...formError, [formId]: { isValid, errorMessage } })?.filter((key) => key.isValid === false).length > 0;
    setIsPersonalizedFormValid && setIsPersonalizedFormValid(isFormValid || !isFormValidate);
    setIsPersonalized(!isFormValid || isFormValidate);
  };

  return (
    <div>
      {personalizedData &&
        !isProductCompare &&
        personalizedData.some((attribute) => attribute.attributeTypeName === "Text" && attribute.isPersonalizable) &&
        personalizedData
          .filter((attribute) => attribute.attributeTypeName === "Text" && attribute.isPersonalizable)
          .map((attribute, index) => {
            const { attributeName, controlProperty, attributeValues } = attribute;
            return (
              <div key={`${index}-${attributeName}`} className={isProductCompare ? "mt-3" : "mb-1"}>
                <div className="flex">
                  <Heading
                    name={attributeName}
                    data-test-selector={formatTestSelector("lblProductPersonalization", `${attributeName}`)}
                    level="h3"
                    customClass="w-max p-0 custom-word-break"
                  />
                  &nbsp;
                  {controlProperty?.htmlAttributes?.isRequired && (
                    <span className="text-sm text-errorColor" data-test-selector={formatTestSelector("spnProductPersonalizationRequired", `${attributeName}`)}>
                      *
                    </span>
                  )}
                </div>
                <Input
                  id={removeWhiteSpaces(attributeName ?? "")}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    handlePersonalizeInputChange(event, controlProperty as IProperty, attributeName as string);
                  }}
                  dataTestSelector={formatTestSelector("txtProductPersonalization", `${attributeName}`)}
                  placeholder={isProductCompare ? attributeValues : (controlProperty?.htmlAttributes && controlProperty?.htmlAttributes.placeholder) || ""}
                  className={`${isProductCompare ? "w-full" : "w-full sm:max-w-lg"} text-sm px-3`}
                  ariaLabel="Personalization field"
                ></Input>
                {attributeName && (
                  <ValidationMessage
                    message={formError[attributeName]?.errorMessage || ""}
                    dataTestSelector={`personalizationError${attributeName}`}
                    customClass="text-sm text-errorColor"
                  />
                )}
              </div>
            );
          })}
    </div>
  );
};

export default Personalization;
