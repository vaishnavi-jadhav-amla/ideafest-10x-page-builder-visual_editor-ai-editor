
import type { IPageConfig } from "../../../types/page-builder";

const componentMap: Record<
  string,
  () => Promise<IPageConfig>
> = {
  category: async () => ({
    components: {
      ProductListPage: (await import("../widgets/page-widgets/product/product-list-page/ProductListPageConfig")).ProductListPageConfig,
    },
    removeComponentKeys: [],
  }),
  product: async () => ({
    components: {
      ProductDetailsPage: (await import("../widgets/page-widgets/product/product-details-page/ProductDetailsPageConfig")).ProductDetailsPageConfig,
    },
    removeComponentKeys: [],
  }),
  content: async () => ({
    components: {
      ContentPage: (await import("../widgets/page-widgets/content/content-page/ContentPageConfig")).ContentPageConfig,
    },
    removeComponentKeys: [],
  }),
  "blog-list": async () => ({
    components: {
      BlogPage: (await import("../widgets/page-widgets/blog/blog-page/BlogPageConfig")).BlogPageConfig,
    },
    removeComponentKeys: [],
  }),
  "blog-details": async () => ({
    components: {
      BlogDetailsPage: (await import("../widgets/page-widgets/blog/blog-details-page/BlogDetailsPageConfig")).BlogDetailsPageConfig,
    },
    removeComponentKeys: [],
  }),
  "brand-list": async () => ({
    components: {
      BrandsPage: (await import("../widgets/page-widgets/brand/brands-page/BrandsPageConfig")).BrandsPageConfig,
    },
    removeComponentKeys: [],
  }),
  "brand-details": async () => ({
    components: {
      BrandDetailsPage: (await import("../widgets/page-widgets/brand/brand-details-page/BrandDetailsPageConfig")).BrandDetailsPageConfig,
    },
    removeComponentKeys: [],
  }),
  "store-locator": async () => ({
    components: {
      StoreLocatorPage: (await import("../widgets/page-widgets/store-locator/StoreLocatorPageConfig")).StoreLocatorPageConfig,
    },
    removeComponentKeys: [],
  }),
  "contact-us": async () => ({
    components: {
      ContactUsPage: (await import("../widgets/page-widgets/contact-us/ContactUsPageConfig")).ContactUsPageConfig,
    },
    removeComponentKeys: [],
  }),
  "maintenance": async () => ({
    components: {
      MaintenancePage: (await import("../widgets/page-widgets/maintenance/MaintenancePageConfig")).MaintenancePageConfig,
    },
    removeComponentKeys: [],
  }),
  feedback: async () => ({
    components: {
      FeedbackPage: (await import("../widgets/page-widgets/feedback/FeedbackPageConfig")).FeedbackPageConfig,
    },
    removeComponentKeys: [],
  }),
  cart: async () => ({
    components: {
      CartPage: (await import("../widgets/page-widgets/cart/CartPageConfig")).CartPageConfig,
    },
    removeComponentKeys: [],
  }),
  checkout: async () => ({
    components: {
      CheckoutPage: (await import("../widgets/page-widgets/checkout/CheckoutPageConfig")).CheckoutPageConfig,
    },
    removeComponentKeys: [],
  }),
};

const getPageConfig = async (pageType: string): Promise<IPageConfig | null> => {
  const loader = componentMap[pageType];
  return loader ? loader() : null;
};

export const retrieveData = async (pageType: string) => {
  return await getPageConfig(pageType);
};
