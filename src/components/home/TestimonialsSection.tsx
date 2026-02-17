import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TestimonialsSection = () => {
  const { t, isRTL } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const testimonials = [
    {
      nameKey: "testimonial.1.name",
      roleKey: "testimonial.1.role",
      contentKey: "testimonial.1.content",
      rating: 5,
      avatar: isRTL ? "أ" : "A",
    },
    {
      nameKey: "testimonial.2.name",
      roleKey: "testimonial.2.role",
      contentKey: "testimonial.2.content",
      rating: 5,
      avatar: isRTL ? "س" : "S",
    },
    {
      nameKey: "testimonial.3.name",
      roleKey: "testimonial.3.role",
      contentKey: "testimonial.3.content",
      rating: 5,
      avatar: isRTL ? "خ" : "K",
    },
    {
      nameKey: "testimonial.4.name",
      roleKey: "testimonial.4.role",
      contentKey: "testimonial.4.content",
      rating: 5,
      avatar: isRTL ? "ف" : "F",
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`} dir={isRTL ? "rtl" : "ltr"}>
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
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-500"
              style={{ 
                transitionDelay: isVisible ? `${index * 150}ms` : "0ms",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)"
              }}
            >
              <CardContent className="p-8">
                <Quote className="w-10 h-10 text-accent/30 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">
                  "{t(testimonial.contentKey)}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{t(testimonial.nameKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(testimonial.roleKey)}</p>
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
