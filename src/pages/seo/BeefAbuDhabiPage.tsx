import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const BeefAbuDhabiPage = () => (
  <SEOLandingPage
    slug="beef-abu-dhabi"
    titleAr="لحم بقري أبوظبي | أجود لحوم البقر"
    titleEn="Beef Abu Dhabi | Premium Beef Cuts UAE"
    descriptionAr="أجود أنواع اللحم البقري في أبوظبي. ستيك، تندرلوين، ريب آي، لحم مفروم، ومكعبات بقري طازجة. توصيل سريع من ملحمة السرايا."
    descriptionEn="Finest beef cuts in Abu Dhabi. Steak, tenderloin, ribeye, minced beef, and fresh beef cubes. Fast delivery from Al Saraya Butchery."
    keywords="beef Abu Dhabi, beef delivery UAE, steak Abu Dhabi, ribeye Abu Dhabi, tenderloin UAE, لحم بقري أبوظبي, ستيك أبوظبي, لحم بقر الإمارات"
    h1Ar="أجود لحوم البقر في أبوظبي — ملحمة السرايا"
    h1En="Premium Beef Cuts in Abu Dhabi — Al Saraya Butchery"
    productData={{ name: "Premium Beef Cuts", description: "Fresh halal beef - ribeye, tenderloin, striploin, minced beef, T-bone steak. Daily fresh from Al Saraya Butchery Abu Dhabi.", image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770737175965-18ib.webp", priceLow: 35, priceHigh: 250, category: "Beef Meat" }}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لحم بقري فاخر في أبوظبي</h2>
          <p>
            ملحمة السرايا تقدم أجود أنواع اللحم البقري الحلال في أبوظبي. نستورد لحومنا البقرية من أفضل المزارع الأسترالية والبرازيلية والأمريكية المعتمدة. كل قطعة تخضع لفحوصات جودة صارمة لضمان حصولك على أفضل لحم بقري في الإمارات.
          </p>
          <p>
            سواء كنت تبحث عن ستيك ريب آي فاخر لعشاء خاص، لحم مفروم لوصفات يومية، أو قطعيات خاصة مثل <Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">الواغيو</Link> والتوماهوك — نوفر كل ما تحتاجه تحت سقف واحد. جزارونا المحترفون يقطعون اللحم حسب طلبك بالسماكة والوزن المطلوب.
          </p>
          <h3 className="text-xl font-semibold text-foreground">قطعيات اللحم البقري المتوفرة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/products" className="text-primary hover:underline">ريب آي ستيك</Link> — القطعة الأكثر شعبية للشوي</li>
            <li>تندرلوين (فيليه) — أطرى قطعة بقرية</li>
            <li>ستريب لوين — نكهة غنية وتمشيح مثالي</li>
            <li>تي بون ستيك — قطعتين في واحدة</li>
            <li>توماهوك — ستيك العظم الطويل المميز</li>
            <li>لحم بقري مفروم — ناعم وخشن</li>
            <li>مكعبات بقري — للطبخ والكاري والستروغونوف</li>
            <li>لحم بقري شرائح رفيعة — شاورما وفاهيتا</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">مصادر لحومنا البقرية</h2>
          <p>
            نفخر باختيار مصادر لحومنا بعناية فائقة. لحم بقري أسترالي أنغوس معروف بطراوته ونكهته الغنية. لحم بقري برازيلي ممتاز من مراعي طبيعية. ولحم بقري أمريكي USDA Choice و Prime لعشاق الستيك الفاخر.
          </p>
          <h3 className="text-xl font-semibold text-foreground">دليل اختيار قطعة الستيك</h3>
          <p>
            اقرأ <Link to="/blog/how-to-choose-beef-cuts" className="text-primary hover:underline">دليلنا الشامل لاختيار قطعيات اللحم البقري</Link> لمساعدتك في اختيار القطعة المناسبة. ريب آي للنكهة الغنية، تندرلوين للطراوة، ستريب لوين للتوازن المثالي.
          </p>
          <h3 className="text-xl font-semibold text-foreground">بوكسات لحم بقري</h3>
          <p>
            نقدم <Link to="/shop/boxes" className="text-primary hover:underline">بوكسات لحم بقري متنوعة</Link> بأحجام تناسب العائلات. تشمل تشكيلة من القطعيات المختلفة بسعر مميز. الخيار الاقتصادي الذكي للعائلات التي تبحث عن الجودة والتوفير.
          </p>
          <h3 className="text-xl font-semibold text-foreground">توصيل لحم بقري في أبوظبي</h3>
          <p>
            نوصل لجميع مناطق أبوظبي بما فيها <Link to="/butcher-al-reem-island" className="text-primary hover:underline">الريم</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">خليفة</Link>، <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، والسعديات. تواصل معنا عبر واتساب 0566808565 أو زُرنا في <Link to="/contact" className="text-primary hover:underline">فرعنا</Link> بالكورنيش.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Premium Beef in Abu Dhabi</h2>
          <p>
            Al Saraya Butchery offers the finest halal beef in Abu Dhabi. We source our beef from the best Australian, Brazilian, and American certified farms. Every cut undergoes strict quality checks to ensure you get the best beef in the UAE.
          </p>
          <p>
            Whether you're looking for a premium ribeye steak for a special dinner, minced beef for daily recipes, or specialty cuts like <Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">Wagyu</Link> and Tomahawk — we have everything under one roof. Our professional butchers cut meat to your exact specifications.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Available Beef Cuts</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/products" className="text-primary hover:underline">Ribeye Steak</Link> — the most popular grilling cut</li>
            <li>Tenderloin (Fillet) — the most tender beef cut</li>
            <li>Striploin — rich flavor with ideal marbling</li>
            <li>T-Bone Steak — two cuts in one</li>
            <li>Tomahawk — the iconic long-bone steak</li>
            <li>Minced Beef — fine and coarse</li>
            <li>Beef Cubes — for stews, curry, and stroganoff</li>
            <li>Thin Beef Slices — for shawarma and fajita</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Our Beef Sources</h2>
          <p>
            We pride ourselves on carefully selecting our beef sources. Australian Angus beef known for its tenderness and rich flavor. Premium Brazilian beef from natural pastures. And American USDA Choice and Prime beef for steak enthusiasts.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Steak Selection Guide</h3>
          <p>
            Read our <Link to="/blog/how-to-choose-beef-cuts" className="text-primary hover:underline">comprehensive beef cuts guide</Link> to help you choose the right cut. Ribeye for rich flavor, tenderloin for tenderness, striploin for the perfect balance.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Beef Boxes</h3>
          <p>
            We offer <Link to="/shop/boxes" className="text-primary hover:underline">various beef boxes</Link> sized for families. Each includes an assortment of different cuts at a special price — the smart economical choice for quality-conscious families.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Beef Delivery in Abu Dhabi</h3>
          <p>
            We deliver across all Abu Dhabi areas including <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, and Saadiyat. Contact us via WhatsApp 0566808565 or visit our <Link to="/contact" className="text-primary hover:underline">Corniche branch</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Where to buy fresh beef in Abu Dhabi?", answer: "Al Saraya Butchery offers daily fresh halal beef from Australian, Brazilian, and American sources with same-day delivery across Abu Dhabi." },
      { question: "What beef cuts are available at Al Saraya?", answer: "We offer ribeye, tenderloin, striploin, T-bone, Tomahawk, minced beef, beef cubes, and specialty cuts including Wagyu. Custom cutting available." },
      { question: "Is your beef halal certified?", answer: "Yes, all our beef is 100% halal certified from approved suppliers, slaughtered according to Islamic guidelines." },
      { question: "Do you deliver beef to Khalifa City?", answer: "Yes, we deliver to Khalifa City, Al Reem Island, Al Raha, Saadiyat, MBZ City, and all Abu Dhabi areas with same-day delivery." },
      { question: "What is the best beef cut for grilling?", answer: "Ribeye is the most popular for grilling due to its marbling and flavor. For tenderness, choose tenderloin. For value, try striploin or T-bone." },
    ]}
  />
);

export default BeefAbuDhabiPage;
