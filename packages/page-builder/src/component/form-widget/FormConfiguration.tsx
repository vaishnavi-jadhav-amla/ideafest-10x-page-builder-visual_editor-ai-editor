import { useEffect, useState } from "react";
import { getEmailTemplateListAPI, getFormCodeListPaginationAPI } from "@znode/base-components/http-request";
import { FormikProps } from "formik";
import * as Yup from "yup";
import { IFormCodeItem } from "@znode/types/form-builder/form-code-list";
import { LoadingSpinnerComponent } from "@znode/base-components/common/icons";
import { HelpLabel } from "@znode/base-components/znode-widget/form-widget/form-field/HelpLabel";
import { FormTextField } from "@znode/base-components/znode-widget/form-widget/form-field/FormTextField";
import { SearchableDropdown } from "./SearchableDropdown";
import { IEmailTemplateItem } from "@znode/types/form-builder/email-template-list";

export const validationSchema = Yup.object({
  formCode: Yup.string().required("Select Form is required."),
  formName: Yup.string().required("Form Name is required.").matches(/^(.*\S.*)$/, "Form Name is required."),
  redirectUrl: Yup.string()
    .nullable()
    .when("submissionAction", {
      is: "redirect",
      then: (schema) => {
        return schema.test("is-valid-url", "Enter a valid fully qualified URL (e.g., http(s)://mysite.com).", (value) => {
          if (!value || value.trim() === "") return true; // Optional field
          const urlRegex = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w\- ./?%&=]*)?$/;
          return urlRegex.test(value);
        });
      },
      otherwise: (schema) => schema.notRequired(),
    }),
  notificationUserName: Yup.string()
    .nullable()
    .notRequired()
    .test("is-valid-multiple-emails", "Please enter valid Notification Email Addresses.", (value) => {
      if (!value || value.trim() === "") return true; // Optional field
      const emails = value.split(",").map((e) => e.trim());
      const emailRegex = /^[a-zA-Z0-9+_.'-]+@[a-zA-Z0-9.-]+$/;

      const allValid = emails.every((email) => emailRegex.test(email));

      const hasDuplicates = new Set(emails.map((e) => e.toLowerCase())).size !== emails.length;
      return allValid && !hasDuplicates;
    }),
});

interface IFormConfigurationProps {
  formConfigurationFormik: FormikProps<IFormConfiguration>;
  cmsFormWidgetConfigurationId: number | undefined;
}

export interface IFormConfiguration {
  formCodeId: string;
  formName: string;
  submissionAction: string;
  textMessage: string;
  redirectUrl: string;
  submitButtonText: string;
  notificationUserName: string;
  notificationEmailTemplateName: string;
  acknowledgementEmailTemplateName: string;
  errorMessage: string;
  formCode: string;
}

export type IEmailTemplateType = keyof Pick<IFormConfiguration, "acknowledgementEmailTemplateName" | "notificationEmailTemplateName">;

