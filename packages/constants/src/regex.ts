/** As per the country selection, the Zip Code should follow the respective regex pattern */
export const ZIP_CODE_REGEX = {
  US: /^[0-9]{5}(?:-[0-9]{4})?$/,
  IN: /^[1-9][0-9]{5}$/,
  CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
  GB: /^[A-Za-z]{1,2}\d{1,2}[A-Za-z]? \d[A-Za-z]{2}$/,
  COMMON: /^([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d|\d{5,6}|[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2})$/,
};
export const INPUT_REGEX = {
  EMAIL_REGEX: /^[a-zA-Z0-9]{1,100}(?:[._+%-][a-zA-Z0-9]{1,100})*@(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/,
  PASSWORD_REGEX: /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":|<>_])[A-Za-z0-9!@#$%^&*(),.?":|<>_]{8,}$/,
  ALPHA_NUMERIC_CHARACTER_REGEX: /^[a-zA-Z0-9']*$/,
  ONLY_NUMBER_ALLOWED_REGEX: /^[0-9]+$/,
  PHONE_NUMBER_REGEX: /^[0-9]*$/,
  ALPHA_NUMERIC_SPACE_CHARACTER_REGEX: /^[a-zA-Z0-9']+( [a-zA-Z0-9']+)*$/,
  NO_NUMERIC_ALLOWED_REGEX: /^[^\d]*$/,
  ORDER_NUMBER_REGEX: /^\s*(?!-)[A-Za-z0-9]+(?:[-\s][A-Za-z0-9]+)*(?!-)\s*$/,
  EMAIL_REGEX_V2: /^\s*([a-zA-Z0-9]{1,100}(?:[._+%-][a-zA-Z0-9]{1,100})*)@(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}\s*$/,
  ONLY_NUMBER_DECIMAL_REGEX: /^\d+(\.\d*)?$/,
};

export const SNAKE_CASE_PATTERN_REGEX = {
  SNAKE_CASE_REGEX: /_([a-z])/g,
};

export const ACCOUNT_NAVIGATION_REGEX = {
  ACCOUNT_MENU_REGEX: /^\/[a-z]{2}-[A-Z]{2}/,
};

export const SPACE_REMOVAL_REGEX = {
  SPACING_AFTER_COMMAS_REGEX: /\s*,\s*/g,
};

export const IMAGE_REGEX = {
  IMAGE_SRC_REGEX: /^(https?:\/\/|\/|data:image\/)/i,
};

export const USER_REGEX = {
  USER_NOT_EXIST_REGEX: /user\s+".*"\s+does not exist/i,
};

export const VIDEO_ID_REGEX = {
  YOUTUBE: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^"&?/ ]{11})/,
  DAILYMOTION: /(?:video|dai\.ly)\/([^/?]+)/,
  VIMEO: /vimeo\.com\/(\d+)/,
  GOOGLE_DRIVE: /\/file\/d\/([^/]+)/,
};