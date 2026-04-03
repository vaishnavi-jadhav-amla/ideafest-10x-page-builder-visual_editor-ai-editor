import Authentication from "./MultiFactorAuthentication";

declare global {
  interface Window {
    Authentication: typeof Authentication;
  }
}

window.Authentication = Authentication;
