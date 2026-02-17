import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const ButcherAbuDhabiPage = () => (
  <SEOLandingPage
    slug="butcher-abu-dhabi"
    titleAr="أفضل ملحمة في أبوظبي"
    titleEn="Best Butcher in Abu Dhabi | Al Saraya Butchery"
    descriptionAr="ملحمة السرايا - أفضل ملحمة حلال في أبوظبي. لحوم طازجة يومياً، تقطيع احترافي، وتوصيل سريع لجميع مناطق أبوظبي."
    descriptionEn="Al Saraya Butchery - Best halal butcher shop in Abu Dhabi. Daily fresh meat, professional cutting, and fast delivery across Abu Dhabi."
    keywords="butcher Abu Dhabi, best butcher Abu Dhabi, halal butcher Abu Dhabi, meat shop Abu Dhabi, ملحمة أبوظبي, أفضل ملحمة أبوظبي, جزار أبوظبي"
    productData={{ name: "Fresh Halal Meat Abu Dhabi", category: "Butcher Shop", description: "Premium halal beef, lamb, chicken and wagyu from Abu Dhabi's best butcher shop with same-day delivery.", priceLow: 25, priceHigh: 450, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770730174482-n7vsb9.webp" }}
    h1Ar="أفضل ملحمة في أبوظبي - ملحمة السرايا"
    h1En="Best Butcher in Abu Dhabi — Al Saraya Butchery"
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">ملحمة السرايا - جزار أبوظبي الأول</h2>
          <p>
            تعتبر ملحمة السرايا من أعرق وأفضل المحلات المتخصصة في بيع اللحوم الطازجة في أبوظبي. منذ تأسيسنا عام 2019، نخدم عملاءنا بأجود أنواع اللحوم الحلال المذبوحة وفق أعلى معايير الشريعة الإسلامية. يقع فرعنا الرئيسي في برج الهنا على كورنيش أبوظبي، ونوفر خدمة التوصيل السريع لجميع مناطق العاصمة.
          </p>
          <p>
            ما يميز ملحمة السرايا عن غيرها من الملاحم في أبوظبي هو التزامنا بالجودة الفائقة والنظافة المطلقة. كل قطعة لحم تمر بفحوصات دقيقة قبل عرضها للبيع. فريقنا من الجزارين المحترفين ذوي الخبرة الطويلة يقدمون لك تقطيعاً احترافياً حسب طلبك - سواء كنت تريد شرائح رفيعة للستيك، مكعبات للطبخ، لحم مفروم ناعم، أو قطع كبيرة للذبائح والمناسبات.
          </p>
          <p>
            نستورد لحومنا من أفضل المزارع والمصادر العالمية الموثوقة. لحم بقري أسترالي وبرازيلي فاخر، لحم غنم أردني وأسترالي ممتاز، ودجاج محلي طازج يومياً. بالإضافة إلى ذلك، نوفر قطعيات فاخرة نادرة مثل <Link to="/products" className="text-primary hover:underline">لحم الواغيو الياباني</Link> و<Link to="/shop/special-cuts" className="text-primary hover:underline">ستيك التوماهوك</Link> التي يصعب إيجادها في ملاحم أبوظبي الأخرى.
          </p>

          <h3 className="text-xl font-semibold text-foreground">خدمات ملحمة السرايا في أبوظبي</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>لحوم طازجة يومية - بقري، غنم، ودجاج حلال</li>
            <li>تقطيع احترافي حسب الطلب</li>
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">لحوم مشاوي جاهزة ومتبلة</Link></li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">بوكسات لحوم عائلية</Link> بأحجام مختلفة</li>
            <li><Link to="/catering" className="text-primary hover:underline">تموين مناسبات</Link> - أعراس، شركات، وحفلات خاصة</li>
            <li>ذبائح كاملة للمناسبات الكبيرة</li>
            <li>توصيل سريع لجميع مناطق أبوظبي</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">مناطق التوصيل في أبوظبي</h2>
          <p>
            نوصل إلى جميع مناطق أبوظبي بما فيها: الكورنيش، المارينا، جزيرة الريم، جزيرة السعديات، مدينة خليفة أ و ب، مدينة محمد بن زايد، المصفح، بين الجسرين، مدينة شخبوط، والشامخة. كما نوفر توصيل إلى العين ودبي والشارقة بطلب مسبق.
          </p>
          <p>
            أوقات التوصيل مرنة وتناسب جميع العملاء. يمكنك الطلب عبر واتساب على الرقم 0566808565 أو من خلال موقعنا الإلكتروني. طلبات الصباح تصل في نفس اليوم، ونقبل الدفع نقداً وبالبطاقة الائتمانية عند الاستلام.
          </p>

          <h3 className="text-xl font-semibold text-foreground">لماذا نحن أفضل ملحمة في أبوظبي؟</h3>
          <p>
            يثق بنا أكثر من آلاف العملاء في أبوظبي والإمارات. تقييمنا على جوجل 4.8 من 5 نجوم بناءً على مئات التقييمات الحقيقية. نحرص على:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>لحوم حلال مضمونة 100٪ من مصادر موثوقة</li>
            <li>نظافة وتعقيم على مدار الساعة</li>
            <li>أسعار تنافسية مقارنة بجودة المنتج</li>
            <li>تغليف احترافي يحافظ على طزاجة اللحوم</li>
            <li>فريق خدمة عملاء متعاون ومحترف</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground">تواصل معنا</h3>
          <p>
            زُرنا في فرعنا في <Link to="/contact" className="text-primary hover:underline">برج الهنا، الكورنيش، أبوظبي</Link>. أو اتصل على 023339111 واطلب عبر واتساب 0566808565. تابعنا على انستغرام @alsarayabutchery لأحدث العروض والمنتجات.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Al Saraya — Abu Dhabi's Premier Butcher Shop</h2>
          <p>
            Al Saraya Butchery is one of the most established and trusted butcher shops in Abu Dhabi. Since our founding in 2019, we have served our customers with the finest quality halal meat, slaughtered according to the highest standards of Islamic Sharia law. Our main branch is located in Al Hana Tower on the Abu Dhabi Corniche, and we offer fast delivery service across all areas of the capital.
          </p>
          <p>
            What sets Al Saraya apart from other butcher shops in Abu Dhabi is our unwavering commitment to premium quality and absolute hygiene. Every piece of meat undergoes thorough quality checks before it's offered for sale. Our team of experienced professional butchers provides expert cutting to your exact specifications — whether you need thin steak slices, cubes for stewing, finely minced meat, or large cuts for events.
          </p>
          <p>
            We source our meats from the world's most trusted farms and suppliers. Premium Australian and Brazilian beef, excellent Jordanian and Australian lamb, and daily fresh local chicken. We also offer rare premium cuts like <Link to="/products" className="text-primary hover:underline">Japanese Wagyu beef</Link> and <Link to="/shop/special-cuts" className="text-primary hover:underline">Tomahawk steaks</Link> that are hard to find at other Abu Dhabi butcher shops.
          </p>

          <h3 className="text-xl font-semibold text-foreground">Our Services in Abu Dhabi</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Daily fresh meat — halal beef, lamb, and chicken</li>
            <li>Custom professional cutting to order</li>
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">Ready-to-grill marinated meats</Link></li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">Family meat boxes</Link> in various sizes</li>
            <li><Link to="/catering" className="text-primary hover:underline">Event catering</Link> — weddings, corporate, and private parties</li>
            <li>Whole carcass for large celebrations</li>
            <li>Fast delivery across all Abu Dhabi areas</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Delivery Areas in Abu Dhabi</h2>
          <p>
            We deliver to all Abu Dhabi areas including: Corniche, Marina, Al Reem Island, Saadiyat Island, Khalifa City A & B, Mohammed Bin Zayed City, Musaffah, Between Two Bridges, Shakhbout City, and Al Shamkha. We also deliver to Al Ain, Dubai, and Sharjah on pre-order.
          </p>
          <p>
            Delivery times are flexible to suit all customers. You can order via WhatsApp at 0566808565 or through our website. Morning orders arrive same day. We accept cash and credit card on delivery.
          </p>

          <h3 className="text-xl font-semibold text-foreground">Why We're Abu Dhabi's Best Butcher</h3>
          <p>
            Thousands of customers across Abu Dhabi and the UAE trust us. Our Google rating is 4.8 out of 5 stars based on hundreds of genuine reviews. We are committed to:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>100% guaranteed halal meat from trusted sources</li>
            <li>Round-the-clock cleanliness and sanitation</li>
            <li>Competitive prices relative to product quality</li>
            <li>Professional packaging that preserves freshness</li>
            <li>Friendly and professional customer service team</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground">Contact Us</h3>
          <p>
            Visit us at <Link to="/contact" className="text-primary hover:underline">Al Hana Tower, Corniche, Abu Dhabi</Link>. Call 023339111 or order via WhatsApp 0566808565. Follow us on Instagram @alsarayabutchery for the latest offers and products.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "What is the best butcher shop in Abu Dhabi?", answer: "Al Saraya Butchery is rated 4.8/5 on Google and is known as Abu Dhabi's premier halal butcher, offering daily fresh meat, professional cutting, and same-day delivery." },
      { question: "Does Al Saraya deliver meat in Abu Dhabi?", answer: "Yes, we deliver to all Abu Dhabi areas including Corniche, Al Reem, Saadiyat, Khalifa City, MBZ City, and more. Same-day delivery available for morning orders." },
      { question: "Is all meat at Al Saraya halal?", answer: "Yes, 100% of our meat is slaughtered in strict accordance with Islamic Sharia law. We source from certified halal suppliers worldwide." },
      { question: "What types of meat does Al Saraya sell?", answer: "We offer fresh beef, lamb, chicken, wagyu, ready-to-grill marinated meats, BBQ boxes, and whole carcass for events." },
      { question: "Where is Al Saraya Butchery located?", answer: "Our main branch is in Al Hana Tower, Corniche Road, Abu Dhabi. You can also order online or via WhatsApp at 0566808565." },
    ]}
  />
);

export default ButcherAbuDhabiPage;
