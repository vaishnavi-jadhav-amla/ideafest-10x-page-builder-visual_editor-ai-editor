import type { Config, DefaultRootProps, PuckContext } from "@measured/puck";
// *** Znode Widgets
import type {
  IAdSpaceConfig,
  IBannerSliderConfig,
  IBrandsCarouselConfig,
  ICategoriesCarouselConfig,
  IHomePagePromoConfig,
  IImageConfig,
  ILinkPanelConfig,
  INewsLetterConfig,
  IOfferBannerConfig,
  IProductsCarouselConfig,
  IVideoConfig,
  IFormWidgetConfig,
} from "../configs/base-config/widgets/znode-widgets";
// *** UI Widgets
import type {
  IButtonGroupConfig,
  IColumnConfig,
  IDynamicWidgetConfig,
  IFlexConfig,
  IHeadingConfig,
  IRichTextWidgetConfig,
  ITextConfig,
  ITextImageConfig,
  IVerticalSpaceConfig,
} from "../configs/base-config/widgets/ui-widgets";

import type { IBlogDetailsPageConfig } from "../configs/base-config/widgets/page-widgets/blog/blog-details-page/BlogDetailsPageConfig";
// *** Page Widgets
import type { IBlogPageConfig } from "../configs/base-config/widgets/page-widgets/blog/blog-page/BlogPageConfig";
import type { IBrandDetailsPageConfig } from "../configs/base-config/widgets/page-widgets/brand/brand-details-page/BrandDetailsPageConfig";
import type { IBrandsPageConfig } from "../configs/base-config/widgets/page-widgets/brand/brands-page/BrandsPageConfig";
import { IContactUsPageConfig } from "../configs/base-config/widgets/page-widgets/contact-us/ContactUsPageConfig";
import { IMaintenancePageConfig } from "../configs/base-config/widgets/page-widgets/maintenance/MaintenancePageConfig";
import { IFeedbackPageConfig } from "../configs/base-config/widgets/page-widgets/feedback/FeedbackPageConfig";
import { ICartPageConfig } from "../configs/base-config/widgets/page-widgets/cart/CartPageConfig";
import { ICheckoutPageConfig } from "../configs/base-config/widgets/page-widgets/checkout/CheckoutPageConfig";
import type { IProductDetailsPageConfig } from "../configs/base-config/widgets/page-widgets/product/product-details-page/ProductDetailsPageConfig";
import type { IProductListPageConfig } from "../configs/base-config/widgets/page-widgets/product/product-list-page/ProductListPageConfig";
import { IStoreLocatorPageConfig } from "../configs/base-config/widgets/page-widgets/store-locator/StoreLocatorPageConfig";
import type { IWidget } from "@znode/types/widget";
import type { IWidgetComponentKey } from "@znode/types/page-builder-common";
import type { ReactNode } from "react";

export interface IRenderProps {
  puck: PuckContext;
  id: string;
}

// TODO: change with actual interface type
export interface IComponentProps {
  // UI Widgets
  VerticalSpacing: IVerticalSpaceConfig;
  Column: IColumnConfig;
  Container: IFlexConfig;
  Text: ITextConfig;
  // Card: ICardConfig;
  // Hero: IHeroConfig;
  // Logo: ILogoConfig;
  Heading: IHeadingConfig;
  ButtonGroup: IButtonGroupConfig;
  TextImage: ITextImageConfig;
  DynamicWidget: IDynamicWidgetConfig;
  RichTextWidget: IRichTextWidgetConfig;

  // Pages Widgets
  BlogPage: IBlogPageConfig;
  BlogDetailsPage: IBlogDetailsPageConfig;
  BrandsPage: IBrandsPageConfig;
  BrandDetailsPage: IBrandDetailsPageConfig;
  ProductListPage: IProductListPageConfig;
  ProductDetailsPage: IProductDetailsPageConfig;
  StoreLocatorPage: IStoreLocatorPageConfig;
  ContactUsPage: IContactUsPageConfig;
  MaintenancePage : IMaintenancePageConfig;
  FeedbackPage: IFeedbackPageConfig;
  CartPage: ICartPageConfig;
  CheckoutPage: ICheckoutPageConfig;
  //  Znode Widgets
  BannerSlider: IBannerSliderConfig;
  CategoriesCarousel: ICategoriesCarouselConfig;
  OfferBanner: IOfferBannerConfig;
  ProductsCarousel: IProductsCarouselConfig;
  BrandsCarousel: IBrandsCarouselConfig;
  AdSpace: IAdSpaceConfig;
  HomePagePromo: IHomePagePromoConfig;
  LinkPanel: ILinkPanelConfig;
  Image: IImageConfig;
  Video: IVideoConfig;
  // TextEditor: ITextEditorConfig;
  NewsLetter: INewsLetterConfig;
  FormWidget: IFormWidgetConfig;
}

