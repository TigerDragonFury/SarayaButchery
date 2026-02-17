import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const HalalButcherUAEPage = () => (
  <SEOLandingPage
    slug="halal-butcher-uae"
    titleAr="ملحمة حلال في الإمارات"
    titleEn="Halal Butcher UAE | Premium Halal Meat Shop"
    descriptionAr="ملحمة السرايا - أفضل ملحمة حلال في الإمارات. لحوم مذبوحة وفق الشريعة الإسلامية 100٪. بقري، غنم، دجاج، وواغيو فاخر."
    descriptionEn="Al Saraya - Best halal butcher in UAE. 100% Sharia-compliant meat. Premium beef, lamb, chicken, and wagyu. Delivery across Emirates."
    keywords="halal butcher UAE, halal meat UAE, halal meat shop, Islamic butcher, certified halal, ملحمة حلال, لحوم حلال الإمارات, ذبح حلال"
    productData={{ name: "Halal Meat UAE", category: "Halal Butcher", description: "100% Sharia-compliant halal beef, lamb, chicken and wagyu with delivery across UAE.", priceLow: 20, priceHigh: 500, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770801783256-s1fa0e.webp" }}
    h1Ar="أفضل ملحمة حلال في الإمارات العربية المتحدة"
    h1En="Best Halal Butcher in the United Arab Emirates"
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لحوم حلال مضمونة في الإمارات</h2>
          <p>
            في ملحمة السرايا، نلتزم التزاماً تاماً بأحكام الذبح الحلال وفق الشريعة الإسلامية. جميع لحومنا بدون استثناء مذبوحة ذبحاً شرعياً على يد جزارين مسلمين متخصصين، مع تسمية الله على كل ذبيحة. هذا الالتزام هو أساس ثقة عملائنا بنا في جميع أنحاء الإمارات.
          </p>
          <p>
            نتعامل حصرياً مع مزارع ومسالخ حاصلة على شهادات حلال معتمدة دولياً. سواء كان المصدر أستراليا، البرازيل، الأردن، أو الإمارات محلياً - كل مورد يخضع لتدقيق صارم للتأكد من التزامه الكامل بمعايير الذبح الحلال.
          </p>

          <h3 className="text-xl font-semibold text-foreground">تشكيلة اللحوم الحلال</h3>
          <p>
            نوفر تشكيلة شاملة من اللحوم الحلال تلبي جميع احتياجاتك:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/shop/beef" className="text-primary hover:underline">لحم بقري حلال</Link> - ستيك ريب آي، تندرلوين، ستربلوين، مفروم، مكعبات</li>
            <li><Link to="/shop/lamb" className="text-primary hover:underline">لحم غنم حلال</Link> - ريش، موزات، كتف، فخذ، لحم مفروم</li>
            <li><Link to="/shop/chicken" className="text-primary hover:underline">دجاج حلال طازج</Link> - كامل، أفخاذ، أجنحة، صدور، فاهيتا</li>
            <li><Link to="/products" className="text-primary hover:underline">واغيو حلال</Link> - من أندر وأفخم أنواع اللحوم في الإمارات</li>
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">مشاوي حلال جاهزة</Link> - شيش طاووق، كباب، كفتة، مشاكيك</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">خدمة عملاء الإمارات</h2>
          <p>
            نخدم عملاءنا في جميع أنحاء الإمارات العربية المتحدة. فرعنا الرئيسي في أبوظبي يخدم العاصمة والمناطق المحيطة، مع إمكانية التوصيل إلى دبي والشارقة وعجمان والعين بطلب مسبق.
          </p>
          <p>
            سواء كنت عائلة تبحث عن لحوم يومية طازجة، مطعماً يحتاج كميات كبيرة، أو تخطط لمناسبة خاصة - ملحمة السرايا هي شريكك الموثوق للحوم الحلال في الإمارات.
          </p>

          <h3 className="text-xl font-semibold text-foreground">خدمات إضافية</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/catering" className="text-primary hover:underline">تموين حلال</Link> للأعراس والمناسبات</li>
            <li>عقود توريد للمطاعم والفنادق</li>
            <li>ذبائح كاملة حسب الطلب</li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">بوكسات شهرية</Link> للعائلات</li>
            <li>استشارات في اختيار القطعيات المناسبة</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground">اطلب الآن</h3>
          <p>
            تواصل معنا عبر واتساب 0566808565 أو زُرنا في برج الهنا، الكورنيش، أبوظبي. نسعد بخدمتك وتلبية جميع احتياجاتك من اللحوم الحلال الفاخرة.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Guaranteed Halal Meat in the UAE</h2>
          <p>
            At Al Saraya Butchery, we are fully committed to halal slaughter in accordance with Islamic Sharia law. All our meat without exception is slaughtered by certified Muslim butchers with the name of Allah invoked on every animal. This commitment is the foundation of our customers' trust across the Emirates.
          </p>
          <p>
            We exclusively work with farms and abattoirs that hold internationally recognized halal certifications. Whether sourced from Australia, Brazil, Jordan, or locally within the UAE — every supplier undergoes rigorous auditing to ensure full compliance with halal slaughter standards.
          </p>

          <h3 className="text-xl font-semibold text-foreground">Our Halal Meat Selection</h3>
          <p>We offer a comprehensive range of halal meats to meet all your needs:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/shop/beef" className="text-primary hover:underline">Halal beef</Link> — ribeye steak, tenderloin, striploin, mince, cubes</li>
            <li><Link to="/shop/lamb" className="text-primary hover:underline">Halal lamb</Link> — chops, shanks, shoulder, leg, mince</li>
            <li><Link to="/shop/chicken" className="text-primary hover:underline">Fresh halal chicken</Link> — whole, drumsticks, wings, breast, fajita</li>
            <li><Link to="/products" className="text-primary hover:underline">Halal wagyu</Link> — among the rarest premium meats in the UAE</li>
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">Ready halal BBQ</Link> — shish tawook, kebab, kofta, skewers</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Serving All UAE</h2>
          <p>
            We serve customers across the United Arab Emirates. Our main branch in Abu Dhabi serves the capital and surrounding areas, with delivery available to Dubai, Sharjah, Ajman, and Al Ain on pre-order.
          </p>
          <p>
            Whether you're a family looking for daily fresh meat, a restaurant needing bulk quantities, or planning a special event — Al Saraya Butchery is your trusted partner for halal meat in the UAE.
          </p>

          <h3 className="text-xl font-semibold text-foreground">Additional Services</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/catering" className="text-primary hover:underline">Halal catering</Link> for weddings and events</li>
            <li>Supply contracts for restaurants and hotels</li>
            <li>Custom whole carcass orders</li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">Monthly family boxes</Link></li>
            <li>Expert consultation on selecting the right cuts</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground">Order Now</h3>
          <p>
            Contact us via WhatsApp at 0566808565 or visit us at Al Hana Tower, Corniche, Abu Dhabi. We're delighted to serve you with the finest halal premium meats.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Is Al Saraya Butchery certified halal?", answer: "Yes, all our meat is 100% halal, slaughtered by Muslim butchers in accordance with Islamic Sharia law. We source only from certified halal suppliers." },
      { question: "What halal meat can I buy online in UAE?", answer: "You can order halal beef, lamb, chicken, wagyu, ready-to-grill marinated meats, and family boxes online from Al Saraya Butchery with delivery across UAE." },
      { question: "Does Al Saraya deliver halal meat across UAE?", answer: "Yes, we deliver to Abu Dhabi (same-day), and to Dubai, Sharjah, Ajman, and Al Ain on pre-order basis." },
      { question: "Can I order halal meat for events and catering?", answer: "Absolutely. We offer comprehensive halal catering services for weddings, corporate events, and private gatherings with custom menus and bulk orders." },
      { question: "What makes Al Saraya different from other halal butchers?", answer: "Our commitment to quality, 4.8-star Google rating, professional cutting service, cold-chain delivery, and over 6 years of trusted service in Abu Dhabi." },
    ]}
  />
);

export default HalalButcherUAEPage;
