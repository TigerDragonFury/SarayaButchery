import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";
import RamadanCountdown from "@/components/shared/RamadanCountdown";

const RamadanBBQBoxPage = () => (
  <SEOLandingPage
    slug="ramadan-bbq-box-abu-dhabi"
    titleAr="باقة شواء رمضان أبوظبي | بوكس مشاوي الإفطار"
    titleEn="Ramadan BBQ Box Abu Dhabi | Iftar Grill Pack UAE"
    descriptionAr="اطلب باقة شواء رمضان من ملحمة السرايا. تشكيلة مشاوي متنوعة جاهزة للشوي مع توصيل مبرّد لجميع مناطق أبوظبي."
    descriptionEn="Order Ramadan BBQ box from Al Saraya. Diverse grill selection ready for BBQ with refrigerated delivery across Abu Dhabi."
    keywords="Ramadan BBQ box Abu Dhabi, BBQ Ramadan box UAE, Iftar BBQ box UAE, باقة شواء رمضان, مشاوي رمضان أبوظبي, شوي إفطار, halal BBQ Ramadan, grill meat delivery Abu Dhabi"
    productData={{ name: "Ramadan BBQ Box Abu Dhabi", category: "BBQ Box", description: "Complete Ramadan BBQ box with marinated lamb chops, kebabs, shish tawook, wagyu burgers and more.", priceLow: 149, priceHigh: 499, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770734758379-ug8c6.webp" }}
    h1Ar="باقة شواء رمضان في أبوظبي — ملحمة السرايا"
    h1En="Ramadan BBQ Box in Abu Dhabi — Al Saraya Butchery"
    extraContent={<RamadanCountdown />}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">أفضل باقة شواء لسهرات رمضان</h2>
          <p>
            سهرات رمضان لها طعم خاص، وما أجمل أن تجتمع العائلة والأصدقاء حول شواء طازج بعد الإفطار. ملحمة السرايا تقدم لكم باقات شواء رمضان المتكاملة — كل ما تحتاجه في بوكس واحد جاهز للشوي مباشرة بدون أي تحضير إضافي.
          </p>
          <p>
            باقاتنا مصممة خصيصاً لسهرات رمضان، تتضمن تشكيلة متنوعة من أجود أنواع اللحوم المتبّلة بخلطات خاصة تناسب الذوق الخليجي والعربي. من <Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">لحوم الشوي الفاخرة</Link> إلى الدجاج المتبّل والكباب الجاهز.
          </p>
          <h3 className="text-xl font-semibold text-foreground">محتويات باقة شواء رمضان</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>ريش غنم متبّلة — 1 كيلو (8-10 قطع)</li>
            <li>كباب لحم مشكّل على أسياخ — 6 أسياخ</li>
            <li>شيش طاووق دجاج — 6 أسياخ</li>
            <li>برجر لحم واغيو — 4 قطع</li>
            <li>أجنحة دجاج متبّلة — 500 غرام</li>
            <li>كفتة مشوية — 500 غرام</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">تتبيلات رمضانية خاصة</h3>
          <p>
            كل قطعة لحم في باقة الشواء متبّلة بتتبيلة خاصة تم تطويرها من قبل طهاتنا المحترفين. نستخدم بهارات طبيعية 100٪ بدون أي مواد حافظة. التتبيلات تشمل: الطريقة اللبنانية بالثوم والليمون، الطريقة التركية بالزبادي والبهارات، والطريقة الخليجية بالبزار والليمون الأسود. يمكنك اختيار التتبيلة المفضلة لكل نوع لحم.
          </p>
          <p>
            الباقة تكفي 6-8 أشخاص وهي مثالية لسهرات رمضان العائلية أو تجمعات الأصدقاء. يمكن تخصيص الباقة حسب رغبتك — تواصل معنا وسنجهز لك باقة مخصصة.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لماذا باقة شواء السرايا؟</h2>
          <p>
            نحن لا نقدم مجرد لحوم — نقدم تجربة شوي متكاملة. كل باقة تأتي مع تعليمات الشوي المثالية لكل نوع لحم، درجات الحرارة المناسبة، ومدة الشوي للحصول على أفضل نتيجة. حتى لو لم تكن خبيراً في الشوي، باقتنا ستجعلك تبدو كمحترف.
          </p>
          <p>
            جميع اللحوم طازجة 100٪ وحلال معتمد. نستخدم لحوم بقري أسترالي وغنم أسترالي من أفضل المزارع المعتمدة. الدجاج طازج محلي يومي. كل منتج يخضع لفحص جودة صارم قبل التعبئة والتوصيل.
          </p>
          <h3 className="text-xl font-semibold text-foreground">أحجام الباقات المتوفرة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>باقة صغيرة (4-5 أشخاص) — بسعر تنافسي</li>
            <li>باقة عائلية (6-8 أشخاص) — الأكثر طلباً</li>
            <li>باقة العزومة (10-15 شخص) — مثالية للتجمعات الكبيرة</li>
            <li>باقة VIP مع <Link to="/ramadan-wagyu-offer" className="text-primary hover:underline">واغيو رمضان</Link> — لمن يريد الأفضل</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">توصيل سريع لسهرة الشوي</h3>
          <p>
            نوصل باقات الشواء مبرّدة لجميع مناطق أبوظبي. التوصيل متاح يومياً من الساعة 9 صباحاً حتى 10 مساءً خلال رمضان. اطلب قبل الساعة 2 ظهراً لتوصيل مسائي قبل سهرة الشوي. التوصيل مجاني للطلبات فوق 250 درهم.
          </p>
          <p>
            للطلب والاستفسار تواصل معنا عبر واتساب على 0566808565 أو زر <Link to="/products" className="text-primary hover:underline">صفحة المنتجات</Link>. اطلع أيضاً على <Link to="/ramadan-meat-offers-abu-dhabi" className="text-primary hover:underline">جميع عروض رمضان</Link>.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Best BBQ Box for Ramadan Evenings</h2>
          <p>
            Ramadan evenings have a special charm, and there's nothing better than gathering with family and friends around a fresh BBQ after Iftar. Al Saraya Butchery presents complete Ramadan BBQ boxes — everything you need in one box, ready to grill immediately with no additional preparation needed.
          </p>
          <p>
            Our packages are designed specifically for Ramadan evenings, featuring a diverse selection of the finest meats marinated with special blends that suit Gulf and Arabic tastes. From <Link to="/bbq-meat-abu-dhabi" className="text-primary hover:underline">premium grill meats</Link> to marinated chicken and ready kebabs.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Ramadan BBQ Box Contents</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Marinated lamb chops — 1 kg (8-10 pieces)</li>
            <li>Assorted meat kebab skewers — 6 skewers</li>
            <li>Chicken shish tawook — 6 skewers</li>
            <li>Wagyu beef burgers — 4 patties</li>
            <li>Marinated chicken wings — 500g</li>
            <li>Grilled kofta — 500g</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Special Ramadan Marinades</h3>
          <p>
            Every piece of meat in our BBQ box is marinated with a special blend developed by our professional chefs. We use 100% natural spices with no preservatives. Marinades include: Lebanese style with garlic and lemon, Turkish style with yogurt and spices, and Gulf style with bezar and black lime. You can choose your preferred marinade for each meat type.
          </p>
          <p>
            The package serves 6-8 people and is perfect for Ramadan family evenings or friend gatherings. The box can be customized to your preference — contact us and we'll prepare a custom box for you.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why Al Saraya's BBQ Box?</h2>
          <p>
            We don't just provide meat — we provide a complete grilling experience. Each box comes with optimal grilling instructions for each meat type, appropriate temperatures, and grilling times for the best results. Even if you're not a grilling expert, our box will make you look like a pro.
          </p>
          <p>
            All meats are 100% fresh and halal certified. We use Australian beef and lamb from the finest certified farms. Chicken is fresh local daily. Every product undergoes strict quality inspection before packaging and delivery.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Available Box Sizes</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Small Box (4-5 people) — competitive pricing</li>
            <li>Family Box (6-8 people) — most popular</li>
            <li>Gathering Box (10-15 people) — perfect for large groups</li>
            <li>VIP Box with <Link to="/ramadan-wagyu-offer" className="text-primary hover:underline">Ramadan Wagyu</Link> — for those who want the best</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Fast Delivery for BBQ Night</h3>
          <p>
            We deliver BBQ boxes refrigerated across all Abu Dhabi areas. Delivery available daily from 9 AM to 10 PM during Ramadan. Order before 2 PM for evening delivery before your BBQ gathering. Free delivery on orders over 250 AED.
          </p>
          <p>
            To order, contact us via WhatsApp at 0566808565 or visit our <Link to="/products" className="text-primary hover:underline">products page</Link>. Also check out <Link to="/ramadan-meat-offers-abu-dhabi" className="text-primary hover:underline">all Ramadan offers</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "What's included in the Ramadan BBQ box?", answer: "Our Ramadan BBQ box includes marinated lamb chops, kebab skewers, chicken shish tawook, Wagyu burgers, marinated wings, and grilled kofta — all pre-marinated and ready to grill." },
      { question: "How many people does the BBQ box serve?", answer: "We offer three sizes: Small (4-5 people), Family (6-8 people), and Gathering (10-15 people). We also offer a VIP box with premium Wagyu cuts." },
      { question: "Can I customize the BBQ box?", answer: "Yes! Contact us via WhatsApp at 0566808565 and we'll create a custom BBQ box tailored to your preferences, dietary needs, and group size." },
      { question: "Do you deliver BBQ boxes in the evening?", answer: "Yes, during Ramadan we deliver from 9 AM to 10 PM. Order before 2 PM for same-evening delivery, perfect for post-Iftar BBQ gatherings." },
      { question: "Are the marinades halal and preservative-free?", answer: "Absolutely. All our marinades use 100% natural halal spices with no preservatives. We offer Lebanese, Turkish, and Gulf-style marinades." },
    ]}
  />
);

export default RamadanBBQBoxPage;
