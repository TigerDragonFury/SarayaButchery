import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const ButcherKhalifaCityPage = () => (
  <SEOLandingPage
    slug="butcher-khalifa-city"
    titleAr="ملحمة مدينة خليفة | توصيل لحوم طازجة"
    titleEn="Butcher Khalifa City | Fresh Meat Delivery"
    descriptionAr="أفضل ملحمة تخدم مدينة خليفة أ و ب. لحوم حلال طازجة، دجاج، غنم، وبقري مع توصيل سريع يومي. ملحمة السرايا أبوظبي."
    descriptionEn="Best butcher serving Khalifa City A & B. Fresh halal meat, chicken, lamb, and beef with fast daily delivery. Al Saraya Butchery Abu Dhabi."
    keywords="butcher Khalifa City, meat delivery Khalifa City, halal butcher Khalifa City Abu Dhabi, ملحمة مدينة خليفة, توصيل لحوم خليفة, جزار مدينة خليفة"
    productData={{ name: "Fresh Meat Delivery Khalifa City", category: "Meat Delivery", description: "Daily fresh halal meat delivery to Khalifa City A & B Abu Dhabi.", priceLow: 25, priceHigh: 350, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770648692449-ndfd.webp" }}
    h1Ar="ملحمة مدينة خليفة — لحوم طازجة يومياً"
    h1En="Butcher for Khalifa City — Daily Fresh Meat"
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">خدمة ملحمة السرايا لمدينة خليفة</h2>
          <p>
            مدينة خليفة هي من أكبر المناطق السكنية في أبوظبي ومن أكثرها طلباً لخدمات توصيل اللحوم الطازجة. في ملحمة السرايا نقدم خدمة توصيل يومية لمدينة خليفة أ ومدينة خليفة ب، تشمل جميع المجمعات السكنية والفلل.
          </p>
          <p>
            نفهم أن عائلات مدينة خليفة تبحث عن الجودة والتنوع والأسعار المناسبة. لذلك نوفر تشكيلة شاملة من <Link to="/beef-abu-dhabi" className="text-primary hover:underline">اللحوم البقرية</Link>، <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">لحوم الغنم</Link>، <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">الدجاج الطازج</Link>، و<Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">لحوم المشاوي الجاهزة</Link> بأسعار تنافسية.
          </p>
          <h3 className="text-xl font-semibold text-foreground">لماذا يختارنا سكان خليفة؟</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>توصيل يومي من 9 صباحاً حتى 10 مساءً</li>
            <li>لحوم حلال 100٪ طازجة يومياً</li>
            <li>تقطيع احترافي حسب الطلب</li>
            <li>أسعار تنافسية مع عروض أسبوعية</li>
            <li>توصيل مجاني للطلبات فوق 150 درهم</li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">بوكسات عائلية</Link> بأحجام مختلفة</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">المنتجات الأكثر طلباً</h3>
          <p>
            سكان مدينة خليفة يفضلون بوكسات اللحوم الأسبوعية التي توفر تشكيلة متنوعة بسعر مميز. كما أن لحوم المشاوي وشيش الطاووق من المنتجات الأكثر طلباً خاصة في عطلات نهاية الأسبوع.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">التوصيل إلى مدينة خليفة</h2>
          <p>
            نوصل إلى جميع أحياء مدينة خليفة — القطاعات A وB، الفلل، والمجمعات السكنية. وقت التوصيل المعتاد 45-90 دقيقة حسب وقت الطلب. نقبل الدفع نقداً وبالبطاقة.
          </p>
          <p>
            نخدم أيضاً المناطق المجاورة لمدينة خليفة مثل <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، الشامخة، ومدينة شخبوط. تواصل معنا على واتساب 0566808565 لأي استفسار.
          </p>
          <h3 className="text-xl font-semibold text-foreground">طلب المناسبات والذبائح</h3>
          <p>
            نوفر ذبائح كاملة وخدمة <Link to="/catering" className="text-primary hover:underline">تموين مناسبات</Link> لسكان مدينة خليفة. سواء كانت مناسبة عائلية صغيرة أو حفلة كبيرة، فريقنا يتولى كل التفاصيل.
          </p>
          <h3 className="text-xl font-semibold text-foreground">زُرنا أو اطلب أونلاين</h3>
          <p>
            فرعنا في <Link to="/contact" className="text-primary hover:underline">الكورنيش</Link> على بعد 20 دقيقة من مدينة خليفة. يمكنك أيضاً التسوق من <Link to="/products" className="text-primary hover:underline">متجرنا الإلكتروني</Link> أو تصفح <Link to="/blog" className="text-primary hover:underline">مدونتنا</Link> لوصفات ونصائح الطبخ.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Al Saraya's Service for Khalifa City</h2>
          <p>
            Khalifa City is one of Abu Dhabi's largest residential areas and one with the highest demand for fresh meat delivery. At Al Saraya Butchery, we provide daily delivery to Khalifa City A and B, covering all residential complexes and villas.
          </p>
          <p>
            We understand Khalifa City families seek quality, variety, and fair prices. That's why we offer a comprehensive selection of <Link to="/beef-abu-dhabi" className="text-primary hover:underline">beef</Link>, <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">lamb</Link>, <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">fresh chicken</Link>, and <Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">ready-to-grill meats</Link> at competitive prices.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Why Khalifa City Chooses Us</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Daily delivery from 9 AM to 10 PM</li>
            <li>100% halal certified fresh daily</li>
            <li>Professional custom cutting</li>
            <li>Competitive prices with weekly deals</li>
            <li>Free delivery for orders over AED 150</li>
            <li><Link to="/shop/boxes" className="text-primary hover:underline">Family boxes</Link> in various sizes</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Delivery to Khalifa City</h2>
          <p>
            We deliver to all Khalifa City neighborhoods — Sectors A and B, villas, and residential compounds. Typical delivery time is 45-90 minutes depending on order time. We accept cash and card.
          </p>
          <p>
            We also serve areas near Khalifa City like <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, Al Shamkha, and Shakhbout City. Contact us on WhatsApp 0566808565 for inquiries.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Events and Carcass Orders</h3>
          <p>
            We provide whole carcasses and <Link to="/catering" className="text-primary hover:underline">event catering</Link> for Khalifa City residents. Whether a small family gathering or large celebration, our team handles every detail.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Visit or Order Online</h3>
          <p>
            Our <Link to="/contact" className="text-primary hover:underline">Corniche branch</Link> is 20 minutes from Khalifa City. Shop from our <Link to="/products" className="text-primary hover:underline">online store</Link> or browse our <Link to="/blog" className="text-primary hover:underline">blog</Link> for recipes and tips.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Do you deliver meat to Khalifa City?", answer: "Yes, Al Saraya Butchery delivers fresh halal meat daily to Khalifa City A and B within 45-90 minutes." },
      { question: "Is delivery to Khalifa City free?", answer: "Delivery is free for orders over AED 150. A nominal delivery charge applies for smaller orders." },
      { question: "What time do you deliver to Khalifa City?", answer: "We deliver daily from 9 AM to 10 PM. Orders before 12 PM arrive same day." },
      { question: "Do you serve Khalifa City B as well?", answer: "Yes, we deliver to both Khalifa City A and B, covering all villas and residential complexes." },
    ]}
  />
);

export default ButcherKhalifaCityPage;
