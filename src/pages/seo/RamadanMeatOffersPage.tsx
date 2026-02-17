import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";
import RamadanCountdown from "@/components/shared/RamadanCountdown";

const RamadanMeatOffersPage = () => (
  <SEOLandingPage
    slug="ramadan-meat-offers-abu-dhabi"
    titleAr="عروض لحوم رمضان أبوظبي | باقات إفطار وسحور"
    titleEn="Ramadan Meat Offers Abu Dhabi | Iftar & Suhoor Packs"
    descriptionAr="أقوى عروض لحوم رمضان في أبوظبي. باقات إفطار وسحور جاهزة مع توصيل سريع. ملحمة السرايا - شريكك في رمضان."
    descriptionEn="Best Ramadan meat offers in Abu Dhabi. Ready Iftar & Suhoor packs with fast delivery. Al Saraya Butchery — your Ramadan partner."
    keywords="Ramadan meat offers Abu Dhabi, عروض لحوم رمضان أبوظبي, Iftar meat delivery Abu Dhabi, halal butcher Ramadan UAE, توصيل لحوم افطار, باقة شواء رمضان, Ramadan BBQ box UAE, ملحمة قريبة مني رمضان"
    productData={{ name: "Ramadan Meat Offers Abu Dhabi", category: "Ramadan Offers", description: "Special Ramadan Iftar and Suhoor meat packages with up to 25% savings and free delivery.", priceLow: 99, priceHigh: 599, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770732502264-0ok3h.webp" }}
    h1Ar="عروض لحوم رمضان في أبوظبي — ملحمة السرايا"
    h1En="Ramadan Meat Offers in Abu Dhabi — Al Saraya Butchery"
    extraContent={<RamadanCountdown />}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">أفضل عروض لحوم رمضان في أبوظبي</h2>
          <p>
            مع اقتراب شهر رمضان المبارك، تقدم ملحمة السرايا أقوى عروض اللحوم الطازجة في أبوظبي. نحن نعلم أن مائدة رمضان تحتاج لأجود أنواع اللحوم لتحضير أشهى أطباق الإفطار والسحور. لذلك جهّزنا لكم باقات خاصة تناسب جميع الأسر والميزانيات.
          </p>
          <p>
            سواء كنت تبحث عن <Link to="/beef-abu-dhabi" className="text-primary hover:underline">لحم بقري طازج</Link> لتحضير الكباب والكفتة، أو <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">لحم غنم</Link> للأوزي والمنسف، أو <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">دجاج طازج</Link> للمشاوي والشيش طاووق — كل ما تحتاجه متوفر في ملحمة السرايا بأسعار رمضان الخاصة.
          </p>
          <h3 className="text-xl font-semibold text-foreground">باقات رمضان الخاصة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/ramadan-bbq-box-abu-dhabi" className="text-primary hover:underline">باقة شواء رمضان</Link> — تشكيلة مشاوي متنوعة لسهرات رمضان</li>
            <li><Link to="/ramadan-wagyu-offer" className="text-primary hover:underline">باقة واغيو رمضان الفاخرة</Link> — أجود قطع الواغيو لعزومات رمضان المميزة</li>
            <li>باقة إفطار العائلة — لحوم متنوعة تكفي 5-7 أشخاص</li>
            <li>باقة سحور البروتين — قطع لحم مثالية لوجبات السحور المغذية</li>
            <li>باقة المشاوي الجاهزة — متبّلة وجاهزة للشوي مباشرة</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">قسم الإفطار — أطباق اللحم الرئيسية</h3>
          <p>
            الإفطار هو الوجبة الأهم في رمضان، ونحن نوفر لك كل ما تحتاجه لتحضير مائدة إفطار فاخرة. من الكباب المشوي إلى الأوزي بلحم الغنم، ومن صينية الكفتة بالطماطم إلى المنسف الأردني الأصيل — كل قطعة لحم من ملحمة السرايا مختارة بعناية لتعطيك أفضل نكهة وطراوة.
          </p>
          <p>
            ننصح بطلب لحم الغنم مع العظم لتحضير المرق والشوربات الرمضانية الدسمة. أما لأطباق الكباب والكفتة، فاللحم المفروم الطازج من ملحمة السرايا هو الخيار الأمثل لأنه يُفرم يومياً أمام عينيك.
          </p>
          <h3 className="text-xl font-semibold text-foreground">قسم السحور — بروتين لطاقة تدوم</h3>
          <p>
            وجبة السحور تحتاج بروتين عالي الجودة يمنحك الطاقة طوال اليوم. نوفر لك شرائح ستيك رفيعة سريعة التحضير، صدور دجاج مشوية جاهزة، ولحم مفروم لتحضير عجة اللحم أو البيض بالقاورما. كل هذه المنتجات متاحة ضمن باقة سحور البروتين الخاصة بأسعار تنافسية.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لماذا ملحمة السرايا في رمضان؟</h2>
          <p>
            في رمضان، الجودة لا تقبل المساومة. ملحمة السرايا تقدم لحوماً طازجة 100٪ حلال، مذبوحة يومياً وفق أعلى معايير النظافة والجودة. فريقنا المتخصص يساعدك في اختيار القطع المناسبة لكل طبق رمضاني، سواء كان فتة باللحم، مقلوبة، أو كبسة.
          </p>
          <p>
            نوفر خدمة التقطيع والتتبيل حسب الطلب — أخبرنا ماذا تريد أن تطبخ وسنجهز لك اللحم بالطريقة المثالية. هذه الخدمة مجانية تماماً ومتاحة لجميع العملاء خلال شهر رمضان.
          </p>
          <h3 className="text-xl font-semibold text-foreground">توصيل رمضان — سريع ومبرّد</h3>
          <p>
            نعلم أن وقتك في رمضان ثمين. لذلك وفّرنا خدمة توصيل سريعة ومبرّدة لجميع مناطق أبوظبي بما فيها <Link to="/butcher-al-reem-island" className="text-primary hover:underline">جزيرة الريم</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">مدينة خليفة</Link>، و<Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>. اطلب قبل الساعة 12 ظهراً واستلم قبل الإفطار.
          </p>
          <h3 className="text-xl font-semibold text-foreground">أسعار رمضان التنافسية</h3>
          <p>
            نقدم أسعاراً خاصة طوال شهر رمضان على جميع منتجاتنا. الباقات العائلية توفر لك حتى 25٪ مقارنة بشراء المنتجات منفردة. تواصل معنا عبر واتساب على 0566808565 للاطلاع على قائمة الأسعار الكاملة والعروض اليومية.
          </p>
          <h3 className="text-xl font-semibold text-foreground">اطلب مبكراً — الكمية محدودة</h3>
          <p>
            الطلب يزداد بشكل كبير في رمضان خصوصاً في العشر الأواخر والعزومات. ننصح بالطلب المسبق قبل يوم واحد على الأقل لضمان توفر جميع المنتجات. يمكنك أيضاً الاشتراك في باقة رمضان الأسبوعية لتوصيل منتظم كل أسبوع.
          </p>
          <p>
            تصفح جميع <Link to="/products" className="text-primary hover:underline">منتجاتنا</Link> أو زر <Link to="/blog" className="text-primary hover:underline">مدونتنا</Link> لوصفات رمضانية مميزة. للتواصل المباشر، زر صفحة <Link to="/contact" className="text-primary hover:underline">اتصل بنا</Link>.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Best Ramadan Meat Offers in Abu Dhabi</h2>
          <p>
            As the blessed month of Ramadan approaches, Al Saraya Butchery presents the best fresh meat offers in Abu Dhabi. We know that the Ramadan table demands the finest quality meats for preparing delicious Iftar and Suhoor dishes. That's why we've curated special packages to suit all families and budgets.
          </p>
          <p>
            Whether you're looking for <Link to="/beef-abu-dhabi" className="text-primary hover:underline">fresh beef</Link> for kebabs and kofta, <Link to="/lamb-meat-abu-dhabi" className="text-primary hover:underline">premium lamb</Link> for ouzi and mansaf, or <Link to="/chicken-abu-dhabi" className="text-primary hover:underline">fresh chicken</Link> for grills and shish tawook — everything you need is available at Al Saraya with special Ramadan pricing.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Special Ramadan Packages</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/ramadan-bbq-box-abu-dhabi" className="text-primary hover:underline">Ramadan BBQ Box</Link> — diverse grill selection for Ramadan evenings</li>
            <li><Link to="/ramadan-wagyu-offer" className="text-primary hover:underline">Premium Wagyu Ramadan Pack</Link> — finest Wagyu cuts for special Ramadan gatherings</li>
            <li>Family Iftar Box — assorted meats serving 5-7 people</li>
            <li>Suhoor Protein Pack — ideal meat cuts for nutritious pre-dawn meals</li>
            <li>Ready-to-Grill Pack — marinated and ready for immediate grilling</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Iftar Section — Main Meat Dishes</h3>
          <p>
            Iftar is the most important meal during Ramadan, and we provide everything you need to prepare a premium Iftar table. From grilled kebabs to lamb ouzi, from kofta with tomato tray to authentic Jordanian mansaf — every cut from Al Saraya is carefully selected for optimal flavor and tenderness.
          </p>
          <p>
            We recommend bone-in lamb for rich Ramadan broths and soups. For kebabs and kofta, our fresh ground meat is the ideal choice as it's minced daily right before your eyes.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Suhoor Section — Protein for Lasting Energy</h3>
          <p>
            Suhoor meals need high-quality protein to sustain you throughout the day. We offer thin steak slices for quick preparation, ready grilled chicken breast, and ground meat for meat omelette or qawarma with eggs. All these products are available in our special Suhoor Protein Pack at competitive prices.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why Al Saraya for Ramadan?</h2>
          <p>
            During Ramadan, quality is non-negotiable. Al Saraya Butchery delivers 100% halal fresh meat, slaughtered daily following the highest hygiene and quality standards. Our specialized team helps you choose the right cuts for every Ramadan dish, whether it's fatteh with meat, maqluba, or kabsa.
          </p>
          <p>
            We offer complimentary cutting and marination service — tell us what you're cooking and we'll prepare the meat perfectly. This service is completely free and available to all customers during Ramadan.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Ramadan Delivery — Fast & Refrigerated</h3>
          <p>
            We know your time during Ramadan is precious. That's why we provide fast, refrigerated delivery across all Abu Dhabi areas including <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem Island</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, and <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>. Order before 12 PM and receive before Iftar.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Competitive Ramadan Prices</h3>
          <p>
            We offer special pricing throughout Ramadan on all our products. Family packages save you up to 25% compared to individual purchases. Contact us via WhatsApp at 0566808565 for the full price list and daily offers.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Order Early — Limited Quantities</h3>
          <p>
            Demand increases significantly during Ramadan, especially in the last ten days and for gatherings. We recommend pre-ordering at least one day in advance to ensure all products are available. You can also subscribe to our weekly Ramadan package for regular weekly delivery.
          </p>
          <p>
            Browse all our <Link to="/products" className="text-primary hover:underline">products</Link> or visit our <Link to="/blog" className="text-primary hover:underline">blog</Link> for special Ramadan recipes. For direct contact, visit our <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "What Ramadan meat offers does Al Saraya have?", answer: "We offer special Ramadan packages including Family Iftar Box, BBQ Ramadan Box, Suhoor Protein Pack, and Premium Wagyu Iftar Pack — all at discounted Ramadan prices with free delivery on orders over 250 AED." },
      { question: "Do you deliver meat before Iftar time?", answer: "Yes, order before 12 PM and we guarantee delivery before Iftar across all Abu Dhabi areas including Al Reem Island, Khalifa City, and Al Raha." },
      { question: "Can I order Ramadan meat packages weekly?", answer: "Yes, we offer weekly Ramadan subscription packages. Contact us on WhatsApp at 0566808565 to set up your weekly delivery schedule." },
      { question: "Is all Ramadan meat halal certified?", answer: "Absolutely. All our meat is 100% halal certified, slaughtered daily according to Islamic guidelines from approved halal suppliers." },
      { question: "What are the best meats for Iftar dishes?", answer: "For traditional Iftar dishes, we recommend bone-in lamb for soups and stews, fresh ground beef for kebabs and kofta, and marinated chicken for grills. Our team can advise on the perfect cuts for any recipe." },
    ]}
  />
);

export default RamadanMeatOffersPage;
