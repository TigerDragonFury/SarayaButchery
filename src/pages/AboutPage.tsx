import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Shield, Leaf, Heart, Users, Clock, ArrowLeft, ArrowRight, MessageCircle, Instagram, Truck } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHeroImages } from "@/hooks/useHeroImages";
import butcheryStaff from "@/assets/team/butchery-staff.jpg";
import deliveryTeam from "@/assets/team/delivery-team.jpg";

const AboutPage = () => {
  const { t, isRTL, language } = useLanguage();
  const { getHeroImage } = useHeroImages();

  const values = [
    {
      icon: Shield,
      title: t("about.value.halalSlaughter"),
      description: t("about.value.halalSlaughterDesc"),
    },
    {
      icon: Leaf,
      title: t("about.value.freshDaily"),
      description: t("about.value.freshDailyDesc"),
    },
    {
      icon: Award,
      title: t("about.value.qualityGuaranteed"),
      description: t("about.value.qualityGuaranteedDesc"),
    },
    {
      icon: Heart,
      title: t("about.value.excellentService"),
      description: t("about.value.excellentServiceDesc"),
    },
    {
      icon: Users,
      title: t("about.value.longExperience"),
      description: t("about.value.longExperienceDesc"),
    },
    {
      icon: Clock,
      title: t("about.value.fastDelivery"),
      description: t("about.value.fastDeliveryDesc"),
    },
  ];

  const stats = [
    { value: "+14", label: t("about.stats.years") },
    { value: "+10000", label: t("about.stats.customers") },
    { value: "+500", label: t("about.stats.events") },
    { value: "100%", label: t("about.stats.halal") },
  ];

  const handleWhatsApp = () => {
    window.open("https://wa.me/023339111", "_blank");
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? "من نحن" : "About Us", url: "/about" },
  ]);

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": isRTL ? "عن ملحمة السرايا" : "About Al Saraya Butchery",
    "description": isRTL ? "تعرف على قصة ملحمة السرايا ورحلتنا في تقديم أجود اللحوم الحلال في الإمارات" : "Learn about Al Saraya Butchery and our journey in providing the finest halal meats in UAE",
    "mainEntity": {
      "@type": "Organization",
      "name": "Al Saraya Butchery LLC",
      "foundingDate": "2010",
      "numberOfEmployees": "50+",
      "areaServed": "United Arab Emirates"
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <PageLayout>
      <SEOHead
        title={isRTL ? "من نحن - قصة ملحمة السرايا" : "About Us - Al Saraya Butchery Story"}
        titleEn="About Us - Al Saraya Butchery Story"
        description={isRTL ? "تعرف على قصة ملحمة السرايا منذ 2010 - أفضل ملحمة في الإمارات تقدم لحوم حلال طازجة بأعلى معايير الجودة. +14 سنة خبرة." : "Learn about Al Saraya Butchery since 2010 - Best butchery in UAE offering fresh halal meat with highest quality standards. 14+ years experience."}
        descriptionEn="Learn about Al Saraya Butchery since 2010 - Best butchery in UAE offering fresh halal meat with highest quality standards. 14+ years experience."
        keywords="عن ملحمة السرايا, قصة السرايا, ملحمة حلال, about Al Saraya, halal butchery UAE, meat shop story"
        canonical="/about"
        schema={{ ...breadcrumbSchema, ...aboutSchema }}
      />
      
      <PageHero
        title={t("about.tagline")}
        titleEn="About Us"
        subtitle={isRTL ? "قصة ملحمة السرايا ورحلتنا في تقديم أجود اللحوم" : "The Al Saraya story and our journey in delivering the finest meats"}
        backgroundImage={getHeroImage('about')}
        size="md"
      />

      {/* Story Section */}
      <section className="py-16" aria-label={isRTL ? "قصتنا" : "Our Story"}>
        <div className="container mx-auto px-4">
          <div className={`grid lg:grid-cols-2 gap-16 items-center`} dir={isRTL ? "rtl" : "ltr"}>
            <article>
              <span className="text-accent font-medium text-sm uppercase tracking-wider">
                {t("about.storyTagline")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                {t("about.storyTitle")}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t("about.storyP1")}</p>
                <p>{t("about.storyP2")}</p>
                <p>{t("about.storyP3")}</p>
                <p>{t("about.storyP4")}</p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/shop">
                    {t("cta.shopNow")}
                    <ArrowIcon className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("cta.contactUs")}
                </Button>
              </div>
            </article>

            <figure className="relative">
              <img
                src="https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&h=700&fit=crop"
                alt={isRTL ? "فريق ملحمة السرايا في العمل" : "Al Saraya Butchery team at work"}
                className="rounded-2xl shadow-2xl w-full"
                loading="lazy"
              />
              <figcaption className={`absolute -bottom-8 ${isRTL ? "-right-8" : "-left-8"} bg-accent text-accent-foreground p-8 rounded-xl shadow-xl`}>
                <p className="text-5xl font-bold">+14</p>
                <p className="text-sm">{t("about.experience")}</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-foreground text-background" aria-label={isRTL ? "إحصائياتنا" : "Our Statistics"}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" dir={isRTL ? "rtl" : "ltr"}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-background/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16" aria-label={isRTL ? "قيمنا" : "Our Values"}>
        <div className="container mx-auto px-4">
          <header className="text-center mb-12" dir={isRTL ? "rtl" : "ltr"}>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">
              {t("about.valuesTagline")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              {t("about.valuesTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.valuesDescription")}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir={isRTL ? "rtl" : "ltr"}>
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Staff & Delivery Team Section */}
      <section className="py-16 bg-muted/20" aria-label={isRTL ? "فريق الملحمة والتوصيل" : "Butchery and Delivery Team"}>
        <div className="container mx-auto px-4">
          <header className="text-center mb-12" dir={isRTL ? "rtl" : "ltr"}>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">
              {t("about.teamTagline")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              {t("about.teamTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.teamDescription")}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8" dir={isRTL ? "rtl" : "ltr"}>
            {/* Butchery Staff */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="relative">
                <img
                  src={butcheryStaff}
                  alt={isRTL ? "فريق عمل ملحمة السرايا" : "Al Saraya Butchery team"}
                  className="w-full h-72 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className={`absolute bottom-4 ${isRTL ? "right-4 left-4" : "left-4 right-4"} text-white`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5" />
                    <h3 className="text-xl font-bold">{t("about.butcheryTeam")}</h3>
                  </div>
                  <p className="text-white/80 text-sm">
                    {t("about.butcheryTeamDesc")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Delivery Team */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="relative">
                <img
                  src={deliveryTeam}
                  alt={isRTL ? "فريق التوصيل في ملحمة السرايا" : "Al Saraya Delivery team"}
                  className="w-full h-72 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className={`absolute bottom-4 ${isRTL ? "right-4 left-4" : "left-4 right-4"} text-white`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5" />
                    <h3 className="text-xl font-bold">{t("about.deliveryTeam")}</h3>
                  </div>
                  <p className="text-white/80 text-sm">
                    {t("about.deliveryTeamDesc")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Team/Credits Section */}
      <section className="py-12 bg-muted/30" aria-label={isRTL ? "فريق العمل" : "Success Team"}>
        <div className="container mx-auto px-4">
          <div className="text-center" dir={isRTL ? "rtl" : "ltr"}>
            <h3 className="text-2xl font-bold text-foreground mb-8">{t("about.successTeam")}</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Ahmad Istiti - Manager */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-3xl font-bold">
                    AI
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-foreground">Ahmad Istiti</h4>
                    <p className="text-primary font-medium text-sm">{t("about.generalManager")}</p>
                    <p className="text-muted-foreground text-xs mt-1">{t("about.managerDesc")}</p>
                  </div>
                  <a
                    href="https://www.instagram.com/ahmadistiti92"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="text-sm font-medium">@ahmadistiti92</span>
                  </a>
                </CardContent>
              </Card>

              {/* Eslam Azab - Social Media */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold">
                    EA
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-foreground">Eslam Azab</h4>
                    <p className="text-primary font-medium text-sm">{t("about.socialMediaManager")}</p>
                    <p className="text-muted-foreground text-xs mt-1">{t("about.socialMediaManagerDesc")}</p>
                  </div>
                  <a
                    href="https://www.instagram.com/eslamazab_ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="text-sm font-medium">@eslamazab_ph</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5" aria-label={isRTL ? "دعوة للانضمام" : "Join Us"}>
        <div className="container mx-auto px-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t("about.joinFamily")}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("about.alwaysAtService")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/contact">
                {t("cta.contactUs")}
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/shop">
                {t("cta.browseProductsPage")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <WhatsAppCTA />
    </PageLayout>
  );
};

export default AboutPage;
