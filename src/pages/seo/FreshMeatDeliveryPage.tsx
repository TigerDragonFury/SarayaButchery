import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const FreshMeatDeliveryPage = () => (
  <SEOLandingPage
    slug="fresh-meat-delivery-abu-dhabi"
    titleAr="توصيل لحوم طازجة في أبوظبي"
    titleEn="Fresh Meat Delivery Abu Dhabi | Same Day Delivery UAE"
    descriptionAr="أسرع خدمة توصيل لحوم طازجة حلال في أبوظبي. اطلب لحم بقري، غنم، دجاج ومشاوي جاهزة واستلم في نفس اليوم."
    descriptionEn="Fastest fresh halal meat delivery in Abu Dhabi. Order beef, lamb, chicken and ready-to-grill meats. Same day delivery across UAE."
    keywords="fresh meat delivery Abu Dhabi, meat delivery UAE, same day meat delivery, halal meat delivery, توصيل لحوم أبوظبي, توصيل لحوم طازجة"
    productData={{ name: "Fresh Meat Delivery Abu Dhabi", category: "Meat Delivery Service", description: "Same-day fresh halal meat delivery across Abu Dhabi and UAE. Beef, lamb, chicken and BBQ.", priceLow: 20, priceHigh: 400, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770735020604-mp0vd.webp" }}
    h1Ar="توصيل لحوم طازجة في أبوظبي - في نفس اليوم"
    h1En="Fresh Meat Delivery in Abu Dhabi — Same Day"
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">أسرع توصيل لحوم في أبوظبي</h2>
          <p>
            هل تبحث عن خدمة توصيل لحوم طازجة موثوقة في أبوظبي؟ ملحمة السرايا تقدم أسرع خدمة توصيل لحوم حلال في الإمارات العربية المتحدة. نوصل إلى باب منزلك في نفس اليوم - لحم بقري طازج، لحم غنم ممتاز، دجاج محلي، و<Link to="/shop/ready-to-grill" className="text-primary hover:underline">لحوم مشاوي جاهزة للشوي</Link>.
          </p>
          <p>
            خدمة التوصيل لدينا تغطي جميع مناطق أبوظبي: الكورنيش، المارينا، جزيرة الريم، جزيرة السعديات، مدينة خليفة، مدينة محمد بن زايد، المصفح، بين الجسرين، والشامخة. كما نوفر توصيل إلى العين ودبي والشارقة.
          </p>
          <p>
            طريقة الطلب سهلة وسريعة: اختر من <Link to="/products" className="text-primary hover:underline">متجرنا الإلكتروني</Link> أو أرسل طلبك عبر واتساب 0566808565. يصلك طلبك مغلفاً بعناية في عبوات تحافظ على البرودة والطزاجة.
          </p>

          <h3 className="text-xl font-semibold text-foreground">ماذا يمكنك طلبه للتوصيل؟</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/shop/beef" className="text-primary hover:underline">لحم بقري</Link> - ستيك، مفروم، مكعبات، أوصال</li>
            <li><Link to="/shop/lamb" className="text-primary hover:underline">لحم غنم</Link> - ريش، موزات، كتف، فخذ</li>
            <li><Link to="/shop/chicken" className="text-primary hover:underline">دجاج طازج</Link> - كامل، أفخاذ، أجنحة، صدور</li>
            <li>لحوم مشاوي متبلة وجاهزة للشوي</li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">بوكسات لحوم</Link> عائلية بأحجام مختلفة</li>
            <li>ذبائح كاملة للمناسبات</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لماذا توصيل ملحمة السرايا هو الأفضل؟</h2>
          <p>
            نحرص على أن تصل لحومك بأفضل حالة ممكنة. نستخدم تغليفاً احترافياً مع ثلج جاف للحفاظ على درجة حرارة مثالية أثناء النقل. سائقونا المدربون يتعاملون مع كل طلب بعناية فائقة.
          </p>

          <h3 className="text-xl font-semibold text-foreground">مميزات التوصيل</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>توصيل في نفس اليوم لطلبات الصباح</li>
            <li>تغليف بارد يحافظ على الطزاجة</li>
            <li>تتبع الطلب عبر الموقع</li>
            <li>دفع نقدي أو بالبطاقة عند الاستلام</li>
            <li>توصيل مجاني للطلبات فوق حد معين</li>
            <li>خدمة عملاء متاحة عبر واتساب</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground">أوقات التوصيل</h3>
          <p>
            نعمل يومياً من الساعة 8 صباحاً حتى 11 مساءً. يمكنك جدولة التوصيل في الوقت الذي يناسبك. الطلبات العاجلة متاحة أيضاً - فقط اتصل بنا أو أرسل واتساب وسنوصل لك بأسرع وقت ممكن.
          </p>
          <p>
            <Link to="/contact" className="text-primary hover:underline">تواصل معنا</Link> اليوم واستمتع بأفضل خدمة توصيل لحوم في أبوظبي!
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Fastest Meat Delivery in Abu Dhabi</h2>
          <p>
            Looking for reliable fresh meat delivery in Abu Dhabi? Al Saraya Butchery offers the fastest halal meat delivery service in the UAE. We deliver to your doorstep same day — fresh beef, premium lamb, local chicken, and <Link to="/shop/ready-to-grill" className="text-primary hover:underline">ready-to-grill marinated meats</Link>.
          </p>
          <p>
            Our delivery covers all Abu Dhabi areas: Corniche, Marina, Al Reem Island, Saadiyat Island, Khalifa City, MBZ City, Musaffah, Between Two Bridges, and Al Shamkha. We also deliver to Al Ain, Dubai, and Sharjah.
          </p>
          <p>
            Ordering is quick and easy: choose from our <Link to="/products" className="text-primary hover:underline">online store</Link> or send your order via WhatsApp at 0566808565. Your order arrives carefully packaged in cold-chain containers to preserve freshness.
          </p>

          <h3 className="text-xl font-semibold text-foreground">What Can You Order for Delivery?</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/shop/beef" className="text-primary hover:underline">Beef</Link> — steaks, mince, cubes, tenderloin</li>
            <li><Link to="/shop/lamb" className="text-primary hover:underline">Lamb</Link> — chops, shanks, shoulder, leg</li>
            <li><Link to="/shop/chicken" className="text-primary hover:underline">Fresh chicken</Link> — whole, drumsticks, wings, breast</li>
            <li>Marinated ready-to-grill BBQ meats</li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">Family meat boxes</Link> in various sizes</li>
            <li>Whole carcass for events</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why Al Saraya Delivery is the Best</h2>
          <p>
            We ensure your meat arrives in the best possible condition. We use professional packaging with dry ice to maintain optimal temperature during transit. Our trained drivers handle every order with utmost care.
          </p>

          <h3 className="text-xl font-semibold text-foreground">Delivery Benefits</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Same-day delivery for morning orders</li>
            <li>Cold-chain packaging preserves freshness</li>
            <li>Order tracking through our website</li>
            <li>Cash or card payment on delivery</li>
            <li>Free delivery for orders above threshold</li>
            <li>Customer support available via WhatsApp</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground">Delivery Hours</h3>
          <p>
            We operate daily from 8 AM to 11 PM. Schedule delivery at your convenience. Urgent orders also available — just call or WhatsApp us and we'll deliver as quickly as possible.
          </p>
          <p>
            <Link to="/contact" className="text-primary hover:underline">Contact us</Link> today for the best meat delivery experience in Abu Dhabi!
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "How fast is meat delivery in Abu Dhabi?", answer: "Al Saraya offers same-day delivery for morning orders across all Abu Dhabi areas. Urgent deliveries are also available upon request." },
      { question: "What areas do you deliver to in Abu Dhabi?", answer: "We deliver to Corniche, Marina, Al Reem, Saadiyat, Khalifa City, MBZ City, Musaffah, Al Shamkha, and all other Abu Dhabi areas. Also available to Al Ain, Dubai, and Sharjah." },
      { question: "How is the meat packaged for delivery?", answer: "We use professional cold-chain packaging with dry ice to ensure your meat arrives fresh and at the perfect temperature." },
      { question: "Can I pay cash on delivery?", answer: "Yes, we accept both cash and credit/debit card payments upon delivery." },
      { question: "Is there a minimum order for free delivery?", answer: "We offer free delivery for orders above a certain amount. Contact us on WhatsApp at 0566808565 for current delivery thresholds." },
    ]}
  />
);

export default FreshMeatDeliveryPage;
