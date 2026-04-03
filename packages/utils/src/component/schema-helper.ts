import { ISchemaDetails } from "@znode/types/portal";
import { IProductDetails } from "@znode/types/product-details";

export const organizationSchema = (schemaDetails: ISchemaDetails, currentUrl: string | null) => {
  return {
    "@context": "http://schema.org",
    "@type": "Organization",
    "@id": currentUrl,
    name: schemaDetails.storeName,
    url: currentUrl,
    logo: schemaDetails.websiteLogo,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: schemaDetails.customerServicePhoneNumber,
        contactType: "customer service",
        contactOption: "TollFree",
      },
    ],
    sameAs: ["https://www.facebook.com/", "https://www.linkedin.com/", "https://www.instagram.com/", "https://www.pinterest.com/"],
  };
};

export const websiteSchema = (currentUrl: string | null) => {
  return {
    "@context": "http://schema.org",
    "@type": "WebSite",
    url: currentUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${currentUrl}/search?SearchTerm={search_term}`,
      "query-input": "required name=search_term",
    },
  };
};

export const localBusinessSchema = (schemaDetails: ISchemaDetails, currentUrl: string | null) => {
  return {
    "@context": "http://schema.org",
    "@type": "LocalBusiness",
    name: schemaDetails.storeName,
    image: schemaDetails.websiteLogo,
    priceRange: "$",
    telephone: schemaDetails.customerServicePhoneNumber,
    email: schemaDetails.customerServiceEmail,
    url: currentUrl,
    address: {
      "@@context": "http://schema.org/",
      "@type": "PostalAddress",
      streetAddress: "Street One",
      addressLocality: "Example area",
      addressRegion: "OH",
      postalCode: "45828",
    },
  };
};

export const productSchema = (productData: IProductDetails, url: string) => {
  if (!productData) return {};
  const productUrl = productData && productData.seoUrl ? `${url}/${productData.seoUrl}` : productData ? `${url}/product/${productData.publishProductId}` : "";
  return {
    "@context": "http://schema.org/",
    "@type": "Product",
    name: productData.name || "",
    image: productData.imageSmallPath || "",
    url: productUrl || "",
    description: productData.seoDescription || "",
    sku: productData.sku || "",
    brand: {
      "@type": "Thing",
      name: productData.storeName || "",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: productData.currencyCode || "",
      lowprice: productData.retailPrice || productData.salesPrice || 0,
      highprice: productData.retailPrice || productData.salesPrice || 0,
      price: productData.retailPrice || productData.salesPrice || 0,
      itemCondition: "http://schema.org/NewCondition",
      availability: "http://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: productData.storeName || "",
      },
    },
  };
};

export const productListSchema = (productList: IProductDetails[], url: string) => {
  if (!productList || productList.length === 0) {
    return [];
  }

  const itemListElement = productList.map((p, index) => {
    const productUrl = p.seoUrl ? `${url}/${p.seoUrl}` : `${url}/product/${p.znodeProductId}`;
    return {
      "@type": "ListItem",
      url: `${productUrl}`,
      position: index,
      name: p.name ?? "",
    };
  });

  return {
    "@context": "http://schema.org",
    "@type": "ItemList",
    itemListElement: itemListElement,
  };
};
