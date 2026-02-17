import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const LambMeatAbuDhabiPage = () => (
  <SEOLandingPage
    slug="lamb-meat-abu-dhabi"
    titleAr="لحم غنم أبوظبي | أجود لحوم الخروف"
    titleEn="Lamb Meat Abu Dhabi | Premium Lamb Cuts UAE"
    descriptionAr="أجود أنواع لحم الغنم والخروف في أبوظبي. كتف، فخذ، أضلاع، ريش، ولحم مفروم غنم. حلال 100٪ مع توصيل سريع. ملحمة السرايا."
    descriptionEn="Finest lamb and mutton in Abu Dhabi. Shoulder, leg, ribs, rack, and minced lamb. 100% halal with fast delivery. Al Saraya Butchery."
    keywords="lamb Abu Dhabi, lamb meat UAE, lamb delivery Abu Dhabi, lamb chops Abu Dhabi, لحم غنم أبوظبي, خروف أبوظبي, لحم ضأن الإمارات"
    h1Ar="أجود لحوم الغنم في أبوظبي — ملحمة السرايا"
    h1En="Premium Lamb Meat in Abu Dhabi — Al Saraya Butchery"
    productData={{ name: "Premium Lamb Meat", description: "Fresh halal lamb cuts - shoulder, leg, ribs, rack, minced lamb. Daily fresh from Al Saraya Butchery Abu Dhabi.", image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770798490361-hn515l.webp", priceLow: 45, priceHigh: 180, category: "Lamb Meat" }}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لحم غنم طازج في أبوظبي</h2>
          <p>
            لحم الغنم هو أساس المطبخ العربي والخليجي، وفي ملحمة السرايا نقدم أجود أنواع لحوم الغنم الحلال في أبوظبي. نستورد لحم الغنم من أفضل المصادر الأردنية والأسترالية والنيوزيلندية لنضمن لعملائنا أعلى جودة ممكنة. كل ذبيحة تخضع لفحص بيطري دقيق وتُذبح وفق الشريعة الإسلامية.
          </p>
          <p>
            نقدم تشكيلة واسعة من قطعيات الغنم تناسب جميع الأطباق — من الكبسة والمندي إلى المشاوي والمقلوبة. جزارونا المحترفون يقطعون اللحم حسب طلبك بالوزن والسماكة المطلوبة. كما نوفر ذبائح كاملة وأنصاف ذبائح للمناسبات الكبيرة.
          </p>
          <h3 className="text-xl font-semibold text-foreground">قطعيات لحم الغنم المتوفرة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>فخذ غنم — كامل أو شرائح</li>
            <li>كتف غنم — مثالي للطبخ البطيء</li>
            <li><Link to="/products" className="text-primary hover:underline">ريش غنم (لامب تشوبس)</Link> — للشوي الفاخر</li>
            <li>أضلاع غنم — كاملة ومقطعة</li>
            <li>رقبة غنم — للمرق والشوربات</li>
            <li>موزة غنم — للطبخ في الفرن</li>
            <li>لحم غنم مفروم — للكبة والكفتة</li>
            <li>لحم غنم مكعبات — للكبسة والبرياني</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لماذا لحم غنم السرايا الأفضل؟</h2>
          <p>
            نختار لحم الغنم من مصادر معروفة بجودتها العالية. الغنم الأردني البلدي معروف بنكهته القوية المميزة. الغنم الأسترالي يتميز بطراوته وقلة دهونه. نوفر كلا النوعين لنلبي تفضيلات عملائنا المتنوعة في أبوظبي.
          </p>
          <h3 className="text-xl font-semibold text-foreground">ذبائح كاملة للمناسبات</h3>
          <p>
            نوفر ذبائح غنم كاملة للمناسبات والأعياد. الذبيحة تأتي مقطعة ومغلفة حسب طلبك. خدمة <Link to="/catering" className="text-primary hover:underline">تموين المناسبات</Link> متاحة أيضاً مع تجهيز كامل للطبخ.
          </p>
          <h3 className="text-xl font-semibold text-foreground">وصفات لحم الغنم</h3>
          <p>
            اكتشف وصفات لحم الغنم المميزة في <Link to="/recipes" className="text-primary hover:underline">قسم الوصفات</Link> على موقعنا. من الكبسة السعودية إلى المندي اليمني وريش الغنم المشوية، نقدم لك وصفات سهلة ومضمونة النتائج.
          </p>
          <h3 className="text-xl font-semibold text-foreground">توصيل لحم غنم أبوظبي</h3>
          <p>
            نوصل لجميع مناطق أبوظبي — <Link to="/butcher-al-reem-island" className="text-primary hover:underline">الريم</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">خليفة</Link>، <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، السعديات، المصفح، ومحمد بن زايد. اطلب عبر واتساب 0566808565 أو تسوق <Link to="/shop/lamb" className="text-primary hover:underline">لحوم الغنم أونلاين</Link>.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Fresh Lamb Meat in Abu Dhabi</h2>
          <p>
            Lamb is a cornerstone of Arabic and Gulf cuisine, and at Al Saraya Butchery we offer the finest halal lamb in Abu Dhabi. We source our lamb from the best Jordanian, Australian, and New Zealand suppliers to guarantee our customers the highest possible quality. Every carcass undergoes thorough veterinary inspection and is slaughtered according to Islamic law.
          </p>
          <p>
            We offer a wide variety of lamb cuts suited to every dish — from kabsa and mandi to grills and maqluba. Our professional butchers cut meat to your specifications. We also provide whole and half carcasses for large events.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Available Lamb Cuts</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Lamb Leg — whole or sliced</li>
            <li>Lamb Shoulder — ideal for slow cooking</li>
            <li><Link to="/products" className="text-primary hover:underline">Lamb Chops (Rack)</Link> — for premium grilling</li>
            <li>Lamb Ribs — whole and cut</li>
            <li>Lamb Neck — for broth and soups</li>
            <li>Lamb Shank — for oven roasting</li>
            <li>Minced Lamb — for kibbeh and kofta</li>
            <li>Lamb Cubes — for kabsa and biryani</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why Al Saraya's Lamb is the Best</h2>
          <p>
            We select our lamb from sources renowned for high quality. Jordanian lamb is known for its distinctive strong flavor. Australian lamb is prized for its tenderness and leanness. We offer both types to meet our Abu Dhabi customers' diverse preferences.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Whole Carcass for Events</h3>
          <p>
            We provide whole lamb carcasses for events and holidays, cut and packaged to your specifications. <Link to="/catering" className="text-primary hover:underline">Event catering</Link> is also available with complete cooking preparation.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Lamb Recipes</h3>
          <p>
            Discover our lamb recipes in the <Link to="/recipes" className="text-primary hover:underline">recipes section</Link>. From Saudi kabsa to Yemeni mandi and grilled lamb chops — easy, foolproof recipes for every occasion.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Lamb Delivery in Abu Dhabi</h3>
          <p>
            We deliver across all Abu Dhabi areas — <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, Saadiyat, Musaffah, and MBZ City. Order via WhatsApp 0566808565 or <Link to="/shop/lamb" className="text-primary hover:underline">shop lamb online</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Where to buy fresh lamb in Abu Dhabi?", answer: "Al Saraya Butchery offers daily fresh halal lamb from Jordanian, Australian, and New Zealand sources with same-day delivery across Abu Dhabi." },
      { question: "Do you sell whole lamb carcasses?", answer: "Yes, we offer whole and half lamb carcasses for events, holidays, and large gatherings. Custom cutting and packaging available." },
      { question: "What lamb cuts are best for grilling?", answer: "Lamb chops (rack) and lamb ribs are the most popular for grilling. We also offer marinated lamb tikka skewers ready to grill." },
      { question: "Is your lamb halal?", answer: "Yes, 100% of our lamb is halal certified, slaughtered according to Islamic Sharia law from approved suppliers." },
      { question: "Do you deliver lamb to MBZ City?", answer: "Yes, we deliver to Mohammed Bin Zayed City, Khalifa City, Al Reem, Al Raha, and all Abu Dhabi areas." },
    ]}
  />
);

export default LambMeatAbuDhabiPage;
