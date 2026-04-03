export const ATTRIBUTE_TYPE_NAME = {
  DATE: "Date",
  FILE: "File",
  IMAGE: "Image",
  NUMBER: "Number",
  TEXT: "Text",
  TEXT_AREA: "Text Area",
  MULTI_SELECT: "Multi Select",
  SIMPLE_SELECT: "Simple Select",
  YES_NO: "Yes/No",
};

export const VALIDATION_NAMES = {
  MIN_DATE: "MinDate",
  MAX_DATE: "MaxDate",
  MAX_FILE_SIZE: "MaxFileSize",
  EXTENSIONS: "Extensions",
  IS_ALLOW_MULTI_UPLOAD: "IsAllowMultiUpload",
  ALLOW_NEGATIVE: "AllowNegative",
  ALLOW_DECIMALS: "AllowDecimals",
  MIN_NUMBER: "MinNumber",
  MAX_NUMBER: "MaxNumber",
  MAX_CHARACTERS: "MaxCharacters",
  VALIDATION_RULE: "ValidationRule",
  REGULAR_EXPRESSION: "RegularExpression",
  WYSIWYG_ENABLED_PROPERTY: "WYSIWYGEnabledProperty",
  UNIQUE_VALUE: "UniqueValue",
};


export const FORM_MESSAGES = {
  REQUIRED: (label: string) => `${label} field is required.`,
  MAX_CHARACTERS: (label: string, limit: string) => `${label} exceed max limit of ${limit} characters.`,
  RANGE_NUMBER: (label: string, min: number, max: number) => `${label} must be within a range of ${min} - ${max}.`,
  MIN_NUMBER: (label: string, limit: number) => `${label} must be at least ${limit}.`,
  MAX_NUMBER: (label: string, limit: number) => `${label} must be at most ${limit}.`,
  MUST_BE_INTEGER: (label: string) => `Only Non-Decimal numbers are allowed in the ${label} field.`,
  CANNOT_BE_NEGATIVE: (label: string) => `Only Positive decimal numbers are allowed in the ${label} field(Ex. 1.123456).`,
  INVALID_FORMAT: (label: string) => `Only alphanumeric are allowed in ${label}.`,
  INVALID_PATTERN: (label: string, _pattern: string) => `${label} is not according to pattern.`,
  INVALID_EMAIL: (label: string) => `${label} field having incorrect Email.`,
  INVALID_URL: (label: string) => `${label} field having incorrect URL.`,
  FILE_TOO_LARGE: (sizeMB: number) => `File Size is too large. Maximum file size permitted is ${sizeMB} MB.`,
  DATE_TOO_EARLY: (label: string, date: string) => `${label} cannot be before ${date}.`,
  DATE_TOO_LATE: (label: string, date: string) => `${label} cannot be after ${date}.`,
};
