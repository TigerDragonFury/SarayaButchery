import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TestimonialsSection = () => {
  const { t, isRTL } = useLanguage();

  const testimonials = [
    {
      nameAr: "أحمد محمد",
      nameEn: "Ahmed Mohammed",
      roleAr: "عميل منتظم",
      roleEn: "Regular Customer",
      contentAr: "أفضل ملحمة في أبوظبي! اللحم دائمًا طازج وجودة القطوعات ممتازة. خدمة التوصيل سريعة والتعامل راقي جدًا.",
      contentEn: "Best butchery in Abu Dhabi! The meat is always fresh and cut quality is excellent. Fast delivery and very professional service.",
      rating: 5,
      avatar: isRTL ? "أ" : "A",
    },
    {
      nameAr: "سارة العلي",
      nameEn: "Sara Al Ali",
      roleAr: "صاحبة مطعم",
      roleEn: "Restaurant Owner",
      contentAr: "نتعامل مع ملحمة السرايا منذ 3 سنوات لمطعمنا. الجودة ثابتة والأسعار منافسة. شريك موثوق لعملنا.",
      contentEn: "We have been working with Al Saraya Butchery for 3 years for our restaurant. Consistent quality and competitive prices. A trusted partner for our business.",
      rating: 5,
      avatar: isRTL ? "س" : "S",
    },
    {
      nameAr: "خالد الحمادي",
      nameEn: "Khaled Al Hammadi",
      roleAr: "محب للشوي",
      roleEn: "BBQ Enthusiast",
      contentAr: "تجربة رائعة! طلبت بوكس المشاوي لحفلة العائلة وكان الجميع سعيدًا بجودة اللحم والتتبيلة الشامية الأصيلة.",
      contentEn: "Amazing experience! Ordered the BBQ box for a family party and everyone was happy with the meat quality and authentic Levantine marinade.",
      rating: 5,
      avatar: isRTL ? "خ" : "K",
    },
    {
      nameAr: "فاطمة الشامسي",
      nameEn: "Fatima Al Shamsi",
      roleAr: "ربة منزل",
      roleEn: "Homemaker",
      contentAr: "خدمة التموين في عزيمة رمضان كانت مثالية! شكرًا لفريق السرايا على الاحترافية والجودة.",
      contentEn: "The catering service for our Ramadan gathering was perfect! Thanks to the Al Saraya team for their professionalism and quality.",
      rating: 5,
      avatar: isRTL ? "ف" : "F",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            {t("testimonials.tagline")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("testimonials.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir={isRTL ? "rtl" : "ltr"}>
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-8">
                <Quote className="w-10 h-10 text-accent/30 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">
                  "{isRTL ? testimonial.contentAr : testimonial.contentEn}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">
                      {isRTL ? testimonial.nameAr : testimonial.nameEn}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? testimonial.roleAr : testimonial.roleEn}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
