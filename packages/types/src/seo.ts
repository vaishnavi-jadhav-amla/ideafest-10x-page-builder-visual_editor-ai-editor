export interface ISeo {
  robots: string;
  keywords: string;
  description: string;
  title: string;
}

export interface ISeoDetails {
  name: string;
  seoId: number;
  seoUrl?: string;
  seoCode: string;
  seoTypeName?: string;
}
