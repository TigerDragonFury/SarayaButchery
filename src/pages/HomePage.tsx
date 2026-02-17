import { lazy, Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import HomeHero from "@/components/home/HomeHero";
import SEOHead from "@/components/seo/SEOHead";
import LazySection from "@/components/shared/LazySection";
import { getHomePageSchema } from "@/lib/local-business-schema";
import { useStoreSettings } from "@/hooks/useStoreSettings";

// Lazy load all below-fold sections to reduce initial JS bundle (~200KB+ savings)
const WhyChooseUs = lazy(() => import("@/components/home/WhyChooseUs"));
const CategoryIcons = lazy(() => import("@/components/home/CategoryIcons"));
const BestSellers = lazy(() => import("@/components/home/BestSellers"));
const SpecialOffers = lazy(() => import("@/components/home/SpecialOffers"));
const SarayaBoxes = lazy(() => import("@/components/home/SarayaBoxes"));
const HowToOrder = lazy(() => import("@/components/home/HowToOrder"));
const DeliveryPayment = lazy(() => import("@/components/home/DeliveryPayment"));
const AboutPreview = lazy(() => import("@/components/home/AboutPreview"));
const CateringPreview = lazy(() => import("@/components/home/CateringPreview"));
const MenuPreview = lazy(() => import("@/components/home/MenuPreview"));
const RecipesPreview = lazy(() => import("@/components/home/RecipesPreview"));
const TrustStats = lazy(() => import("@/components/home/TrustStats"));
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection"));
const SEOContentBlock = lazy(() => import("@/components/home/SEOContentBlock"));
const FinalCTA = lazy(() => import("@/components/home/FinalCTA"));
const RamadanBanner = lazy(() => import("@/components/home/RamadanBanner"));

// Minimal fallback - invisible placeholder to avoid CLS
const SectionFallback = () => <div className="min-h-[100px]" />;

const HomePage = () => {
  const { settings } = useStoreSettings();
  
  const productCategories = [
    { name: "Premium Lamb Meat", description: "Fresh halal lamb cuts - shoulder, leg, ribs, rack, minced lamb.", category: "Lamb Meat", priceLow: 45, priceHigh: 180 },
    { name: "Premium Beef Cuts", description: "Fresh halal beef - ribeye, tenderloin, striploin, minced beef, T-bone steak.", category: "Beef Meat", priceLow: 35, priceHigh: 250 },
    { name: "Fresh Halal Chicken", description: "Daily fresh chicken - breast, thigh, wings, whole chicken, shish tawook.", category: "Chicken", priceLow: 18, priceHigh: 65 },
    { name: "BBQ Boxes & Grill Packages", description: "Ready-to-grill BBQ boxes with marinated meats for family gatherings.", category: "BBQ Boxes", priceLow: 99, priceHigh: 399 },
    { name: "Marinated Skewers Collection", description: "Pre-marinated kebab, tikka, and shish tawook skewers ready to grill.", category: "Marinated Skewers", priceLow: 25, priceHigh: 120 },
    { name: "Premium Wagyu Beef", description: "Authentic Japanese A5 and Australian Wagyu beef cuts.", category: "Wagyu Beef", priceLow: 180, priceHigh: 950 },
  ];

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      ...getHomePageSchema(settings)["@graph"],
      ...productCategories.map(p => ({
        "@type": "Product",
        "name": p.name,
        "description": p.description,
        "image": "https://alsarayabutcheryllc.com/og-image.jpg",
        "category": p.category,
        "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "AED",
          "lowPrice": p.priceLow,
          "highPrice": p.priceHigh,
          "offerCount": 10,
          "availability": "https://schema.org/InStock",
          "url": "https://alsarayabutcheryllc.com/products",
          "seller": { "@type": "Organization", "name": "Al Saraya Butchery LLC" }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "156",
          "bestRating": "5",
          "worstRating": "1"
        }
      })),
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "ما هي أنواع اللحوم المتوفرة في ملحمة السرايا؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نوفر لحوم بقري، لحوم غنم، دجاج طازج، لحوم جاهزة للشوي، وقطوعات خاصة مثل الواغيو والستيك الفاخر."
            }
          },
          {
            "@type": "Question",
            "name": "هل تقدمون خدمات تموين للمناسبات؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، نقدم خدمات تموين متكاملة للأعراس، الشركات، المناسبات الخاصة، وحفلات الشوي."
            }
          },
          {
            "@type": "Question",
            "name": "هل جميع اللحوم حلال؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، جميع لحومنا مذبوحة وفق الشريعة الإسلامية بنسبة 100٪."
            }
          },
          {
            "@type": "Question",
            "name": "هل تتوفر خدمة التوصيل؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، نقدم خدمة التوصيل في أبوظبي. يمكنك الطلب عبر واتساب على الرقم 0566808565."
            }
          },
          {
            "@type": "Question",
            "name": "أين يقع فرع ملحمة السرايا؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نتواجد في أبوظبي - الكورنيش - برج الهنا. يمكنك الاتصال على 023339111."
            }
          }
        ]
      }
    ]
  };

  return (
    <PageLayout>
      <SEOHead
        title="ملحمة حلال فاخرة أبوظبي | عروض لحوم رمضان الإمارات"
        titleEn="Premium Halal Butcher Abu Dhabi | Ramadan Meat Offers UAE"
        description="اطلب لحوم طازجة حلال أونلاين في أبوظبي. توصيل سريع في الإمارات - لحم بقري، غنم، دجاج وقطع مشاوي فاخرة. ملحمة السرايا أبوظبي."
        descriptionEn="Order fresh halal meat online in Abu Dhabi. Fast delivery across UAE. Premium beef, lamb, chicken & BBQ cuts."
        keywords="meat delivery Abu Dhabi, fresh meat UAE, butcher shop Abu Dhabi, halal meat delivery UAE, halal butcher UAE, BBQ meat Abu Dhabi, online butcher Abu Dhabi, beef delivery Abu Dhabi, lamb meat UAE, توصيل لحوم أبوظبي, ملحمة في أبوظبي, لحوم طازجة الإمارات, لحوم حلال أبوظبي, ملحمة السرايا, جزار أبوظبي"
        canonical="/"
        schema={homeSchema}
      />
      
      {/* Hero Section - eagerly loaded for LCP */}
      <HomeHero />
      
      {/* Near-fold sections - deferred until scrolled near */}
      <LazySection rootMargin="400px"><RamadanBanner /></LazySection>
      <LazySection rootMargin="400px"><WhyChooseUs /></LazySection>
      <LazySection rootMargin="400px"><CategoryIcons /></LazySection>
      
      {/* Below-fold sections - deferred until scrolled near viewport */}
      <LazySection><BestSellers /></LazySection>
      <LazySection><SpecialOffers /></LazySection>
      <LazySection><SarayaBoxes /></LazySection>
      <LazySection><HowToOrder /></LazySection>
      <LazySection><DeliveryPayment /></LazySection>
      <LazySection><AboutPreview /></LazySection>
      <LazySection><CateringPreview /></LazySection>
      <LazySection><MenuPreview /></LazySection>
      <LazySection><RecipesPreview /></LazySection>
      <LazySection><TrustStats /></LazySection>
      <LazySection><TestimonialsSection /></LazySection>
      <LazySection><SEOContentBlock /></LazySection>
      <LazySection><FinalCTA /></LazySection>
    </PageLayout>
  );
};

export default HomePage;
