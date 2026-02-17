import { Link, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Flame, Building2, PartyPopper, ArrowLeft, ArrowRight, MessageCircle, Check } from "lucide-react";
import { generateCateringServiceSchema, generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHeroImages } from "@/hooks/useHeroImages";

const CateringPage = () => {
  const { type } = useParams();
  const { t, isRTL, language } = useLanguage();
  const { getHeroImage } = useHeroImages();

  const cateringTypes = [
    {
      id: "corporate",
      icon: Building2,
      title: isRTL ? "تموين شركات" : "Corporate Catering",
      titleEn: "Corporate Catering",
      titleAr: "تموين شركات",
      description: isRTL ? "حلول تموين احترافية للشركات والفعاليات المؤسسية" : "Professional catering solutions for companies and corporate events",
      seoDesc: isRTL ? "خدمات تموين شركات احترافية في الإمارات - قوائم مخصصة وخدمة VIP للفعاليات المؤسسية" : "Professional corporate catering services in UAE - Custom menus and VIP service for corporate events",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      features: isRTL 
        ? ["قوائم مخصصة", "تجهيز كامل", "طاقم خدمة محترف", "توصيل في الوقت المحدد"]
        : ["Custom Menus", "Full Setup", "Professional Staff", "On-Time Delivery"],
    },
    {
      id: "wedding",
      icon: PartyPopper,
      title: isRTL ? "تموين أعراس" : "Wedding Catering",
      titleEn: "Wedding Catering",
      titleAr: "تموين أعراس",
      description: isRTL ? "اجعل يومك المميز لا يُنسى مع أشهى المأكولات" : "Make your special day unforgettable with delicious cuisine",
      seoDesc: isRTL ? "تموين أعراس فاخر في الإمارات - بوفيهات فاخرة وخدمة VIP لحفلات الزفاف" : "Luxury wedding catering in UAE - Premium buffets and VIP service for weddings",
      image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop",
      features: isRTL 
        ? ["بوفيهات فاخرة", "خدمة VIP", "تنسيق كامل", "قوائم متنوعة"]
        : ["Luxury Buffets", "VIP Service", "Full Coordination", "Diverse Menus"],
    },
    {
      id: "events",
      icon: Users,
      title: isRTL ? "تموين مناسبات" : "Event Catering",
      titleEn: "Event Catering",
      titleAr: "تموين مناسبات",
      description: isRTL ? "خدمات تموين للمناسبات العائلية والتجمعات الخاصة" : "Catering services for family events and private gatherings",
      seoDesc: isRTL ? "تموين مناسبات عائلية وخاصة في الإمارات - عزائم وحفلات وذبائح كاملة" : "Family and private event catering in UAE - Gatherings, parties, and whole carcass",
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop",
      features: isRTL 
        ? ["مناسبات عائلية", "عزائم", "حفلات خاصة", "ذبائح كاملة"]
        : ["Family Events", "Gatherings", "Private Parties", "Whole Carcass"],
    },
    {
      id: "bbq",
      icon: Flame,
      title: isRTL ? "تموين شوي" : "BBQ Catering",
      titleEn: "BBQ Catering",
      titleAr: "تموين شوي",
      description: isRTL ? "خدمة شوي احترافية في موقعك مع تجهيز كامل" : "Professional BBQ service at your location with full setup",
      seoDesc: isRTL ? "خدمة شوي احترافية في الإمارات - شوي مباشر في موقعك مع معدات وطاقم متخصص" : "Professional BBQ service in UAE - Live grilling at your location with equipment and specialized staff",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
      features: isRTL 
        ? ["شوي مباشر", "طاقم متخصص", "معدات كاملة", "لحوم فاخرة"]
        : ["Live Grill", "Specialized Staff", "Full Equipment", "Premium Meats"],
    },
  ];

  const handleWhatsApp = (serviceName: string) => {
    const message = language === "ar" 
      ? `مرحبًا، أريد الاستفسار عن خدمة ${serviceName}`
      : `Hello, I would like to inquire about ${serviceName} service`;
    window.open(`https://wa.me/023339111?text=${encodeURIComponent(message)}`, "_blank");
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // If specific type is selected, show detail page
  if (type) {
    const service = cateringTypes.find((s) => s.id === type);
    if (!service) {
      return (
        <PageLayout>
          <SEOHead
            title={t("catering.serviceNotFound")}
            description={t("catering.serviceNotFoundDesc")}
            noindex={true}
          />
          <PageHero title={t("catering.serviceNotFound")} subtitle={t("catering.serviceNotFoundDesc")} size="sm" />
        </PageLayout>
      );
    }

    const serviceSchema = generateCateringServiceSchema({
      name: `${service.titleAr} - ${service.titleEn}`,
      description: service.seoDesc,
      image: service.image,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: isRTL ? "الرئيسية" : "Home", url: "/" },
      { name: isRTL ? "التموين" : "Catering", url: "/catering" },
      { name: service.title, url: `/catering/${service.id}` },
    ]);

    return (
      <PageLayout>
        <SEOHead
          title={isRTL ? service.titleAr : service.titleEn}
          titleEn={service.titleEn}
          description={service.seoDesc}
          descriptionEn={`${service.titleEn} services in UAE by Al Saraya Butchery. Premium catering for your special events.`}
          keywords={`${service.titleAr}, ${service.titleEn}, تموين الإمارات, catering UAE, ملحمة السرايا`}
          canonical={`/catering/${service.id}`}
          schema={{ ...serviceSchema, ...breadcrumbSchema }}
        />
        
        <PageHero
          title={service.title}
          titleEn={service.titleEn}
          subtitle={service.description}
          backgroundImage={service.image}
          size="md"
        >
          <Button
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => handleWhatsApp(service.title)}
          >
            <MessageCircle className="w-5 h-5" />
            {t("catering.getQuote")}
          </Button>
        </PageHero>

        <section className="py-16" aria-label={isRTL ? "تفاصيل الخدمة" : "Service details"}>
          <div className="container mx-auto px-4">
            <div className={`grid lg:grid-cols-2 gap-12 items-center`} dir={isRTL ? "rtl" : "ltr"}>
              <article>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  {t("catering.aboutService")} {service.title}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {isRTL ? t("catering.serviceIntro") : t("catering.serviceIntroEn")}
                </p>

                <h3 className="text-xl font-bold text-foreground mb-4">{t("catering.serviceFeatures")}</h3>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => handleWhatsApp(service.title)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t("whatsapp.contactVia")}
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/contact">
                      {t("cta.contactUs")}
                      <ArrowIcon className={`w-4 h-4 ${isRTL ? "mr-2" : "ml-2"}`} />
                    </Link>
                  </Button>
                </div>
              </article>

              <figure className="relative">
                <img
                  src={service.image}
                  alt={`${service.title} - ${service.titleEn} catering service`}
                  className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                  loading="lazy"
                />
              </figure>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 bg-muted/30" aria-label={isRTL ? "معرض الصور" : "Gallery"}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center" dir={isRTL ? "rtl" : "ltr"}>
              {t("catering.ourWorks")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <figure key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${1555939594 + i * 1000}-58d7cb561ad1?w=400&h=400&fit=crop`}
                    alt={`${service.title} - ${i}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <WhatsAppCTA />
      </PageLayout>
    );
  }

  // Main catering page
  const mainBreadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? "التموين" : "Catering", url: "/catering" },
  ]);

  return (
    <PageLayout>
      <SEOHead
        title={isRTL ? "خدمات التموين" : "Catering Services UAE"}
        titleEn="Catering Services UAE"
        description={isRTL ? "خدمات تموين متكاملة في الإمارات - تموين أعراس، شركات، مناسبات، وحفلات شوي. أجود اللحوم الحلال مع طاقم محترف." : "Premium catering services in UAE - Wedding, corporate, events and BBQ catering. Best halal meat with professional staff."}
        descriptionEn="Premium catering services in UAE - Wedding, corporate, events and BBQ catering. Best halal meat with professional staff."
        keywords="تموين مناسبات, تموين أعراس, تموين شركات, catering UAE, wedding catering Dubai, BBQ catering Abu Dhabi, ملحمة السرايا"
        canonical="/catering"
        schema={mainBreadcrumbSchema}
      />
      
      <PageHero
        title={isRTL ? "خدمات التموين" : "Catering Services"}
        titleEn="Catering Services"
        subtitle={t("catering.mainDescription")}
        backgroundImage={getHeroImage('catering')}
        size="md"
      />

      <section className="py-16" aria-label={isRTL ? "خدمات التموين" : "Catering services"}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8" dir={isRTL ? "rtl" : "ltr"}>
            {cateringTypes.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow"
              >
                <figure className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={`${service.title} - ${service.titleEn}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <figcaption className="absolute bottom-4 right-4 left-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div className="text-white">
                        <h3 className="text-xl font-bold">{service.title}</h3>
                        <p className="text-sm text-white/80">{isRTL ? service.titleEn : service.titleAr}</p>
                      </div>
                    </div>
                  </figcaption>
                </figure>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="grid grid-cols-2 gap-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <Button asChild className="flex-1 gap-2">
                      <Link to={`/catering/${service.id}`}>
                        {t("catering.learnMore")}
                        <ArrowIcon className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleWhatsApp(service.title)}
                      aria-label={`${t("whatsapp.contactVia")} - ${service.title}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-foreground text-background" aria-label={isRTL ? "دعوة للتواصل" : "Call to action"}>
        <div className="container mx-auto px-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl font-bold mb-4">{t("catering.haveEvent")}</h2>
          <p className="text-background/70 mb-8 max-w-2xl mx-auto">
            {t("catering.eventDescription")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleWhatsApp(isRTL ? "التموين" : "Catering")}
            >
              <MessageCircle className="w-5 h-5" />
              {t("whatsapp.contactVia")}
            </Button>
            <Button asChild size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10">
              <Link to="/contact">
                {t("catering.contactPage")}
                <ArrowIcon className={`w-4 h-4 ${isRTL ? "mr-2" : "ml-2"}`} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <WhatsAppCTA />
    </PageLayout>
  );
};

export default CateringPage;
