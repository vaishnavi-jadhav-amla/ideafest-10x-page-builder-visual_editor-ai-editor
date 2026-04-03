/**
 * Widget catalog — human-readable descriptions of all available Puck widgets.
 * Used as context for vision AI to map visual elements in uploaded images to the correct widget types.
 *
 * Default props are sourced from the real Config files under
 * packages/page-builder/src/configs/base-config/widgets/
 */

export interface WidgetCatalogEntry {
  componentType: string;
  category: "ui" | "znode";
  description: string;
  /** When true, the widget needs follow-up CMS configuration (picker flow). The widget is still placed in data with default config. */
  requiresCmsPicker: boolean;
  /** Hint for the AI about when to choose this widget. */
  visualHint: string;
  defaultProps: Record<string, unknown>;
}

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  UI Widgets (15)
  // ═══════════════════════════════════════════════════════════════════
  {
    componentType: "Heading",
    category: "ui",
    description:
      "A heading/title element (h1–h6) with configurable size, alignment, color, background, and border.",
    requiresCmsPicker: false,
    visualHint:
      "Use for large prominent text that serves as a section title, page title, or heading.",
    defaultProps: {
      align: "left",
      text: "Heading",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
      size: "default",
      background: "transparent",
      textColor: "black",
      level: "2",
    },
  },
  {
    componentType: "Text",
    category: "ui",
    description:
      "A paragraph/body text block with configurable alignment, size (s/m), weight, color, and padding.",
    requiresCmsPicker: false,
    visualHint:
      "Use for body text, descriptions, paragraphs, or any regular-sized text that is not a heading.",
    defaultProps: {
      align: "left",
      text: "Text",
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      size: "s",
      weight: "normal",
      color: "default",
    },
  },
  {
    componentType: "ButtonGroup",
    category: "ui",
    description:
      "A group of styled CTA buttons. Each button has label, href, variant (primary/secondary), and target.",
    requiresCmsPicker: false,
    visualHint:
      "Use when you see buttons, call-to-action elements, 'Shop Now', 'Learn More', or any clickable button-styled elements.",
    defaultProps: {
      buttons: [
        { label: "Learn more", href: "#", variant: "primary", target: "_self" },
      ],
    },
  },
  {
    componentType: "Container",
    category: "ui",
    description:
      "Flexible layout container (Flex). Supports flexDirection (row/column), gap, alignment, max-width, padding, margin, border, and background image. Child widgets go in zone '{id}:Container'.",
    requiresCmsPicker: false,
    visualHint:
      "Use when the image shows a layout section, boxed area, or a group of elements organized in a row or column. Good for wrapping multiple widgets.",
    defaultProps: {
      align: "center",
      block: "box",
      layout: "custom",
      flexProperties: {
        flexDirection: "column",
        rowAlignment: {},
        columnAlignment: {},
        flexWrap: "nowrap",
      },
      rigidView: "no",
      maxWidth: 1200,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      border: {
        width: "0",
        color: "black",
        style: "solid",
        borderRadius: 0,
      },
      height: "auto",
      image: {
        src: "",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
    },
  },
  {
    componentType: "VerticalSpacing",
    category: "ui",
    description: "Empty vertical space/spacer between elements. Size in px (e.g. '24px').",
    requiresCmsPicker: false,
    visualHint:
      "Use when there is visible empty space or a gap between sections in the image.",
    defaultProps: { size: "24px" },
  },
  {
    componentType: "Column",
    category: "ui",
    description:
      "Multi-column grid layout. distribution: 'auto' (equal widths) or 'manual' (custom spans 0-12). Child widgets go in zones '{id}:column-0', '{id}:column-1', etc.",
    requiresCmsPicker: false,
    visualHint:
      "Use when content is arranged in side-by-side columns.",
    defaultProps: {
      distribution: "auto",
      columns: [{}, {}],
      gap: 2,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      hasDropZoneDisabled: false,
    },
  },
  {
    componentType: "TextImage",
    category: "ui",
    description:
      "Combined text and image side-by-side component. Has heading, description, image (with ratio/width/alt), button (label/url/variant), and order (image-first / text-first).",
    requiresCmsPicker: false,
    visualHint:
      "Use when you see text content next to or alongside an image, such as a feature section with image and description.",
    defaultProps: {
      heading: "Image with text",
      description: "",
      padding: "24px",
      margin: "12px",
      order: "image-first",
      image: { ratio: "small", src: "", width: 50, alt: "" },
      button: {
        buttonText: "Button Label",
        url: "",
        variant: "primary",
        target: "_self",
      },
    },
  },
  {
    componentType: "Hero",
    category: "ui",
    description:
      "Hero banner section with title, description, buttons array, optional image (URL + mode: inline/background), and alignment.",
    requiresCmsPicker: false,
    visualHint:
      "Use for a large hero/banner section at the top of a page with a big title, subtitle text, and CTA buttons. May have a background image.",
    defaultProps: {
      title: "Hero",
      align: "left",
      description: "Description",
      buttons: [{ label: "Learn more", href: "#" }],
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
    },
  },
  {
    componentType: "Card",
    category: "ui",
    description:
      "A simple card component with title, description, icon (lucide-react icon name), and mode (flat/card).",
    requiresCmsPicker: false,
    visualHint:
      "Use for feature cards, info cards, or small content blocks with an icon, title and description.",
    defaultProps: {
      title: "Title",
      description: "Description",
      icon: "Feather",
      mode: "flat",
    },
  },
  {
    componentType: "Logo",
    category: "ui",
    description: "Logo display widget with an array of logos (alt + imageUrl).",
    requiresCmsPicker: false,
    visualHint:
      "Use when you see a company logo, partner logos row, or brand identity element.",
    defaultProps: {
      logos: [
        { alt: "Logo", imageUrl: "" },
      ],
    },
  },
  {
    componentType: "RichTextWidget",
    category: "ui",
    description:
      "Rich HTML/formatted text editor content block (Quill-based). Uses HTML string in 'text' prop with Quill CSS classes. Has config with postMessage for editor popup.",
    requiresCmsPicker: false,
    visualHint:
      "Use for complex formatted text with mixed styling, lists, links, or embedded HTML that cannot be represented by a simple Text widget.",
    defaultProps: {
      text: "",
      config: {
        type: "Widget",
        id: "RichTextWidget",
        hasConfigurable: true,
        hasPostMessage: true,
        postMessagePayload: {
          type: "update",
          actionType: "open_popup",
          category: "widget",
          data: { widgetName: "RichTextWidget", text: "" },
        },
      },
    },
  },
  {
    componentType: "DynamicWidget",
    category: "ui",
    description:
      "Custom HTML/CSS block for arbitrary content — horizontal rules (<hr>), styled cards with background images, embedded CTAs, or any freeform HTML. Has config with postMessage for code editor popup.",
    requiresCmsPicker: false,
    visualHint:
      "Use for custom styled sections, horizontal divider lines (<hr>), embedded CTA buttons/images from external systems, or styled cards with background images and overlay text.",
    defaultProps: {
      text: "",
      config: {
        type: "Widget",
        id: "DynamicWidget",
        hasConfigurable: true,
        hasPostMessage: true,
        postMessagePayload: {
          type: "update",
          actionType: "open_popup",
          category: "widget",
          data: { widgetName: "DynamicWidget", text: "" },
        },
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Znode Widgets (12)
  // ═══════════════════════════════════════════════════════════════════
  {
    componentType: "Image",
    category: "znode",
    description:
      "Standalone image component. Props: image (URL), alt, url (link), target, layout (fixed/responsive/fullWidth), width, height, alignment (start/center/end), borderRadius.",
    requiresCmsPicker: false,
    visualHint:
      "Use when the image shows a standalone image/photo/graphic that is not part of a slider or carousel.",
    defaultProps: {
      image: "",
      alt: "",
      url: "",
      layout: "fixed",
      height: 200,
      width: 200,
      alignment: "start",
      borderRadius: "0px",
      target: "_self",
    },
  },
  {
    componentType: "Video",
    category: "znode",
    description:
      "Video player component. Props: video (URL), autoPlay (boolean), controlEnable (boolean).",
    requiresCmsPicker: false,
    visualHint:
      "Use when the image shows a video player, video embed, or video thumbnail with play button.",
    defaultProps: {
      video: "",
      autoPlay: false,
      controlEnable: true,
    },
  },
  {
    componentType: "BannerSlider",
    category: "znode",
    description:
      "Image carousel/slider with auto-play, arrows, thumbnails, and many layout options. Requires choosing a slider from the CMS via picker flow.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a hero banner section, image carousel, slideshow, rotating banners, or any full-width image slider at the top of a page.",
    defaultProps: {
      axis: "horizontal",
      showThumbs: false,
      showArrows: true,
      autoFocus: false,
      infiniteLoop: true,
      interval: 2000,
      selectedItem: 0,
      transitionTime: 2000,
      swipeScrollTolerance: 10,
      showStatus: true,
      showIndicators: true,
      stopOnHover: true,
      swipeable: true,
      useKeyboardArrows: true,
      emulateTouch: true,
      autoPlay: false,
      response: null,
      config: {
        type: "Widget",
        id: "BannerSliderWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey: "555",
          widgetKey: "555",
          widgetCode: "BannerSlider",
          displayName: "Banner Slider",
        },
      },
    },
  },
  {
    componentType: "ProductsCarousel",
    category: "znode",
    description:
      "Product carousel/grid showing products in a swipeable layout. Requires selecting products from the CMS.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a row of product cards, product listing, product carousel, 'Featured Products', or similar e-commerce product displays.",
    defaultProps: {
      spaceBetween: 10,
      slidesPerView: 5,
      hasNavigationEnable: true,
      hasPaginationEnable: true,
      hasGrid: false,
      response: null,
      config: {
        type: "Widget",
        id: "ProductsCarouselWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey: "666",
          widgetKey: "666",
          widgetCode: "ProductList",
          displayName: "Product List",
        },
      },
    },
  },
  {
    componentType: "CategoriesCarousel",
    category: "znode",
    description:
      "Category carousel showing product categories in a scrollable layout.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows category tiles, category cards, or a section for browsing product categories like 'Shop by Category'.",
    defaultProps: {
      spaceBetween: 10,
      slidesPerView: 5,
      hasNavigationEnable: true,
      hasPaginationEnable: true,
      hasGrid: false,
      response: null,
      config: {
        type: "Widget",
        id: "CategoriesWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey: "1992",
          widgetKey: "1992",
          widgetCode: "CategoryList",
          displayName: "category List",
        },
      },
    },
  },
  {
    componentType: "BrandsCarousel",
    category: "znode",
    description: "Brand/vendor logo carousel in a scrollable layout.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows brand logos, vendor logos, or a 'Shop by Brand' section.",
    defaultProps: {
      spaceBetween: 10,
      slidesPerView: 5,
      hasNavigationEnable: true,
      hasPaginationEnable: true,
      hasGrid: false,
      response: null,
      config: {
        type: "Widget",
        id: "BrandsCarouselWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey: "999",
          widgetKey: "999",
          widgetCode: "BrandList",
          displayName: "Brand List",
        },
      },
    },
  },
  {
    componentType: "OfferBanner",
    category: "znode",
    description:
      "Promotional offer/deal banner carousel.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a deals section, discount banner, sale offer area, or promotional offer strip.",
    defaultProps: {
      spaceBetween: 50,
      slidesPerView: 2,
      hasNavigationEnable: true,
      hasPaginationEnable: true,
      hasGrid: false,
      response: null,
      config: {
        type: "Widget",
        id: "OfferBannerWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey: "110",
          widgetKey: "110",
          widgetCode: "OfferBanner",
          displayName: "Offer Banner",
        },
      },
    },
  },
  {
    componentType: "HomePagePromo",
    category: "znode",
    description:
      "Homepage promotional container for marketing content. Requires CMS container setup.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a promotional banner, marketing section, or homepage promotional content area.",
    defaultProps: {
      response: null,
      config: {
        type: "Widget",
        id: "HomePagePromoWidget",
        hasConfigurable: false,
        widgetConfig: {
          masterWidgetKey: "1788",
          widgetKey: "1788",
          widgetCode: "HomePagePromo",
          displayName: "Home Page Promo",
        },
      },
    },
  },
  {
    componentType: "AdSpace",
    category: "znode",
    description: "Advertisement/ad-unit placeholder space.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows an advertisement area, sponsored content section, or ad banner.",
    defaultProps: {
      response: { data: [] },
      config: {
        type: "Widget",
        id: "AdSpaceWidget",
        hasConfigurable: false,
        widgetConfig: {
          masterWidgetKey: "1787",
          widgetKey: "1787",
          widgetCode: "AdSpace",
          displayName: "AdSpace",
        },
      },
    },
  },
  {
    componentType: "LinkPanel",
    category: "znode",
    description:
      "Link panel — horizontal or vertical group of links. Used for brand links, footer link groups, etc.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a row of brand/partner logos as links, a link navigation section, or a panel of clickable items.",
    defaultProps: {
      contentOrientation: "vertical",
      customClass: "",
      response: null,
      config: {
        type: "Widget",
        id: "LinkPanelWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey: "2253",
          widgetKey: "2253",
          typeOfMapping: "PortalMapping",
          widgetCode: "LinkPanel",
          displayName: "Link Panel",
        },
      },
    },
  },
  {
    componentType: "NewsLetter",
    category: "znode",
    description:
      "Newsletter subscription form with label, placeholder, and button text.",
    requiresCmsPicker: false,
    visualHint:
      "Use when the image shows a newsletter signup form, email subscription area, or 'Stay Updated' section.",
    defaultProps: {
      label: "SIGN UP FOR EMAIL",
      placeholder: "Your Email Address",
      buttonText: "Join",
    },
  },
  {
    componentType: "FormWidget",
    category: "znode",
    description:
      "Generic CMS form widget (contact forms, inquiry forms). Requires form code selection.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a form with input fields, a contact form, or a submission form.",
    defaultProps: {
      formCode: "",
      config: {
        type: "Widget",
        id: "FormWidget",
        hasConfigurable: true,
        hasPostMessage: true,
        postMessagePayload: {
          type: "update",
          actionType: "open_popup",
          category: "widget",
          data: {
            formCodeId: "",
            formCode: "",
            widgetCode: "FormWidget",
            widgetKey: "",
            cmsFormWidgetConfigurationId: "",
          },
        },
        widgetConfig: {},
      },
    },
  },
  {
    componentType: "Ticker",
    category: "znode",
    description:
      "Scrolling ticker/marquee widget for announcements or promotions.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a scrolling announcement bar, ticker tape, or marquee text strip.",
    defaultProps: {
      response: null,
      config: {
        type: "Widget",
        id: "TickerWidget",
        hasConfigurable: false,
        widgetConfig: {
          masterWidgetKey: "1786",
          widgetKey: "1786",
          typeOfMapping: "PortalMapping",
          widgetCode: "HomePageTicker",
          displayName: "Home Page Ticker",
        },
      },
    },
  },
  {
    componentType: "TextEditor",
    category: "znode",
    description:
      "CMS-managed text editor content block. Content is fetched from the CMS by widget key.",
    requiresCmsPicker: true,
    visualHint:
      "Use when the image shows a block of CMS-managed rich content that should be editable via the CMS admin.",
    defaultProps: {
      response: null,
      config: {
        type: "Widget",
        id: "TextEditorWidget",
        hasConfigurable: false,
        widgetConfig: {
          widgetKey: "565767",
          typeOfMapping: "PortalMapping",
          widgetCode: "TextEditor",
          displayName: "Text Editor",
        },
      },
    },
  },
];

/**
 * Build the widget catalog text for the vision AI system prompt.
 * Groups widgets by category and includes visual hints for accurate mapping.
 */
export function buildWidgetCatalogPrompt(): string {
  const lines: string[] = [
    "AVAILABLE WIDGETS (Puck componentType → description):",
    "",
    "== UI Widgets (can be created directly with props) ==",
  ];

  for (const w of WIDGET_CATALOG.filter((w) => w.category === "ui")) {
    lines.push(
      `- **${w.componentType}**: ${w.description}`,
      `  Visual hint: ${w.visualHint}`,
      ""
    );
  }

  lines.push("== Znode CMS Widgets ==");
  for (const w of WIDGET_CATALOG.filter((w) => w.category === "znode")) {
    const pickerNote = w.requiresCmsPicker
      ? " [CMS WIDGET — add to data with default config AND include in cmsWidgetSuggestions for follow-up configuration]"
      : "";
    lines.push(
      `- **${w.componentType}**: ${w.description}${pickerNote}`,
      `  Visual hint: ${w.visualHint}`,
      ""
    );
  }

  return lines.join("\n");
}
