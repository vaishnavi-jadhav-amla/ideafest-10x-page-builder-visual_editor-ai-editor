import { useEffect, useRef, useState } from "react";
import { IPopupButtonRef, PopupButton } from "../popup-button/PopupButton";
import { FormConfiguration, IFormConfiguration, validationSchema } from "./FormConfiguration";
import { FormikHelpers, useFormik } from "formik";
import { usePuck } from "@measured/puck";
import { saveFormConfigurationAPI, updateFormConfigurationAPI, getFormConfigurationAPI } from "@znode/base-components/http-request";
import { isEmpty, removeFirstWord } from "@znode/utils/common";
import { produce } from "immer";
import { LoadingSpinnerComponent } from "@znode/base-components/common/icons";
import { ISaveConfigurationRequest, ISaveFormConfigurationResponse } from "@znode/types/form-builder/save-form-configuration";

interface IRichTextEditorWrapperProps {
  value: string;
  onChange: (_value: string) => void;
}

export function FormWidgetListWrapper(props: Readonly<IRichTextEditorWrapperProps>) {
  const { value } = props;
  const [isLoading, setIsLoading] = useState(false);

  const popupButtonRef = useRef<IPopupButtonRef>(null);
  const { selectedItem, dispatch } = usePuck();
  const postMessagePayloadData = selectedItem?.props?.config?.postMessagePayload?.data;
  const cmsFormWidgetConfigurationId: number | undefined = postMessagePayloadData?.cmsFormWidgetConfigurationId;

  const formik = useFormik<IFormConfiguration>({
    initialValues: {
      formCodeId: "",
      formName: "",
      submissionAction: "textMessage",
      textMessage: "",
      redirectUrl: "",
      submitButtonText: "",
      notificationUserName: "",
      acknowledgementEmailTemplateName: "",
      notificationEmailTemplateName: "",
      errorMessage: "",
      formCode: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values: IFormConfiguration, formikHelpers: FormikHelpers<IFormConfiguration>) {
    try {
      setIsLoading(true);

      const postMessagePayloadData = selectedItem?.props?.config?.postMessagePayload?.data;

      let updateWidgetKey = postMessagePayloadData?.widgetKey;
      if (!postMessagePayloadData?.cmsFormWidgetConfigurationId && !postMessagePayloadData?.formCodeId) {
        const id = removeFirstWord(selectedItem?.props.id);
        updateWidgetKey = id ? `${values.formCodeId}-${id}` : updateWidgetKey;
      }

      const request: ISaveConfigurationRequest = {
        buttonText: values.submitButtonText,
        formBuilderId: Number(values.formCodeId),
        cmsMappingId: 0, // default No Use
        enableCmsPreview: false,
        formTitle: values.formName,
        isShowCaptcha: false,
        isTextMessage: values.submissionAction === "textMessage" ? true : false,
        localeCode: "",
        notificationUserName: values.notificationUserName,
        notificationEmailTemplateName: values.notificationEmailTemplateName || "",
        acknowledgementEmailTemplateName: values.acknowledgementEmailTemplateName ?? "",
        redirectUrl: values.redirectUrl,
        textMessage: values.textMessage,
        typeOfMapping: "DEFAULT", // default No Use
        widgetCode: "FormWidget", // default No Use
        widgetsKey: updateWidgetKey,
      };

      // Call the SAVE form Configuration API
      if (!postMessagePayloadData?.cmsFormWidgetConfigurationId) {
        let response: ISaveFormConfigurationResponse | undefined | null;
        response = await saveFormConfigurationAPI(request); // Create Form Configuration

        if ("errorMessage" in response && response.errorMessage) {
          formik.setFieldValue("errorMessage", response.errorMessage);
        } else {
          const cmsFormWidgetConfigurationId = response?.cmsFormWidgetConfigurationId;
          if (response && cmsFormWidgetConfigurationId) {
            dispatch({
              type: "setData",
              data: (data) => {
                const newData = produce(data, (draft) => {
                  draft.content = draft.content.map((content) => {
                    if (content.props.id === selectedItem?.props.id && !isEmpty(content.props?.config) && content.type === "FormWidget") {
                      content.props = {
                        ...content.props,
                        config: {
                          ...content.props.config,
                          postMessagePayload: {
                            ...content.props?.config?.postMessagePayload,
                            data: {
                              formCodeId: values.formCodeId,
                              formCode: values.formCode,
                              widgetCode: "FormWidget",
                              widgetKey: updateWidgetKey,
                              cmsFormWidgetConfigurationId: cmsFormWidgetConfigurationId,
                            },
                          },
                        },
                      };
                    }

                    return content;
                  });

                  if (draft.zones && Object.keys(draft.zones).length > 0) {
                    Object.keys(draft.zones).forEach((zoneKey) => {
                      if (draft.zones) {
                        draft.zones[zoneKey] =
                          draft.zones &&
                          draft.zones[zoneKey].map((zoneContent) => {
                            if (zoneContent.props.id === selectedItem?.props.id && !isEmpty(zoneContent?.props?.config) && zoneContent.type === "FormWidget") {
                              zoneContent.props = {
                                ...zoneContent.props,
                                config: {
                                  ...zoneContent.props.config,
                                  postMessagePayload: {
                                    ...zoneContent.props?.config?.postMessagePayload,
                                    data: {
                                      formCodeId: values.formCodeId,
                                      formCode: values.formCode,
                                      widgetCode: "FormWidget",
                                      widgetKey: updateWidgetKey,
                                      cmsFormWidgetConfigurationId: cmsFormWidgetConfigurationId,
                                    },
                                  },
                                },
                              };
                            }

                            return zoneContent;
                          });
                      }
                    });
                  }
                });

                return newData;
              },
            });
          }

          formikHelpers.resetForm();
          popupButtonRef.current?.closePopup();
        }
      } else {
        // Call the UPDATE form Configuration API
        const response = await updateFormConfigurationAPI(request); // Update Form Configuration

        if ("errorMessage" in response && response.errorMessage) {
          formik.setFieldValue("errorMessage", response.errorMessage);

          setTimeout(() => {
            formik.setFieldValue("errorMessage", "");
          }, 5000);
        } else {
          formikHelpers.resetForm();
          popupButtonRef.current?.closePopup();
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const eventData = event.data;
      if (!eventData || eventData?.actionType !== "open_popup") return;

      let hasPopupOpened: boolean = false;
      if (eventData?.data?.cmsFormWidgetConfigurationId && eventData?.data?.widgetKey && eventData?.data?.formCode) {
        setIsLoading(true);
        hasPopupOpened = true;
        popupButtonRef.current?.openPopup();
        try {
          const response = await getFormConfigurationAPI({ widgetKey: eventData?.data?.widgetKey });
          if (response) {
            formik.setValues({
              formCodeId: eventData?.data?.formCodeId,
              formName: response.formTitle.trim(), // you may need to store this separately or fetch from API
              submissionAction: response.isTextMessage ? "textMessage" : "redirect",
              textMessage: response.textMessage?.trim() ?? "",
              redirectUrl: response.redirectUrl ?? "",
              submitButtonText: response.buttonText ?? "",
              notificationUserName: response.widgetEmailConfiguration.notificationUserName ?? "",
              notificationEmailTemplateName: response.widgetEmailConfiguration.notificationEmailTemplateName ?? "",
              acknowledgementEmailTemplateName: response.widgetEmailConfiguration.acknowledgementEmailTemplateName ?? "",
              errorMessage: "",
              formCode: eventData?.data?.formCode ?? "",
            });
          }
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      }

      if (!hasPopupOpened) {
        popupButtonRef.current?.openPopup();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function handlePopupOpen(type?: "window" | "change", text?: string) {
    let newValue = value;
    if (type && type === "window") {
      newValue = text || "";
    }
  }

  function handleBack() {
    if (isLoading) {
      return null;
    }
    popupButtonRef.current?.closePopup();
    formik.resetForm();
  }

  return (
    <>
      <PopupButton
        ref={popupButtonRef}
        buttonTitle="Open Form Widget"
        popupHeaderTitle="CONFIGURE - FORM"
        saveButtonTitle="SAVE"
        onOpen={handlePopupOpen}
        onBack={handleBack}
        onSave={() => {
          !isLoading && formik.handleSubmit();
        }}
        hasBackButtonHandle
        hasSaveButtonHandle
        buttonStyleProps={{
          display: "none",
        }}
        popupContainerStyle={{
          width: "100%",
          maxWidth: "750px",
          height: "420px"
        }}
      >
        {isLoading && <LoadingSpinnerComponent />}
        {!isLoading && <FormConfiguration formConfigurationFormik={formik} cmsFormWidgetConfigurationId={cmsFormWidgetConfigurationId} />}
      </PopupButton>
    </>
  );
}