export interface IRootProps extends DefaultRootProps {
  children: ReactNode;
  title: string;
}

export type IPageEditorConfig = Config<IComponentProps, IRootProps>;

export interface IBaseConfigParams {
  header?: ReactNode;
  footer?: ReactNode;
}

// *** NOte: This required for all Widget ***
export interface IWidgetFieldConfig {
  hasConfigurable: boolean; // Required for widget configurable
  widgetConfig: Omit<IWidget, "localeId" | "portalId" | "widgetCode"> & { widgetComponentKey: IWidgetComponentKey };
}

export interface IPageOrWidgetConfig {
  type: "Page" | "Widget" | "Layout" | "Window";
  id: string;
  hasConfigurable: boolean;
  widgetConfig: any | null;
  postMessagePayload?: Record<string, any>;
  hasPostMessage?: boolean;
}

// export interface {
//   type: "Page" | "Widget";
//   id: string;
//   widgetConfig: any | null;
// }

export type IComponentCategories = "layoutWidgets" | "uiWidgets" | "znodeWidgets";

export type IComponentPropsWithoutPages = Omit<
  IComponentProps,
  "BlogPage" | "BlogDetailsPage" | "BrandsPage" | "BrandDetailsPage" | "ProductListPage" | "ProductDetailsPage" | "StoreLocatorPage" | "ContactUsPage" | "FeedbackPage" | "MaintenancePage" | "CartPage" | "CheckoutPage"
>;

export type IComponentPropsWithoutPagesExceptProductListPage = IComponentPropsWithoutPages & Pick<IComponentProps, "ProductListPage">;

export type IComponentPropsWithoutPagesExceptProductDetailsPage = IComponentPropsWithoutPages & Pick<IComponentProps, "ProductDetailsPage">;

export type IComponentPropsWithoutPagesExceptBlogPage = IComponentPropsWithoutPages & Pick<IComponentProps, "BlogPage">;

export type IComponentPropsWithoutPagesExceptBlogDetailPage = IComponentPropsWithoutPages & Pick<IComponentProps, "BlogDetailsPage">;

export type IComponentPropsWithoutPagesExceptBrandListPage = IComponentPropsWithoutPages & Pick<IComponentProps, "BrandsPage">;

export type IComponentPropsWithoutPagesExceptBrandDetailsPage = IComponentPropsWithoutPages & Pick<IComponentProps, "BrandDetailsPage">;

export type IComponentPropsWithoutPagesExceptStoreLocatorPage = IComponentPropsWithoutPages & Pick<IComponentProps, "StoreLocatorPage">;

export interface IConfigParam {
  theme: string;
  configType: string;
}

export type IPageVariant = "Header" | "Footer" | "MainContent" | "All" | "Layout";

export interface IRemoveComponentKey {
  categoryKey: string;
  componentKeys: string[];
}

export type IRemoveComponentKeys = Array<IRemoveComponentKey>;

export interface IPageConfig {
  components: Record<string, any>;
  removeComponentKeys: Array<{
    categoryKey: string;
    componentKeys: string[];
  }>;
  addComponentToCategories?: Array<{
    categoryKey: string;
    componentKeys: string[];
  }>;
  disabled?: boolean;
}

export type IPageConfigMap = Map<string, IPageConfig>;

export type IPageHandler = (id: string | null, searchParams?: any) => Promise<any>;

export type IWidgetHandler = (params: any) => Promise<any>;
export type ILayoutHandler = (params?: any) => Promise<any>;

export type IPageHandlersMap = Map<string, IPageHandler>;
export type IWidgetHandlersMap = Map<string, IWidgetHandler>;
export type ILayoutHandlersMap = Map<string, ILayoutHandler>;
