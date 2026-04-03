import { ZIP_CODE_REGEX } from "@znode/constants/regex";

type CountryCode = "US" | "IN" | "CA" | "GB" | "COMMON";

function getFormattedCountryCode(inputCountryCode: string): CountryCode {
  return (inputCountryCode as CountryCode) ?? "US";
}

function getZipCodeRegexp(countryCode: CountryCode): RegExp | undefined {
  return ZIP_CODE_REGEX[countryCode] || ZIP_CODE_REGEX["COMMON"];
}

function testZipCode(zipCode: string, regexp: RegExp): boolean {
  return regexp.test(zipCode);
}

// Main function for validating the zip code
export function isValidZipCode(zipCode: string, inputCountryCode: string): boolean {
  const countryCode = getFormattedCountryCode(inputCountryCode);
  const zipCodeRegexp = getZipCodeRegexp(countryCode);

  if (!zipCodeRegexp) {
    return false;
  }

  return testZipCode(zipCode, zipCodeRegexp);
}
