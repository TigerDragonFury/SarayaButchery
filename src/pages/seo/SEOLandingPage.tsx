import PageLayout from "@/components/layout/PageLayout";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, MapPin, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { getHomePageSchema } from "@/lib/local-business-schema";

interface ProductSchemaData {
  name: string;
  description: string;
  image?: string;
  priceLow: number;
  priceHigh: number;
  category: string;
}

interface SEOLandingPageProps {
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  keywords: string;
  h1Ar: string;
  h1En: string;
  contentAr: React.ReactNode;
  contentEn: React.ReactNode;
  faqs: { question: string; answer: string }[];
  extraContent?: React.ReactNode;
  productData?: ProductSchemaData;
}

const SEOLandingPage = ({
  slug,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  keywords,
  h1Ar,
  h1En,
  contentAr,
  contentEn,
  faqs,
  extraContent,
  productData,
}: SEOLandingPageProps) => {
  const { isRTL } = useLanguage();
  const { settings } = useStoreSettings();

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? titleAr : titleEn, url: `/${slug}` },
  ]);

  const graphItems: any[] = [
    ...getHomePageSchema(settings)["@graph"],
    faqSchema,
    breadcrumbSchema,
  ];

  if (productData) {
    graphItems.push({
      "@type": "Product",
      "name": productData.name,
      "description": productData.description,
      "image": productData.image || "https://sarayabutchery-gourmet-uae.lovable.app/og-image.jpg",
      "category": productData.category,
      "brand": { "@type": "Brand", "name": "Al Saraya Butchery" },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "AED",
        "lowPrice": productData.priceLow,
        "highPrice": productData.priceHigh,
        "offerCount": 10,
        "availability": "https://schema.org/InStock",
        "url": `https://alsarayabutcheryllc.com/${slug}`,
        "seller": { "@type": "Organization", "name": "Al Saraya Butchery LLC" }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "156",
        "bestRating": "5",
        "worstRating": "1"
      }
    });
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": graphItems,
  };

  return (
    <PageLayout>
      <SEOHead
        title={titleAr}
        titleEn={titleEn}
        description={descriptionAr}
        descriptionEn={descriptionEn}
        keywords={keywords}
        canonical={`/${slug}`}
        schema={schema}
      />

      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-[1280px] text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              {isRTL ? h1Ar : h1En}
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {isRTL ? descriptionAr : descriptionEn}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <a href={`https://wa.me/${settings.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  {isRTL ? "اطلب عبر واتساب" : "Order via WhatsApp"}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link to="/products">
                  {isRTL ? "تسوق الآن" : "Shop Now"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Extra Content (e.g. Countdown) */}
        {extraContent}

        {/* Trust Badges */}
        <section className="py-8 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 max-w-[1280px]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { icon: Check, textAr: "حلال 100٪", textEn: "100% Halal Certified" },
                { icon: MapPin, textAr: "توصيل أبوظبي", textEn: "Abu Dhabi Delivery" },
                { icon: Star, textAr: "تقييم 4.8 نجوم", textEn: "4.8 Star Rating" },
                { icon: Phone, textAr: "خدمة عملاء 24/7", textEn: "24/7 Support" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                  <badge.icon className="w-5 h-5 text-primary" />
                  {isRTL ? badge.textAr : badge.textEn}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-[1280px]">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              {isRTL ? contentAr : contentEn}
            </article>
          </div>
        </section>

        {/* Product Links */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4 max-w-[1280px]">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {isRTL ? "تسوق حسب الفئة" : "Shop by Category"}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { to: "/shop/beef", labelAr: "لحم بقري", labelEn: "Beef" },
                { to: "/shop/lamb", labelAr: "لحم غنم", labelEn: "Lamb" },
                { to: "/shop/chicken", labelAr: "دجاج", labelEn: "Chicken" },
                { to: "/shop/ready-to-grill", labelAr: "جاهز للشوي", labelEn: "Ready to Grill" },
              ].map((cat) => (
                <Link
                  key={cat.to}
                  to={cat.to}
                  className="bg-background rounded-xl p-6 text-center border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <span className="text-lg font-semibold text-foreground">
                    {isRTL ? cat.labelAr : cat.labelEn}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
              {isRTL ? "أسئلة شائعة" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-muted/30 rounded-xl p-6 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 max-w-[900px] text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              {isRTL ? "جاهز للطلب؟" : "Ready to Order?"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isRTL
                ? "اتصل بنا أو اطلب عبر واتساب للحصول على أفضل اللحوم الطازجة في أبوظبي"
                : "Call us or order via WhatsApp for the freshest meat in Abu Dhabi"}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <a href={`https://wa.me/${settings.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  {isRTL ? "واتساب" : "WhatsApp"}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <a href={`tel:${settings.contact.phone_intl}`}>
                  <Phone className="w-5 h-5" />
                  {isRTL ? "اتصل بنا" : "Call Us"}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default SEOLandingPage;
