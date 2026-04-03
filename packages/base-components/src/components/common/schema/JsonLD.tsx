
export const JsonLd = ({ jsonLdData }: { jsonLdData: object }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />;
