import { Award, Shield, Leaf, Heart } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ذبح حلال",
    description: "جميع لحومنا مذبوحة وفق الشريعة الإسلامية",
  },
  {
    icon: Leaf,
    title: "طازج يوميًا",
    description: "لحوم طازجة تصل إليك من المزرعة مباشرة",
  },
  {
    icon: Award,
    title: "جودة مضمونة",
    description: "أعلى معايير الجودة والنظافة في الصناعة",
  },
  {
    icon: Heart,
    title: "خدمة مميزة",
    description: "فريق محترف يضمن رضاك التام",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center" dir="rtl">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&h=500&fit=crop"
                alt="ملحمة السرايا"
                className="rounded-2xl shadow-2xl w-full"
              />
              {/* Experience Badge */}
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-xl">
                <p className="text-4xl font-bold">+14</p>
                <p className="text-sm">سنة من التميز</p>
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">من نحن</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
              قصتنا
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              ملحمة السرايا تأسست لتقديم لحوم طازجة وعالية الجودة تلبي ثقة عملائنا يومًا بعد يوم.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              نلتزم بأعلى معايير الذبح الحلال، النظافة، والاختيار الدقيق، لنضمن لك تجربة شراء مريحة وطعم لا يُنسى. نحن نفخر بتقديم أفضل اللحوم المحلية والمستوردة، مقطّعة باحتراف وجاهزة لتلبية احتياجاتك.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
