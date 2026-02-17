// Local Business Schema for Google SEO and "near me" searches
// This schema helps Google understand the business for local search results
// Single source of truth: https://maps.app.goo.gl/9aWnaRme1t6AtXTp6

import { StoreSettings, defaultStoreSettings } from "@/hooks/useStoreSettings";

// Generate dynamic local business schema from store settings
export const generateLocalBusinessSchema = (settings: StoreSettings) => ({
  "@context": "https://schema.org",
  "@type": "ButcherShop",
  "@id": "https://alsarayabutcheryllc.com/#business",
  "name": "Al Saraya Butchery LLC",
  "alternateName": "ملحمة السرايا",
  "description": "Premium halal butchery offering fresh meat, ready-to-grill selections, and catering services across the UAE. أفضل ملحمة حلال في الإمارات - لحوم طازجة وتموين مناسبات.",
  "url": settings.contact.website,
  "telephone": settings.contact.phone_intl,
  "email": settings.contact.email,
  "image": [
    "https://alsarayabutcheryllc.com/logo.jpg",
    "https://alsarayabutcheryllc.com/og-image.jpg"
  ],
  "logo": "https://alsarayabutcheryllc.com/logo.jpg",
  "priceRange": "$$",
  "currenciesAccepted": "AED",
  "paymentAccepted": "Cash, Credit Card, Debit Card",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": `${settings.location.building_en}, ${settings.location.street_en}`,
    "addressLocality": settings.location.city_en,
    "addressRegion": settings.location.city_en,
    "addressCountry": "AE",
    "postalCode": ""
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": settings.location.latitude,
    "longitude": settings.location.longitude
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Abu Dhabi"
    },
    {
      "@type": "City",
      "name": "Dubai"
    },
    {
      "@type": "City",
      "name": "Sharjah"
    },
    {
      "@type": "City",
      "name": "Ajman"
    },
    {
      "@type": "City",
      "name": "Al Ain"
    },
    {
      "@type": "Country",
      "name": "United Arab Emirates"
    }
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
      "opens": settings.hours.opening,
      "closes": settings.hours.closing
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": settings.hours.friday_opening,
      "closes": settings.hours.friday_closing
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Meat Products & Services",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Fresh Meat",
        "itemListElement": [
          {
    "@type": "Product",
            "name": "Lamb Meat - لحم غنم",
            "description": "Fresh halal lamb meat, premium quality cuts including chops, leg, shoulder and ribs from Al Saraya Butchery Abu Dhabi",
            "sku": "SARAYA-LAMB-001",
            "image": "https://alsarayabutcheryllc.com/assets/products/lamb-chops.jpg",
            "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "AED",
              "price": 45,
              "priceValidUntil": "2027-12-31",
              "availability": "https://schema.org/InStock",
              "url": "https://alsarayabutcheryllc.com/products"
            }
          },
          {
            "@type": "Product",
            "name": "Beef Meat - لحم عجل",
            "description": "Fresh halal beef meat, premium quality steaks, mince, and cubes from Al Saraya Butchery Abu Dhabi",
            "sku": "SARAYA-BEEF-001",
            "image": "https://alsarayabutcheryllc.com/assets/products/beef-tenderloin.jpg",
            "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "AED",
              "price": 40,
              "priceValidUntil": "2027-12-31",
              "availability": "https://schema.org/InStock",
              "url": "https://alsarayabutcheryllc.com/products"
            }
          },
          {
            "@type": "Product",
            "name": "Chicken - دجاج",
            "description": "Fresh halal chicken, whole, drumsticks, wings and breast cuts from Al Saraya Butchery Abu Dhabi",
            "sku": "SARAYA-CHICKEN-001",
            "image": "https://alsarayabutcheryllc.com/assets/products/whole-chicken.jpg",
            "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "AED",
              "price": 20,
              "priceValidUntil": "2027-12-31",
              "availability": "https://schema.org/InStock",
              "url": "https://alsarayabutcheryllc.com/products"
            }
          },
          {
            "@type": "Product",
            "name": "Wagyu Beef - لحم واغيو",
            "description": "Premium wagyu beef ribeye and striploin steaks, finest marble score quality from Al Saraya Butchery Abu Dhabi",
            "sku": "SARAYA-WAGYU-001",
            "image": "https://alsarayabutcheryllc.com/assets/products/wagyu-ribeye.png",
            "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "AED",
              "price": 180,
              "priceValidUntil": "2027-12-31",
              "availability": "https://schema.org/InStock",
              "url": "https://alsarayabutcheryllc.com/products"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Ready to Grill",
        "itemListElement": [
          {
    "@type": "Product",
            "name": "Marinated Skewers - مشاكيك متبلة",
            "description": "Ready-to-grill marinated lamb and chicken skewers, seasoned with authentic Middle Eastern spices from Al Saraya Butchery Abu Dhabi",
            "sku": "SARAYA-SKEWERS-001",
            "image": "https://alsarayabutcheryllc.com/assets/products/kabab-skewers.png",
            "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "AED",
              "price": 55,
              "priceValidUntil": "2027-12-31",
              "availability": "https://schema.org/InStock",
              "url": "https://alsarayabutcheryllc.com/products"
            }
          },
          {
            "@type": "Product",
            "name": "BBQ Boxes - بوكسات مشاوي",
            "description": "Complete BBQ box with premium mixed meats, perfect for family gatherings and outdoor grilling in Abu Dhabi UAE",
            "sku": "SARAYA-BBQ-001",
            "image": "https://alsarayabutcheryllc.com/assets/products/meat-box.jpg",
            "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "AED",
              "price": 120,
              "priceValidUntil": "2027-12-31",
              "availability": "https://schema.org/InStock",
              "url": "https://alsarayabutcheryllc.com/products"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Catering Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Event Catering - تموين مناسبات"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Corporate Catering - تموين شركات"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Whole Carcass - ذبائح كاملة"
            }
          }
        ]
      }
    ]
  },
  "sameAs": [
    settings.social.facebook,
    settings.social.instagram,
    settings.social.tiktok
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": settings.contact.phone_intl,
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    },
    {
      "@type": "ContactPoint",
      "telephone": `+${settings.contact.whatsapp}`,
      "contactType": "sales",
      "contactOption": `https://wa.me/${settings.contact.whatsapp}`,
      "availableLanguage": ["Arabic", "English"]
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "محمد العلي"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "reviewBody": "أفضل ملحمة في أبوظبي! اللحم طازج والخدمة ممتازة."
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sarah Ahmed"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "reviewBody": "Best halal butchery in Abu Dhabi. Fresh meat and excellent service."
    }
  ],
  "potentialAction": [
    {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://wa.me/${settings.contact.whatsapp}?text=مرحبًا، أريد الطلب من ملحمة السرايا`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    },
    {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://alsarayabutcheryllc.com/catering",
        "name": "Book Catering Service"
      }
    }
  ],
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Halal Certified",
      "value": "Yes"
    },
    {
      "@type": "PropertyValue",
      "name": "Delivery Available",
      "value": "Yes - Abu Dhabi"
    },
    {
      "@type": "PropertyValue",
      "name": "WhatsApp Order",
      "value": `+${settings.contact.whatsapp}`
    }
  ]
});

