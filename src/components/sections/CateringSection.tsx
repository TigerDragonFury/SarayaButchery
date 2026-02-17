import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Flame, Building2, Scissors, FileText } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "تموين مناسبات عائلية",
    description: "نقدم خدمات تموين متكاملة للمناسبات العائلية والتجمعات الخاصة بأجود أنواع اللحوم",
  },
  {
    icon: Flame,
    title: "تموين حفلات وشوي",
    description: "خدمة شوي احترافية في موقعك مع تجهيز كامل وطاقم متخصص",
  },
  {
    icon: Building2,
    title: "تموين شركات",
    description: "حلول تموين مخصصة للشركات والفعاليات المؤسسية بأسعار تنافسية",
  },
  {
    icon: Scissors,
    title: "ذبائح وتجهيز كامل",
    description: "خدمة ذبائح شاملة مع التقطيع والتجهيز حسب رغبتكم",
  },
];

const CateringSection = () => {
  return (
    <section id="catering" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center" dir="rtl">
          {/* Content */}
          <div>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">خدمات التموين</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
              خدمات التموين والمناسبات
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              تقدّم ملحمة السرايا خدمات تموين متكاملة للمناسبات الخاصة، العزائم، الحفلات، والفعاليات، باستخدام أجود أنواع اللحوم وتحضير احترافي.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {services.map((service, index) => (
                <Card key={index} className="border border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{service.title}</h4>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button size="lg" className="gap-2 px-8">
              <FileText className="w-5 h-5" />
              اطلب عرض سعر
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=700&fit=crop"
                alt="خدمات التموين"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 right-6 left-6 text-white">
                <p className="text-2xl font-bold">+500</p>
                <p className="text-sm opacity-80">مناسبة ناجحة سنويًا</p>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CateringSection;
