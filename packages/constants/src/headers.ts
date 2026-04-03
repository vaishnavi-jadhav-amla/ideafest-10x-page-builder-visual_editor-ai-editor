export const HEADERS = {
  ZNODE_ACCOUNT_ID: "Znode-AccountId",
  ZNODE_USER_ID: "Znode-UserId",
  ZNODE_PROFILE_ID: "Znode-ProfileId",
  ACCEPT: "Accept",
  CONTENT_TYPE: "Content-Type",
  APPLICATION_JSON: "application/json-patch+json",
  TEXT_PLAIN: "text/plain",
  AUTHORIZATION: "Authorization",
  CACHE_CONTROL: "Cache-Control",
  NO_STORE: "no-store",
  ZNODE_PRIVATE_KEY: "Znode-PrivateKey",
  PUBLISH_STATE: "Znode-PublishState",
  STORE_CODE: "Znode-PortalCode",
  LOCALE_CODE: "Znode-LocaleCode",
  DOMAIN_NAME: "Znode-DomainName",
  ZNODE_LOCALE_ID: "Znode-Locale",
  CLIENT_SECRET: "ClientSecret",
  ZNODE_DEBUG_TOKEN: "Znode-Debug-Token",

  CONTENT_SECURITY_POLICY: `
    script-src blob: 'self' https://api.ipify.org *.hsforms.net *.hsforms.com
      https://znode10stage.azureedge.net
      https://storageamla.blob.core.windows.net
      https://*.spreedly.com
      https://*.amazon.com
      https://www.gstatic.com
      www.googletagmanager.com
      https://znode10x.azureedge.net/
      https://*.google.com/
      https://*.amla.io/
      *.google-analytics.com
      *.osano.com
      *.jsdelivr.net
      *.authorize.net
      *.cybersource.com
      *.braintreegateway.com
      *.googleapis.com
      'unsafe-inline' 'unsafe-eval';
    connect-src 'self'
      *.hsforms.net
      *.hsforms.com
      https://*.amazon.com/
      https://www.google.com
      https://*.google.com
      https://static-na.payments-amazon.com/
      https://www.google-analytics.com/
      https://*.api.osano.com/
      https://znode10x.azureedge.net/
      https://*.amla.io/
      *.braintreegateway.com
      *.braintree-api.com
      *.googleapis.com
      https://api.ipify.org
      'unsafe-inline' 'unsafe-eval';
    frame-ancestors 'self'
      https://portal.tradecentric.com
      https://*.amla.io
      https://*.authorize.net
      https://*.amazon.com
      http://localhost:3000
      http://localhost:3001
      https://*.spreedly.com
      https://*.paypal.com
      https://js-agent.newrelic.com
      https://*.paypal.cn
      https://*.paypalobjects.com
      https://*.synchronycredit.com
      https://www.googleadservices.com
      https://*.payments-amazon.com;
  `.replace(/\s{2,}/g, " "),
};
