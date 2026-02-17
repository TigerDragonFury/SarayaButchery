import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const ButcherAlReemIslandPage = () => (
  <SEOLandingPage
    slug="butcher-al-reem-island"
    titleAr="ملحمة في جزيرة الريم | توصيل لحوم"
    titleEn="Butcher Al Reem Island | Meat Delivery"
    descriptionAr="أفضل ملحمة تخدم جزيرة الريم أبوظبي. لحوم طازجة حلال، دجاج، ومشاوي جاهزة مع توصيل سريع. ملحمة السرايا — خدمة الريم."
    descriptionEn="Best butcher serving Al Reem Island Abu Dhabi. Fresh halal meat, chicken, and ready BBQ with fast delivery. Al Saraya Butchery."
    keywords="butcher Al Reem Island, meat delivery Reem Island, halal butcher Reem, ملحمة جزيرة الريم, توصيل لحوم الريم, جزار الريم أبوظبي"
    productData={{ name: "Fresh Meat Delivery Al Reem Island", category: "Meat Delivery", description: "Premium halal meat delivery to Al Reem Island Abu Dhabi within 45-60 minutes.", priceLow: 25, priceHigh: 350, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770734758379-ug8c6.webp" }}
    h1Ar="ملحمة جزيرة الريم — توصيل لحوم طازجة"
    h1En="Butcher for Al Reem Island — Fresh Meat Delivery"
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">خدمة ملحمة السرايا لسكان جزيرة الريم</h2>
          <p>
            جزيرة الريم هي واحدة من أرقى المناطق السكنية في أبوظبي، ونحن في ملحمة السرايا نفخر بتقديم خدمة توصيل لحوم متميزة لسكان هذه الجزيرة الراقية. نوصل إلى جميع أبراج جزيرة الريم بما فيها أبراج صن وسكاي، مارينا سكوير، شمس أبوظبي، وجميع المجمعات السكنية.
          </p>
          <p>
            نفهم احتياجات سكان جزيرة الريم من العائلات المحلية والمقيمين الدوليين الذين يبحثون عن أجود أنواع اللحوم الحلال الطازجة. لذلك نوفر تشكيلة متنوعة تشمل <Link to="/beef-abu-dhabi" className="text-primary hover:underline">لحم بقري فاخر</Link>، <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">لحم غنم طازج</Link>، <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">دجاج حلال يومي</Link>، و<Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">واغيو أصلي</Link>.
          </p>
          <h3 className="text-xl font-semibold text-foreground">مميزات خدمتنا في الريم</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>توصيل سريع — خلال 45-60 دقيقة</li>
            <li>تغليف مبرّد يحافظ على الطزاجة</li>
            <li>طلب سهل عبر واتساب أو الموقع</li>
            <li>دفع نقدي أو بالبطاقة عند الاستلام</li>
            <li>توصيل مجاني للطلبات فوق 150 درهم</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">المنتجات الأكثر طلباً في الريم</h3>
          <p>
            سكان جزيرة الريم يفضلون <Link to="/shop/ready-to-grill" className="text-primary hover:underline">لحوم المشاوي الجاهزة</Link> لحفلات الشوي على الشرفات، و<Link to="/shop/boxes" className="text-primary hover:underline">بوكسات اللحوم العائلية</Link> الأسبوعية. كما أن <Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">لحوم الشوي المتبلة</Link> والستيك الفاخر من أكثر المنتجات مبيعاً في المنطقة.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">أوقات التوصيل لجزيرة الريم</h2>
          <p>
            نوفر توصيل يومي لجزيرة الريم من الساعة 9 صباحاً حتى 10 مساءً. الطلبات قبل الساعة 12 ظهراً تصل في نفس اليوم. يمكنك أيضاً جدولة التوصيل لأي وقت يناسبك. اتصل على 023339111 أو أرسل عبر واتساب 0566808565.
          </p>
          <p>
            بالإضافة لجزيرة الريم، نخدم أيضاً المناطق المجاورة مثل <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">مدينة خليفة</Link>، والسعديات. تعرف على جميع مناطق التوصيل في <Link to="/butcher-abu-dhabi" className="text-primary hover:underline">صفحة ملحمة أبوظبي</Link>.
          </p>
          <h3 className="text-xl font-semibold text-foreground">زُرنا في فرعنا</h3>
          <p>
            فرعنا في برج الهنا بالكورنيش قريب جداً من جزيرة الريم — أقل من 10 دقائق بالسيارة. يسعدنا استقبالك في أي وقت خلال أوقات العمل. شاهد موقعنا على <Link to="/contact" className="text-primary hover:underline">صفحة التواصل</Link>.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Al Saraya's Service for Al Reem Island Residents</h2>
          <p>
            Al Reem Island is one of Abu Dhabi's most prestigious residential areas, and at Al Saraya Butchery we're proud to offer exceptional meat delivery service to residents of this upscale island. We deliver to all Al Reem Island towers including Sun & Sky Towers, Marina Square, Shams Abu Dhabi, and all residential complexes.
          </p>
          <p>
            We understand the needs of Al Reem Island residents — local families and international expats seeking the finest fresh halal meat. That's why we offer a diverse selection including <Link to="/beef-abu-dhabi" className="text-primary hover:underline">premium beef</Link>, <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">fresh lamb</Link>, <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">daily halal chicken</Link>, and <Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">authentic Wagyu</Link>.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Our Service Highlights for Al Reem</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Fast delivery — within 45-60 minutes</li>
            <li>Refrigerated packaging preserving freshness</li>
            <li>Easy ordering via WhatsApp or website</li>
            <li>Cash or card payment on delivery</li>
            <li>Free delivery for orders over AED 150</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Most Popular Products on Al Reem</h3>
          <p>
            Al Reem residents prefer <Link to="/shop/ready-to-grill" className="text-primary hover:underline">ready-to-grill BBQ meats</Link> for balcony barbecues and weekly <Link to="/shop/boxes" className="text-primary hover:underline">family meat boxes</Link>. <Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">Marinated grill meats</Link> and premium steaks are our top sellers in the area.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Delivery Times for Al Reem Island</h2>
          <p>
            We offer daily delivery to Al Reem Island from 9 AM to 10 PM. Orders placed before 12 PM arrive same day. You can also schedule delivery at your convenience. Call 023339111 or WhatsApp 0566808565.
          </p>
          <p>
            In addition to Al Reem Island, we serve nearby areas like <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, and Saadiyat. See all delivery areas on our <Link to="/butcher-abu-dhabi" className="text-primary hover:underline">Abu Dhabi butcher page</Link>.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Visit Our Branch</h3>
          <p>
            Our Al Hana Tower branch on the Corniche is just 10 minutes from Al Reem Island by car. We'd love to welcome you anytime during business hours. See our location on the <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Do you deliver meat to Al Reem Island?", answer: "Yes, Al Saraya Butchery delivers fresh halal meat daily to all towers and complexes on Al Reem Island within 45-60 minutes." },
      { question: "What is the minimum order for Al Reem Island delivery?", answer: "There is no minimum order. Orders over AED 150 qualify for free delivery. Smaller orders may have a nominal delivery charge." },
      { question: "Can I schedule delivery to Al Reem Island?", answer: "Yes, you can schedule delivery for any time between 9 AM and 10 PM. Contact us via WhatsApp at 0566808565 to schedule." },
      { question: "How far is Al Saraya from Al Reem Island?", answer: "Our main branch at Al Hana Tower on the Corniche is less than 10 minutes from Al Reem Island by car." },
    ]}
  />
);

export default ButcherAlReemIslandPage;
