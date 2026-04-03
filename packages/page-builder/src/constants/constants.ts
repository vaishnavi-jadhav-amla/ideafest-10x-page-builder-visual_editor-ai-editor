export const baseUrlOfWidgets = {
  products: "/api/products",
  categories: "/api/categories",
  bannerSlider: "/api/banner-slider",
  offerBanner: "/api/offer-banner",
  brands: "/api/brands",
  categoryProductList: "api/category-product-list",
  linkPanel: "/api/link-panel",
  media: "/api/media",
  textEdit: "/api/text-editor",
  contentContainer: "/api/content-container",
};

export const API_DOMAIN = "api-qa-znode.amla.io";

export const WIDGET_CONFIGURATION_MESSAGES = {
  SETTINGS_CONFIGURATION_REQUIRED: "This widget has no content. Configure this widget by selecting the settings icon in the toolbar.",
  HOME_PAGE_CONFIGURATION_REQUIRED: "Please configure the Homepage Promo in Znode to ensure it is visible in the page builder.",
  HOME_PAGE_TICKER_CONFIGURATION_REQUIRED: "Please configure the Homepage Ticker in Znode to ensure it is visible in the page builder.",
  ADSPACE_PAGE_CONFIGURATION_REQUIRED: "Please configure the Ad Space in Znode to ensure it is visible in the page builder.",
  IMAGE_CONFIGURATION_REQUIRED: "No image has been added to this widget yet. Please use the 'Select Image' attribute to upload an image",
  VIDEO_CONFIGURATION_REQUIRED: "No Video has been added to this widget yet. Please use the 'Select Video' attribute to upload a Video.",
  TEXT_CONFIGURATION_REQUIRED: "This widget has no content. Enter HTML, CSS, JavaScript, or text.",
  LINK_PANEL_CONFIGURATION_REQUIRED: "This widget has no content. Configure this widget by selecting the settings icon in the toolbar.",
  RICH_TEXT_CONFIGURATION_REQUIRED: "This widget has no content. Click on gear/settings icon to open the Rich Text Widget by clicking the settings icon in the toolbar.",
  BANNER_SLIDER_CONFIGURATION_REQUIRED: "The Banner Slider widget has no content. You can configure it by selecting the settings icon in the toolbar.",
  OFFER_BANNER_CONFIGURATION_REQUIRED: "The Offer Banner widget has no content. You can configure it by selecting the settings icon in the toolbar.",
  PRODUCT_CAROUSEL_CONFIGURATION_REQUIRED: "The Product Carousel widget has no content. You can configure it by selecting the settings icon in the toolbar.",
  CATEGORIES_CAROUSEL_CONFIGURATION_REQUIRED: "The Categories Carousel widget has no content. You can configure it by selecting the settings icon in the toolbar.",
  DYNAMIC_WIDGET_EMPTY_MESSAGE:
    "The Dynamic Widget is currently empty. Please click on the gear icon or the “Open Dynamic Widget” button from the attribute panel to add the relevant HTML, CSS, or JavaScript code.",
  UNSAVED_CHANGES_WARNING: "You forgot to save your changes. If you leave now, they will be lost forever.",
};

export const CACHE_KEY_SHORTCODES = new Map([
  ["ProductDetailsPage", "PDP"],
  ["ProductListPage", "PLP"],
  ["Production", "PR"],
  ["Draft", "DR"],
  ["Preview", "PRW"],
]);

export const ENABLE_GRANULAR_WIDGET_CACHING = false;

export const PAGE_CONSTANTS = {
  URLS: {
    HEADER: "header",
    FOOTER: "footer",
    CART: "cart",
    CHECKOUT: "checkout",
  },
  PAGE_CODES: {
    HEADER: "Header",
    FOOTER: "Footer",
    HOME: "home",
    CATEGORY: "category",
    LAYOUT: "layout",
    PRODUCT: "product",
    CONTENT: "content",
    MAINTENANCE: "maintenance",
    CART: "cart",
    CHECKOUT: "checkout",
  },
  GENERAL: {
    ALL: "All",
    MAIN_CONTENT: "MainContent",
    LAYOUT: "Layout",
    EMPTYBOX: "EmptyBox",
    FLEX: "Flex",
    COLUMN: "Column",
    PAGE: "Page",
    WIDGET: "Widget",
  },
  WIDGETS: {
    LINKPANEL: "LinkPanel",
  },
  ARRAYS: {
    HEADER_FOOTER_PAGE_CODE: ["Header", "Footer"],
    HEADER_FOOTER_PAGE_URL: ["header", "footer"],
  },
  JSON: {
    EMPTYBOX_CONTENT: [
      {
        type: "EmptyBox",
        props: {
          id: "EmptyBox-949b1fd3-1a83-456b-a7e0-541b3af52ddf",
        },
      },
    ],
  },
  EXCLUDE_DEFAULT_WIDGET_KEYS: [
	    "555",  // BANNER_SLIDER
	    "110",  // OFFER_BANNER
	    "999",  // BRANDS_CAROUSEL
	    "1992", // CATEGORIES_CAROUSEL
	    "666",  // PRODUCTS_CAROUSEL
	  ]
};

// This should be updated whenever any change in configuration which requires migration.
export const CURRENT_JSON_VERSION = 2;
