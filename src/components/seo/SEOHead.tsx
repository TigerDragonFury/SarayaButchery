import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOHeadProps {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  schema?: object | object[];
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

const SEOHead = ({
  title,
  titleEn,
  description,
  descriptionEn,
  keywords,
  canonical,
  ogImage = "https://alsarayabutcheryllc.com/og-image.jpg",
  ogType = "website",
  schema,
  noindex = false,
  breadcrumbs,
}: SEOHeadProps) => {
  const fullTitle = `${title} | ملحمة السرايا`;
  const fullTitleEn = titleEn ? `${titleEn} | Al Saraya Butchery` : fullTitle;
  const baseUrl = "https://alsarayabutcheryllc.com";
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;
  
  // Combine Arabic and English descriptions for better SEO
  const combinedDescription = descriptionEn 
    ? `${description} | ${descriptionEn}` 
    : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={combinedDescription.slice(0, 160)} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="author" content="Al Saraya Butchery LLC" />
      
      {/* Geo Targeting - UAE / Abu Dhabi */}
      <meta name="geo.region" content="AE-AZ" />
      <meta name="geo.placename" content="Abu Dhabi, United Arab Emirates" />
      <meta name="geo.position" content="24.4574;54.3364" />
      <meta name="ICBM" content="24.4574, 54.3364" />
      <meta name="content-language" content="ar-AE, en-AE" />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language alternates - UAE specific */}
      <link rel="alternate" hrefLang="ar-AE" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-AE" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitleEn} />
      <meta property="og:description" content={(descriptionEn || description).slice(0, 160)} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={titleEn || title} />
      <meta property="og:site_name" content="Al Saraya Butchery | ملحمة السرايا" />
      <meta property="og:locale" content="ar_AE" />
      <meta property="og:locale:alternate" content="en_AE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitleEn} />
      <meta name="twitter:description" content={(descriptionEn || description).slice(0, 160)} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={titleEn || title} />

      {/* Schema Markup */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.name,
              "item": item.url.startsWith("http") ? item.url : `https://alsarayabutcheryllc.com${item.url}`
            }))
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
