// ***Znode Widgets
import {
  AdSpaceConfig,
  BannerSliderConfig,
  CategoriesCarouselConfig,
  FormWidgetConfig,
  HomePagePromoConfig,
  ImageConfig,
  LinkPanelConfig,
  NewsLetterConfig,
  OfferBannerConfig,
  ProductsCarouselConfig,
  BrandsCarouselConfig,
  VideoConfig,
} from "../widgets/znode-widgets";
// ***UI Widgets
import { ButtonGroupConfig, ColumnConfig, DynamicWidgetConfig, FlexConfig, HeadingConfig, TextConfig, TextImageConfig, VerticalSpaceConfig, RichTextWidgetConfig } from "../widgets/ui-widgets";
import type { IComponentCategories, IComponentPropsWithoutPages, IRootProps } from "../../../types/page-builder";

import { type Config } from "@measured/puck";

export type IBaseComponentsConfig = Config<IComponentPropsWithoutPages, IRootProps, IComponentCategories>;

export const baseComponentsConfig: IBaseComponentsConfig = {
  components: {
    // UI Widgets
    VerticalSpacing: VerticalSpaceConfig,
    Column: ColumnConfig,
    Container: FlexConfig,
    Text: TextConfig,
    // Card: CardConfig,
    // Hero: HeroConfig,
    // Logo: LogoConfig,
    Heading: HeadingConfig,
    ButtonGroup: ButtonGroupConfig,
    TextImage: TextImageConfig,
    DynamicWidget: DynamicWidgetConfig,
    RichTextWidget: RichTextWidgetConfig,
    // Znode Widgets
    BannerSlider: BannerSliderConfig,
    CategoriesCarousel: CategoriesCarouselConfig,
    OfferBanner: OfferBannerConfig,
    ProductsCarousel: ProductsCarouselConfig,
    BrandsCarousel:BrandsCarouselConfig,
    AdSpace: AdSpaceConfig,
    HomePagePromo: HomePagePromoConfig,
    Image: ImageConfig,
    Video: VideoConfig,
    // TextEditor: TextEditorConfig,
    NewsLetter: NewsLetterConfig,
    LinkPanel: LinkPanelConfig,
    FormWidget: FormWidgetConfig
  },
  categories: {
    layoutWidgets: {
      components: ["Container", "Column", "VerticalSpacing"],
      title: "Layout",
    },
    uiWidgets: {
      components: ["Text", "Heading", "ButtonGroup", "TextImage", "DynamicWidget", "RichTextWidget"],
      title: "UI Widgets",
    },
    znodeWidgets: {
      components: ["BannerSlider", "CategoriesCarousel", "OfferBanner", "ProductsCarousel", "BrandsCarousel","AdSpace", "HomePagePromo", "Image", "Video", "NewsLetter", "LinkPanel", "FormWidget"],
      title: "Znode Widgets",
    },
  },
};