// Organization schema for brand identity
export const generateOrganizationSchema = (settings: StoreSettings) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://alsarayabutcheryllc.com/#organization",
  "name": "Al Saraya Butchery LLC",
  "alternateName": "ملحمة السرايا",
  "url": settings.contact.website,
  "logo": "https://alsarayabutcheryllc.com/logo.jpg",
  "description": "Premium halal butchery in UAE offering fresh meat, marinated selections, and catering services.",
  "foundingDate": "2015",
  "founders": [
    {
      "@type": "Person",
      "name": "Al Saraya Founders"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": `${settings.location.building_en}, ${settings.location.street_en}`,
    "addressLocality": settings.location.city_en,
    "addressRegion": settings.location.city_en,
    "addressCountry": "AE"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": settings.contact.phone_intl,
    "contactType": "customer service"
  },
  "sameAs": [
    settings.social.facebook,
    settings.social.instagram,
    settings.social.tiktok
  ]
});

// WebSite schema for sitelinks search box
export const generateWebsiteSchema = (settings: StoreSettings) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://alsarayabutcheryllc.com/#website",
  "url": settings.contact.website,
  "name": "Al Saraya Butchery | ملحمة السرايا",
  "description": "Premium halal butchery in UAE - Fresh meat, catering, and ready-to-grill selections",
  "publisher": {
    "@id": "https://alsarayabutcheryllc.com/#organization"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://alsarayabutcheryllc.com/shop?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": ["ar", "en"]
});

// Combined schema for homepage
export const getHomePageSchema = (settings: StoreSettings) => ({
  "@context": "https://schema.org",
  "@graph": [
    generateLocalBusinessSchema(settings),
    generateOrganizationSchema(settings),
    generateWebsiteSchema(settings)
  ]
});

// Legacy exports for backward compatibility - uses centralized defaults
export const localBusinessSchema = generateLocalBusinessSchema(defaultStoreSettings);
export const organizationSchema = generateOrganizationSchema(defaultStoreSettings);
export const websiteSchema = generateWebsiteSchema(defaultStoreSettings);
