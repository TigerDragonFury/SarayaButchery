import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const ChickenAbuDhabiPage = () => (
  <SEOLandingPage
    slug="chicken-abu-dhabi"
    titleAr="دجاج طازج أبوظبي | أفضل دجاج حلال"
    titleEn="Fresh Chicken Abu Dhabi | Halal Chicken UAE"
    descriptionAr="دجاج طازج حلال يومياً في أبوظبي. صدور، أفخاذ، أجنحة، ودجاج كامل. شيش طاووق وفاهيتا جاهزة. توصيل سريع من ملحمة السرايا."
    descriptionEn="Daily fresh halal chicken in Abu Dhabi. Breast, thigh, wings, and whole chicken. Ready shish tawook and fajita. Fast delivery from Al Saraya."
    keywords="chicken Abu Dhabi, fresh chicken UAE, halal chicken Abu Dhabi, shish tawook Abu Dhabi, دجاج أبوظبي, دجاج طازج, شيش طاووق أبوظبي"
    h1Ar="دجاج طازج حلال في أبوظبي — ملحمة السرايا"
    h1En="Fresh Halal Chicken in Abu Dhabi — Al Saraya Butchery"
    productData={{ name: "Fresh Halal Chicken", description: "Daily fresh halal chicken - breast, thigh, wings, whole chicken, shish tawook, fajita. Al Saraya Butchery Abu Dhabi.", image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770644414707-ihbet.webp", priceLow: 18, priceHigh: 65, category: "Chicken" }}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">دجاج طازج يومياً في أبوظبي</h2>
          <p>
            في ملحمة السرايا نقدم أجود أنواع الدجاج الطازج الحلال يومياً. دجاجنا محلي الإنتاج من أفضل المزارع المعتمدة في الإمارات، يُذبح يومياً وفق الشريعة الإسلامية ويصل إليك بأقصى درجات الطزاجة. نوفر جميع القطعيات — صدور، أفخاذ، أجنحة، ودجاج كامل — بالإضافة إلى منتجات دجاج جاهزة للطبخ والشوي.
          </p>
          <p>
            ما يميز دجاج ملحمة السرايا هو الطزاجة المطلقة والتنظيف الاحترافي. كل دجاجة تُنظف وتُقطع بعناية حسب طلبك. نقدم أيضاً خدمة التتبيل بوصفات شرقية أصيلة — شيش طاووق بالثوم والليمون، فاهيتا مكسيكية، أجنحة حارة، ودجاج تندوري.
          </p>
          <h3 className="text-xl font-semibold text-foreground">منتجات الدجاج المتوفرة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>دجاج كامل — طازج أو متبل</li>
            <li>صدور دجاج — شرائح أو قطع</li>
            <li>أفخاذ دجاج — مع العظم أو بدون</li>
            <li>أجنحة دجاج — متبلة جاهزة للشوي</li>
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">شيش طاووق</Link> — 5 تتبيلات مختلفة</li>
            <li>فاهيتا دجاج — شرائح متبلة جاهزة</li>
            <li>مكعبات دجاج — للطبخ والكاري</li>
            <li>دجاج مفروم — للكبة والسمبوسة</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">شيش طاووق ملحمة السرايا</h2>
          <p>
            شيش طاووق السرايا هو الأشهر في أبوظبي! نقدم 5 تتبيلات مختلفة — ثوم وليمون كلاسيكي، تركي بالبهارات، لبناني بالزبادي، حار بالفلفل، وكريمي بالجبنة. كل تتبيلة محضرة يومياً بمكونات طازجة بدون أي إضافات صناعية.
          </p>
          <h3 className="text-xl font-semibold text-foreground">صواني دجاج جاهزة للفرن</h3>
          <p>
            نقدم صواني دجاج جاهزة للفرن — صينية شيش طاووق، صينية أفخاذ متبلة، وصينية أجنحة حارة. كل ما عليك هو وضعها في الفرن! الحل المثالي للعائلات المشغولة التي تريد وجبة لذيذة بدون عناء التحضير.
          </p>
          <h3 className="text-xl font-semibold text-foreground">أسعار الدجاج في أبوظبي</h3>
          <p>
            نقدم أسعاراً تنافسية على جميع منتجات الدجاج. عروض خاصة على الكميات الكبيرة و<Link to="/shop/boxes" className="text-primary hover:underline">بوكسات الدجاج العائلية</Link>. تواصل معنا عبر واتساب 0566808565 لمعرفة الأسعار اليومية.
          </p>
          <h3 className="text-xl font-semibold text-foreground">توصيل دجاج في أبوظبي</h3>
          <p>
            نوصل لجميع مناطق أبوظبي — <Link to="/butcher-al-reem-island" className="text-primary hover:underline">الريم</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">خليفة</Link>، <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، والسعديات. اطلب الآن من <Link to="/products" className="text-primary hover:underline">متجرنا</Link> أو عبر واتساب.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Daily Fresh Chicken in Abu Dhabi</h2>
          <p>
            At Al Saraya Butchery, we offer the finest fresh halal chicken daily. Our chicken is locally sourced from the best certified UAE farms, slaughtered daily according to Islamic law and delivered to you at peak freshness. We provide all cuts — breast, thigh, wings, and whole chicken — plus ready-to-cook and grill chicken products.
          </p>
          <p>
            What sets Al Saraya's chicken apart is absolute freshness and professional cleaning. Each chicken is cleaned and cut carefully to your order. We also offer marination with authentic Middle Eastern recipes — garlic lemon shish tawook, Mexican fajita, spicy wings, and tandoori chicken.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Available Chicken Products</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Whole Chicken — fresh or marinated</li>
            <li>Chicken Breast — sliced or cubed</li>
            <li>Chicken Thighs — bone-in or boneless</li>
            <li>Chicken Wings — marinated ready to grill</li>
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">Shish Tawook</Link> — 5 different marinades</li>
            <li>Chicken Fajita — pre-marinated strips</li>
            <li>Chicken Cubes — for cooking and curry</li>
            <li>Minced Chicken — for kibbeh and sambousa</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Al Saraya's Famous Shish Tawook</h2>
          <p>
            Al Saraya's shish tawook is the most popular in Abu Dhabi! We offer 5 different marinades — classic garlic lemon, Turkish spiced, Lebanese yogurt, spicy chili, and creamy cheese. Every marinade is prepared daily with fresh ingredients and no artificial additives.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Oven-Ready Chicken Trays</h3>
          <p>
            We offer oven-ready chicken trays — shish tawook tray, marinated thighs, and spicy wings. Just pop them in the oven! The perfect solution for busy families wanting a delicious meal without preparation hassle.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Chicken Prices in Abu Dhabi</h3>
          <p>
            We offer competitive prices on all chicken products. Special deals on bulk orders and <Link to="/shop/boxes" className="text-primary hover:underline">family chicken boxes</Link>. Contact us via WhatsApp 0566808565 for daily prices.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Chicken Delivery in Abu Dhabi</h3>
          <p>
            We deliver across all Abu Dhabi areas — <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, and Saadiyat. Order now from our <Link to="/products" className="text-primary hover:underline">online store</Link> or via WhatsApp.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Where to buy fresh chicken in Abu Dhabi?", answer: "Al Saraya Butchery offers daily fresh halal chicken sourced from local UAE farms with same-day delivery across Abu Dhabi." },
      { question: "Do you offer marinated chicken?", answer: "Yes, we offer shish tawook in 5 marinades, fajita strips, spicy wings, and oven-ready chicken trays. All marinated with fresh ingredients daily." },
      { question: "Is your chicken halal?", answer: "Yes, all our chicken is 100% halal, sourced from certified farms and slaughtered according to Islamic guidelines." },
      { question: "Do you sell whole chicken?", answer: "Yes, we offer fresh whole chicken and marinated whole chicken. Custom cutting and cleaning available to your specifications." },
      { question: "What areas do you deliver chicken to?", answer: "We deliver to all Abu Dhabi areas including Al Reem Island, Khalifa City, Al Raha, Saadiyat, MBZ City, Musaffah, and more." },
    ]}
  />
);

export default ChickenAbuDhabiPage;
