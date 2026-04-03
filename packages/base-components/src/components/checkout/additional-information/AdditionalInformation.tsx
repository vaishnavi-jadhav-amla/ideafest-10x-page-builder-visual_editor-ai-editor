import { ChangeEvent, Dispatch, SetStateAction } from "react";

import { Heading } from "../../common/heading";
import Input from "../../common/input/Input";
import { ValidationMessage } from "../../common/validation-message";
import { useTranslationMessages } from "@znode/utils/component";

interface IAdditionalInformationProps {
  setJobName: Dispatch<SetStateAction<string>>;
  setAdditionalInstruction: Dispatch<SetStateAction<string>>;
  jobName: string;
  additionalInstruction: string;
  additionalError?: string;
  setAdditionalError?: Dispatch<SetStateAction<string>>;
  jobError?: string;
  setJobError?: Dispatch<SetStateAction<string>>;
}

export function AdditionalInformation({
  setJobName,
  setAdditionalInstruction,
  jobName,
  additionalInstruction,
  additionalError,
  setAdditionalError,
  jobError,
  setJobError,
}: IAdditionalInformationProps) {
  const checkoutTranslations = useTranslationMessages("Checkout");

  const handleInputJobName = (event: ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.value?.length > 100) {
      setJobError?.(checkoutTranslations("characterLimitErrorJob"));
    } else {
      setJobError?.("");
    }
    setJobName(event.target.value);
  };

  const handleInputForDescription = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event?.target?.value?.length > 500) {
      setAdditionalError?.(checkoutTranslations("characterLimitErrorAdditional"));
    } else {
      setAdditionalError?.("");
    }

    setAdditionalInstruction(event.target.value);
  };

  return (
    <div className="w-full pt-1 mt-4" data-test-selector="AdditionalInfoContainer">
      <Heading name={checkoutTranslations("additionalInfoHeading")} showSeparator customClass="heading-2 text-start uppercase" dataTestSelector="hdgAdditionalInfo" />
      <div>
        <form>
          <div className="pb-2 space-y-1">
            <Input
              className="w-full px-2 py-1 "
              dataTestSelector="txtJobProjectHeadline"
              value={jobName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleInputJobName(e);
              }}
              aria-label="Project Name"
              isLabelShow={true}
              label={checkoutTranslations("jobProjectName")}
              isRequired={false}
              maxLength={100}
              id="cart-name"
              labelCustomClass="font-semibold mb-1 capitalize"
            />

            <ValidationMessage message={jobError} customClass="text-errorColor" dataTestSelector="jobError" />
          </div>
          <div className="space-y-2">
            <label className="font-semibold capitalize" data-test-selector="lblAdditionalInfo">
              {checkoutTranslations("additionalInformation")}
            </label>
            <textarea
              className="w-full h-40 px-2 py-1 resize-none input "
              name="AdditionalInfo"
              data-test-selector="txtAdditionalInfo"
              value={additionalInstruction}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputForDescription(e)}
              maxLength={500}
              aria-label="Additional Information"
            />
            <ValidationMessage message={additionalError} customClass="text-errorColor" dataTestSelector="additionalError" />
          </div>
        </form>
      </div>
    </div>
  );
}