export function FormConfiguration(props: IFormConfigurationProps) {
  const { formConfigurationFormik, cmsFormWidgetConfigurationId = undefined } = props;

  const [formState, setFormState] = useState({
    loading: false,
    items: [] as IFormCodeItem[],
    pagination: {
      pageIndex: 1,
      totalPages: 1,
      pageSize: 10,
      totalResults: 0,
    },
  });

  const [emailState, setEmailState] = useState({
    loading: false,
    items: [] as IEmailTemplateItem[],
    pagination: {
      pageIndex: 1,
      totalPages: 1,
      pageSize: 10,
      totalResults: 0,
    },
  });

  const formik = formConfigurationFormik;

  useEffect(() => {
    const fetchAll = async () => {
      const [formCodeResult, emailTemplateResult] = await Promise.allSettled([fetchFormCode(), fetchEmailTemplates()]);

      if (formCodeResult.status === "rejected") {
        console.error("Form code fetch failed:", formCodeResult.reason);
      }

      if (emailTemplateResult.status === "rejected") {
        console.error("Email template fetch failed:", emailTemplateResult.reason);
      }
    };

    fetchAll();
  }, []);

  async function fetchFormCode() {
    try {
      setFormState((prev) => ({
        ...prev,
        loading: true,
      }));
      const response = await getFormCodeListPaginationAPI();
      if (response.formCodeList) {
        const paginationDetails = response?.formCodeListPaginationDetail;

        setFormState({
          loading: false,
          items: response.formCodeList,
          pagination: {
            pageIndex: paginationDetails?.pageIndex || 1,
            pageSize: paginationDetails?.pageSize || 10,
            totalPages: paginationDetails?.totalPages || 1,
            totalResults: paginationDetails?.totalResults || 1,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch form codes:", error);
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }

  async function fetchEmailTemplates() {
    try {
      setEmailState((prev) => ({
        ...prev,
        loading: true,
      }));
      const response = await getEmailTemplateListAPI();
      const templates = response?.emailTemplates ?? [];
      const paginationDetails = response?.paginationDetail;
      setEmailState({
        loading: false,
        items: templates,
        pagination: {
          pageIndex: paginationDetails?.pageIndex ? paginationDetails?.pageIndex : 1,
          pageSize: paginationDetails?.pageSize || 10,
          totalPages: paginationDetails?.totalPages || 1,
          totalResults: paginationDetails?.totalResults || 1,
        },
      });
    } catch (error) {
      console.log("fetchEmailTemplates Error", error);
    } finally {
      setEmailState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }

  async function handleFetchEmailItems(searchValue: string, pageIndex: number, pageSize: number) {
    const searchKey = searchValue ? "TemplateName" : "";
    const response = await getEmailTemplateListAPI(pageIndex, pageSize, searchKey, searchValue);

    const paginationDetails = response.paginationDetail;

    return {
      items: response.emailTemplates ? response.emailTemplates : [],
      pagination: {
        pageIndex: paginationDetails?.pageIndex ? paginationDetails?.pageIndex : 1,
        pageSize: paginationDetails?.pageSize || 10,
        totalPages: paginationDetails?.totalPages || 1,
        totalResults: paginationDetails?.totalResults || 1,
      },
    };
  }

  async function handleFetchFormItems(searchValue: string, pageIndex: number, pageSize: number) {
    const searchKey = searchValue ? "FormName" : "";
    const response = await getFormCodeListPaginationAPI(pageIndex, pageSize, searchKey, searchValue);

    const paginationDetails = response.formCodeListPaginationDetail;

    return {
      items: response.formCodeList ? response.formCodeList : [],
      pagination: {
        pageIndex: paginationDetails?.pageIndex ? paginationDetails?.pageIndex : 1,
        pageSize: paginationDetails?.pageSize || 10,
        totalPages: paginationDetails?.totalPages || 1,
        totalResults: paginationDetails?.totalResults || 1,
      },
    };
  }

  function handleFormSelect(item: IFormCodeItem | undefined) {
    if (item) {
      formik.setFieldValue("formCodeId", item.formCodeId);
      formik.setFieldValue("formCode", item.formCode);
      formik.setFieldValue("formName", item.formName);
    }
    return item;
  }

  function handleEmailSelect(item: IEmailTemplateItem | undefined, type: IEmailTemplateType) {
    if (item) {
      formik.setFieldValue(type, item.templateName);
    }

    return item;
  }

  function handleEmailItemValue(item: IEmailTemplateItem) {
    return item.templateName;
  }

  if (formState.loading) {
    return <LoadingSpinnerComponent />;
  }

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-md h-[320px] overflow-y-auto px-2 flex flex-col gap-4">
          {formik.values.errorMessage && (
            <div className="mt-1 mb-6 flex justify-between items-start rounded border-l-4 border-red-600 bg-red-100 p-3 text-sm text-red-800 relative" role="alert">
              <div>
                <p className="font-semibold">There was an Error:</p>
                <p className="mt-1">{formik.values.errorMessage}</p>
              </div>
              <button type="button" onClick={() => formik.setFieldValue("errorMessage", "")} className="ml-4 text-red-600 hover:text-red-800 font-bold" aria-label="Close">
                ×
              </button>
            </div>
          )}

          {/* Form Code */}
          <SearchableDropdown<IFormCodeItem>
            disabled={Boolean(cmsFormWidgetConfigurationId)}
            dropdownSelectMessage="Select Form"
            error={formik.touched.formCode && formik.errors.formCode ? formik.errors.formCode : ""}
            fetchItems={handleFetchFormItems}
            getItemKey={(item) => String(item.formCodeId)}
            getItemValue={(item) => item.formCode}
            initialItems={formState.items}
            initialLoading={formState.loading}
            initialPagination={formState.pagination}
            key="FormCode"
            label="Select Form"
            onSelect={handleFormSelect}
            renderItems={(item) => <span>{item.formName}</span>}
            searchInputPlaceholder="Search Form"
            selected={formik.values.formCodeId && formik.values.formCode ? formik.values.formCode : ""}
          />

          {/* Form Name */}
          <FormTextField
            error={formik.touched.formName ? formik.errors.formName : undefined}
            hasRequired={true}
            label="Form Name"
            name="formName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter Form Name"
            type="text"
            value={formik.values.formName}
          />

          {/* Action on Submission */}
          <div>
            <HelpLabel labelTitle="Action on Form Submission" helpDescription="Select the action to perform after the form is submitted." />
            <div className="flex items-center gap-4">
              {["textMessage", "redirect"].map((action) => (
                <label key={action} className="flex items-center gap-2">
                  <input type="radio" value={action} name="submissionAction" checked={formik.values.submissionAction === action} onChange={formik.handleChange} />
                  {action === "textMessage" ? "Text Message" : "Redirect URL"}
                </label>
              ))}
            </div>
          </div>

          {/* Text Message */}
          {formik.values.submissionAction === "textMessage" && (
            <FormTextField
              error={formik.touched.textMessage ? formik.errors.textMessage : undefined}
              helpDescription="Use this message to thank customers after they submit the form."
              label="Text Message"
              name="textMessage"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              placeholder="Enter Text Message"
              type="text"
              value={formik.values.textMessage}
            />
          )}

          {/* Redirect URL */}
          {formik.values.submissionAction === "redirect" && (
            <FormTextField
              error={formik.touched.redirectUrl ? formik.errors.redirectUrl : undefined}
              helpDescription="Enter a fully qualified URL (e.g., http(s)://mysite.com)."
              label="Redirect URL"
              name="redirectUrl"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              placeholder="Enter Redirect URL"
              type="text"
              value={formik.values.redirectUrl}
            />
          )}

          {/* Submit Button Text */}
          <FormTextField
            helpDescription="Text displayed on the form's submit button (e.g., 'Submit', 'Send', 'Register')."
            label="Submit Button Text"
            name="submitButtonText"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter Submit Button Text"
            type="text"
            value={formik.values.submitButtonText}
          />

          {/* Notification Email */}
          <FormTextField
            error={formik.touched.notificationUserName ? formik.errors.notificationUserName : undefined}
            helpDescription="Enter the comma-separated email addresses of internal users to be notified after the form is submitted."
            label="Notification Email Address"
            name="notificationUserName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter Notification Email Address"
            type="email"
            value={formik.values.notificationUserName}
          />

          {/* Email Notification Template */}
          <SearchableDropdown<IEmailTemplateItem>
            disabled={false}
            dropdownSelectMessage="Select Email Notification Template"
            fetchItems={handleFetchEmailItems}
            getItemKey={(item) => String(item.emailTemplateId)}
            getItemValue={handleEmailItemValue}
            helpDescription="This email is sent to the internal users listed above. Leave blank if no email should be sent."
            initialItems={emailState.items}
            initialLoading={emailState.loading}
            initialPagination={emailState.pagination}
            key="notificationEmailTemplateName"
            label="Email Notification Template"
            onSelect={(item) => handleEmailSelect(item, "notificationEmailTemplateName")}
            renderItems={(item) => <span>{item.templateName}</span>}
            searchInputPlaceholder="Search Email Template"
            selected={formik.values.notificationEmailTemplateName}
          />

          {/* Acknowledgement Notification Template */}
          <SearchableDropdown<IEmailTemplateItem>
            dropdownSelectMessage="Select Acknowledgement Email Template"
            fetchItems={handleFetchEmailItems}
            getItemKey={(item) => String(item.emailTemplateId)}
            getItemValue={handleEmailItemValue}
            helpDescription="This email is sent to customers after they submit a form. Leave blank if you do not wish to send an email."
            initialItems={emailState.items}
            initialLoading={emailState.loading}
            initialPagination={emailState.pagination}
            key="acknowledgementEmailTemplateName"
            label="Acknowledgement Email Template"
            onSelect={(item) => handleEmailSelect(item, "acknowledgementEmailTemplateName")}
            renderItems={(item) => <span>{item.templateName}</span>}
            searchInputPlaceholder="Search Email Template"
            selected={formik.values.acknowledgementEmailTemplateName}
          />
        </div>
      </div>
    </>
  );
}
