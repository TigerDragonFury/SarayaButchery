import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const ButcherAlRahaPage = () => (
  <SEOLandingPage
    slug="butcher-al-raha"
    titleAr="ملحمة الراحة أبوظبي | توصيل لحوم"
    titleEn="Butcher Al Raha Abu Dhabi | Meat Delivery"
    descriptionAr="أفضل ملحمة تخدم منطقة الراحة أبوظبي. لحوم حلال طازجة، ستيك فاخر، ومشاوي جاهزة مع توصيل سريع يومي. ملحمة السرايا."
    descriptionEn="Best butcher serving Al Raha area Abu Dhabi. Fresh halal meat, premium steaks, and ready BBQ with fast daily delivery. Al Saraya Butchery."
    keywords="butcher Al Raha, meat delivery Al Raha, halal butcher Al Raha Abu Dhabi, ملحمة الراحة, توصيل لحوم الراحة, جزار الراحة أبوظبي"
    productData={{ name: "Fresh Meat Delivery Al Raha", category: "Meat Delivery", description: "Fresh halal meat delivery to Al Raha area Abu Dhabi. Beef, lamb, chicken and BBQ meats.", priceLow: 25, priceHigh: 350, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770649601925-xvz21r.webp" }}
    h1Ar="ملحمة الراحة أبوظبي — لحوم طازجة يومياً"
    h1En="Butcher for Al Raha — Daily Fresh Meat Delivery"
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">خدمة ملحمة السرايا لمنطقة الراحة</h2>
          <p>
            منطقة الراحة في أبوظبي تتميز بمجمعاتها السكنية الراقية وقربها من شاطئ الراحة ومركز ياس. في ملحمة السرايا نقدم خدمة توصيل لحوم متميزة لسكان الراحة — لحوم طازجة حلال يومياً، تقطيع احترافي، وتتبيلات شرقية أصيلة.
          </p>
          <p>
            نوصل إلى جميع مناطق الراحة بما فيها الراحة بيتش، الراحة غاردنز، الراحة مول المحيط، والمناطق المجاورة. تشكيلتنا تشمل <Link to="/beef-abu-dhabi" className="text-primary hover:underline">لحوم بقرية فاخرة</Link>، <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">غنم طازج</Link>، <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">دجاج يومي</Link>، <Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">واغيو</Link>، و<Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">لحوم مشاوي جاهزة</Link>.
          </p>
          <h3 className="text-xl font-semibold text-foreground">مميزات الخدمة في الراحة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>توصيل سريع خلال 45-75 دقيقة</li>
            <li>تغليف مبرّد احترافي</li>
            <li>طلب سهل عبر واتساب 0566808565</li>
            <li>دفع نقدي أو بطاقة عند التسليم</li>
            <li>توصيل مجاني فوق 150 درهم</li>
            <li>عروض أسبوعية خاصة</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">شوي على شاطئ الراحة</h3>
          <p>
            شاطئ الراحة من أجمل مواقع الشوي في أبوظبي. جهّز حفلة شوي مثالية مع <Link to="/shop/ready-to-grill" className="text-primary hover:underline">لحوم المشاوي الجاهزة</Link> من ملحمة السرايا — شيش طاووق، كباب، تكا، وستيك فاخر. نوفر أيضاً <Link to="/shop/boxes" className="text-primary hover:underline">بوكسات شوي عائلية</Link> متكاملة.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">التوصيل والطلب</h2>
          <p>
            نوصل يومياً للراحة من 9 صباحاً حتى 10 مساءً. الطلبات الصباحية تصل في نفس اليوم. نخدم أيضاً المناطق القريبة — <Link to="/butcher-khalifa-city" className="text-primary hover:underline">مدينة خليفة</Link>، <Link to="/butcher-al-reem-island" className="text-primary hover:underline">جزيرة الريم</Link>، ومدينة محمد بن زايد.
          </p>
          <h3 className="text-xl font-semibold text-foreground">خدمة المناسبات</h3>
          <p>
            نوفر خدمة <Link to="/catering" className="text-primary hover:underline">تموين مناسبات</Link> متكاملة لسكان الراحة. أعراس، حفلات عيد ميلاد، تجمعات عائلية — فريقنا يتولى التحضير الكامل.
          </p>
          <h3 className="text-xl font-semibold text-foreground">زُرنا في فرع الكورنيش</h3>
          <p>
            فرعنا الرئيسي في <Link to="/contact" className="text-primary hover:underline">برج الهنا بالكورنيش</Link> على بعد 25 دقيقة من الراحة. تسوق من <Link to="/products" className="text-primary hover:underline">متجرنا الإلكتروني</Link> أو اقرأ <Link to="/blog" className="text-primary hover:underline">مدونتنا</Link> للمزيد من الوصفات والنصائح.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Al Saraya's Service for Al Raha Area</h2>
          <p>
            Al Raha in Abu Dhabi is known for its upscale residential communities, proximity to Al Raha Beach, and Yas Center. At Al Saraya Butchery, we offer premium meat delivery to Al Raha residents — daily fresh halal meat, professional cutting, and authentic Middle Eastern marinades.
          </p>
          <p>
            We deliver to all Al Raha areas including Al Raha Beach, Al Raha Gardens, Al Raha Mall, and surrounding neighborhoods. Our selection includes <Link to="/beef-abu-dhabi" className="text-primary hover:underline">premium beef</Link>, <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">fresh lamb</Link>, <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">daily chicken</Link>, <Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">Wagyu</Link>, and <Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">ready-to-grill BBQ meats</Link>.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Service Highlights for Al Raha</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Fast delivery within 45-75 minutes</li>
            <li>Professional refrigerated packaging</li>
            <li>Easy ordering via WhatsApp 0566808565</li>
            <li>Cash or card payment on delivery</li>
            <li>Free delivery over AED 150</li>
            <li>Weekly special offers</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">BBQ at Al Raha Beach</h3>
          <p>
            Al Raha Beach is one of Abu Dhabi's best BBQ spots. Set up the perfect barbecue with <Link to="/shop/ready-to-grill" className="text-primary hover:underline">ready-to-grill meats</Link> from Al Saraya — shish tawook, kebab, tikka, and premium steak. We also offer complete <Link to="/shop/boxes" className="text-primary hover:underline">family BBQ boxes</Link>.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Delivery and Ordering</h2>
          <p>
            We deliver daily to Al Raha from 9 AM to 10 PM. Morning orders arrive same day. We also serve nearby areas — <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem Island</Link>, and MBZ City.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Event Catering</h3>
          <p>
            We offer complete <Link to="/catering" className="text-primary hover:underline">event catering</Link> for Al Raha residents. Weddings, birthday parties, family gatherings — our team handles full preparation.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Visit Our Corniche Branch</h3>
          <p>
            Our main branch at <Link to="/contact" className="text-primary hover:underline">Al Hana Tower on the Corniche</Link> is 25 minutes from Al Raha. Shop from our <Link to="/products" className="text-primary hover:underline">online store</Link> or read our <Link to="/blog" className="text-primary hover:underline">blog</Link> for recipes and tips.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Do you deliver meat to Al Raha?", answer: "Yes, Al Saraya Butchery delivers fresh halal meat daily to Al Raha Beach, Al Raha Gardens, and all surrounding areas within 45-75 minutes." },
      { question: "Is delivery to Al Raha free?", answer: "Delivery is free for orders over AED 150. A small delivery charge applies for smaller orders." },
      { question: "Can I order BBQ meat for Al Raha Beach?", answer: "Yes! We offer ready-to-grill BBQ meats and family BBQ boxes perfect for Al Raha Beach barbecues." },
      { question: "What areas near Al Raha do you serve?", answer: "We serve Al Raha and nearby areas including Khalifa City, MBZ City, Al Reem Island, and Saadiyat Island." },
    ]}
  />
);

export default ButcherAlRahaPage;
