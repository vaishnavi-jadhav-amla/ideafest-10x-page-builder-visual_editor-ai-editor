import { IPageConfig, IPageConfigMap } from "../../../types/page-builder";
import { FooterConfig, HeaderConfig } from "../../base-config/widgets/ui-widgets";
import { ProductDetailsPageConfig } from "../../base-config/widgets/page-widgets/product/product-details-page/ProductDetailsPageConfig";
import { ProductListPageConfig } from "../../base-config/widgets/page-widgets/product/product-list-page/ProductListPageConfig";
import { getLinkPanelConfig, getTickerConfig } from "../../base-config/widgets/znode-widgets";

export const pageConfigMap: IPageConfigMap = new Map<string, IPageConfig>([
  [
    "category",
    {
      components: { ProductListPage: ProductListPageConfig },
      removeComponentKeys: [],
    },
  ],
  [
    "product",
    {
      components: { ProductDetailsPage: ProductDetailsPageConfig },
      removeComponentKeys: [],
    },
  ],
  [
    "header",
    {
      components: {
        Header: HeaderConfig,
        Ticker: getTickerConfig({
          insert: true,
          drag: true,
        }),
        LinkPanel: getLinkPanelConfig({
          delete: false,
          drag: false,
          duplicate: false,
          insert: false,
        }),
      },
      addComponentToCategories: [
        {
          categoryKey: "znodeWidgets",
          componentKeys: ["Ticker"],
        },
      ],
      removeComponentKeys: [
        {
          categoryKey: "others",
          componentKeys: ["Footer"],
        },
        {
          categoryKey: "znodeWidgets",
          componentKeys: ["BannerSlider", "CategoriesCarousel", "OfferBanner", "ProductsCarousel","BrandsCarousel", "AdSpace", "HomePagePromo", "Image", "Video", "NewsLetter"],
        },
        {
          categoryKey: "uiWidgets",
          componentKeys: ["Text", "Heading", "ButtonGroup", "TextImage", "DynamicWidget"],
        },
        {
          categoryKey: "layoutWidgets",
          componentKeys: ["Flex", "Column", "VerticalSpacing"],
        },
      ],
      disabled: true,
    },
  ],
  [
    "footer",
    {
      components: { Footer: FooterConfig },
      removeComponentKeys: [
        {
          categoryKey: "others",
          componentKeys: ["Header"],
        },
        {
          categoryKey: "znodeWidgets",
          componentKeys: ["BannerSlider", "CategoriesCarousel", "OfferBanner", "ProductsCarousel","BrandsCarousel", "AdSpace", "HomePagePromo", "NewsLetter", "Ticker"],
        },
        {
          categoryKey: "uiWidgets",
          componentKeys: ["ButtonGroup", "TextImage", "DynamicWidget"],
        },
      ],
      disabled: true,
    },
  ],
  // Add more entries as needed
]);
