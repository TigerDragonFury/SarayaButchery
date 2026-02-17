import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const WagyuBeefAbuDhabiPage = () => (
  <SEOLandingPage
    slug="wagyu-beef-abu-dhabi"
    titleAr="لحم واغيو أبوظبي | أفضل واغيو في الإمارات"
    titleEn="Wagyu Beef Abu Dhabi | Premium Wagyu UAE"
    descriptionAr="اطلب أجود أنواع لحم الواغيو في أبوظبي. واغيو ياباني وأسترالي أصلي مع توصيل سريع. ملحمة السرايا - خبراء الواغيو في الإمارات."
    descriptionEn="Order the finest Wagyu beef in Abu Dhabi. Authentic Japanese & Australian Wagyu with fast delivery. Al Saraya Butchery — UAE's Wagyu experts."
    keywords="wagyu beef Abu Dhabi, wagyu UAE, Japanese wagyu Abu Dhabi, Australian wagyu UAE, A5 wagyu Abu Dhabi, واغيو أبوظبي, لحم واغيو الإمارات, واغيو ياباني"
    h1Ar="لحم الواغيو الفاخر في أبوظبي — ملحمة السرايا"
    h1En="Premium Wagyu Beef in Abu Dhabi — Al Saraya Butchery"
    productData={{ name: "Premium Wagyu Beef", description: "Authentic Japanese A5 and Australian Wagyu beef. Ribeye, striploin, tenderloin. Al Saraya Butchery Abu Dhabi.", image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770797121494-vbqj5.webp", priceLow: 180, priceHigh: 950, category: "Wagyu Beef" }}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">أفضل لحم واغيو في أبوظبي</h2>
          <p>
            ملحمة السرايا هي الوجهة الأولى لعشاق لحم الواغيو الفاخر في أبوظبي والإمارات. نوفر أجود أنواع الواغيو الياباني والأسترالي بدرجات تمشيح مختلفة تناسب جميع الأذواق والميزانيات. سواء كنت تبحث عن واغيو A5 الياباني الأصلي أو واغيو أسترالي ممتاز، ستجد ما يناسبك في ملحمة السرايا.
          </p>
          <p>
            الواغيو ليس مجرد لحم — إنه تجربة طعام استثنائية. يتميز بالتمشيح الرخامي الكثيف الذي يمنحه نكهة غنية وطراوة لا مثيل لها. في ملحمة السرايا، نختار قطع الواغيو بعناية فائقة من أفضل المزارع المعتمدة عالمياً لنقدم لعملائنا في أبوظبي تجربة لحوم فاخرة حقيقية.
          </p>
          <h3 className="text-xl font-semibold text-foreground">أنواع الواغيو المتوفرة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>واغيو ياباني A5 — أعلى درجة تمشيح في العالم</li>
            <li>واغيو أسترالي MBS 7-9 — توازن مثالي بين الجودة والسعر</li>
            <li><Link to="/products" className="text-primary hover:underline">ريب آي واغيو</Link> — القطعة الأكثر طلباً</li>
            <li>ستيك واغيو سترب لوين — نكهة غنية وطراوة فائقة</li>
            <li>واغيو تندرلوين — أطرى قطعة لحم على الإطلاق</li>
            <li>واغيو برجر باتي — تجربة برجر فاخرة في المنزل</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">كيف تطبخ لحم الواغيو؟</h3>
          <p>
            الواغيو يحتاج طريقة طبخ مختلفة عن اللحوم العادية. ننصح بطبخه على حرارة عالية لمدة قصيرة للحصول على أفضل نتيجة. درجة النضج المثالية للواغيو هي Medium Rare إلى Medium. لا تحتاج لإضافة زيت أو زبدة — الدهون الرخامية في الواغيو كافية لطبخه. رشة ملح وفلفل فقط كافية لإبراز نكهته الطبيعية الغنية.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لماذا واغيو ملحمة السرايا؟</h2>
          <p>
            نحن لا نبيع أي واغيو — نحن نبيع الواغيو الأصلي المعتمد فقط. كل قطعة واغيو في ملحمة السرايا تأتي مع شهادة أصالة تثبت مصدرها ودرجة تمشيحها. نحرص على استيراد الواغيو مباشرة من المزارع المعتمدة وتخزينه في درجات حرارة مثالية للحفاظ على جودته الاستثنائية.
          </p>
          <p>
            نقدم خدمة استشارية مجانية لعملائنا لمساعدتهم في اختيار القطعة المناسبة حسب المناسبة وطريقة الطبخ المفضلة. فريقنا المتخصص سيرشدك لأفضل خيار سواء كنت تحضر عشاء رومانسي، حفلة شوي، أو مناسبة خاصة.
          </p>
          <h3 className="text-xl font-semibold text-foreground">أسعار الواغيو في أبوظبي</h3>
          <p>
            نوفر واغيو بأسعار تنافسية مقارنة بالمطاعم الفاخرة في أبوظبي. يمكنك الاستمتاع بتجربة واغيو A5 في منزلك بأقل من نصف سعر المطعم. تواصل معنا عبر واتساب على 0566808565 للاطلاع على الأسعار والعروض الحالية.
          </p>
          <h3 className="text-xl font-semibold text-foreground">توصيل واغيو أبوظبي</h3>
          <p>
            نوفر توصيل مبرّد خاص للحفاظ على جودة الواغيو. التوصيل متاح لجميع مناطق أبوظبي بما فيها <Link to="/butcher-al-reem-island" className="text-primary hover:underline">جزيرة الريم</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">مدينة خليفة</Link>، السعديات، <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، والمارينا. اطلب قبل الساعة 12 ظهراً واستلم في نفس اليوم.
          </p>
          <p>
            تعرف على المزيد من منتجاتنا الفاخرة في صفحة <Link to="/products" className="text-primary hover:underline">المنتجات</Link> أو تصفح <Link to="/blog" className="text-primary hover:underline">مدونتنا</Link> لنصائح الطبخ والوصفات.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Best Wagyu Beef in Abu Dhabi</h2>
          <p>
            Al Saraya Butchery is the premier destination for Wagyu beef lovers in Abu Dhabi and the UAE. We offer the finest Japanese and Australian Wagyu with various marbling grades to suit all tastes and budgets. Whether you're looking for authentic Japanese A5 Wagyu or premium Australian Wagyu, you'll find it at Al Saraya.
          </p>
          <p>
            Wagyu isn't just meat — it's an extraordinary culinary experience. It's characterized by its intense marbling that delivers unmatched richness and tenderness. At Al Saraya Butchery, we carefully select our Wagyu cuts from the world's most reputable certified farms to offer our Abu Dhabi customers an authentic premium meat experience.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Available Wagyu Cuts</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Japanese A5 Wagyu — the highest marbling grade in the world</li>
            <li>Australian Wagyu MBS 7-9 — perfect balance of quality and value</li>
            <li><Link to="/products" className="text-primary hover:underline">Wagyu Ribeye</Link> — our most popular cut</li>
            <li>Wagyu Striploin Steak — rich flavor and exceptional tenderness</li>
            <li>Wagyu Tenderloin — the most tender cut available</li>
            <li>Wagyu Burger Patties — premium burger experience at home</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">How to Cook Wagyu Beef</h3>
          <p>
            Wagyu requires a different cooking approach than regular beef. We recommend cooking it at high heat for a short time for the best results. The ideal doneness for Wagyu is Medium Rare to Medium. No oil or butter needed — the marbling fat in Wagyu is sufficient. Just a sprinkle of salt and pepper to highlight its naturally rich flavor.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why Choose Al Saraya's Wagyu?</h2>
          <p>
            We don't sell just any Wagyu — we sell only certified authentic Wagyu. Every Wagyu cut at Al Saraya comes with a certificate of authenticity verifying its origin and marbling grade. We import Wagyu directly from certified farms and store it at optimal temperatures to maintain its exceptional quality.
          </p>
          <p>
            We offer complimentary consultation to help customers choose the right cut based on the occasion and preferred cooking method. Our specialized team will guide you to the best option whether you're preparing a romantic dinner, BBQ party, or special event.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Wagyu Prices in Abu Dhabi</h3>
          <p>
            We offer Wagyu at competitive prices compared to fine dining restaurants in Abu Dhabi. Enjoy an A5 Wagyu experience at home for less than half the restaurant price. Contact us via WhatsApp at 0566808565 for current prices and offers.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Wagyu Delivery Abu Dhabi</h3>
          <p>
            We provide special refrigerated delivery to maintain Wagyu quality. Delivery available across all Abu Dhabi areas including <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem Island</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, Saadiyat, <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, and Marina. Order before 12 PM for same-day delivery.
          </p>
          <p>
            Explore more of our premium products on our <Link to="/products" className="text-primary hover:underline">Products page</Link> or browse our <Link to="/blog" className="text-primary hover:underline">blog</Link> for cooking tips and recipes.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Where can I buy Wagyu beef in Abu Dhabi?", answer: "Al Saraya Butchery offers authentic Japanese A5 and Australian Wagyu beef with same-day delivery across Abu Dhabi. Visit our shop or order via WhatsApp at 0566808565." },
      { question: "How much does Wagyu cost in Abu Dhabi?", answer: "Wagyu prices vary by grade: Australian Wagyu starts from AED 180/kg, while Japanese A5 Wagyu ranges from AED 500-1200/kg depending on the cut. Contact us for current pricing." },
      { question: "Is Wagyu beef halal?", answer: "Yes, all Wagyu beef at Al Saraya Butchery is 100% halal certified, slaughtered according to Islamic guidelines from approved halal suppliers." },
      { question: "What is the difference between Japanese and Australian Wagyu?", answer: "Japanese Wagyu (A5) has the highest marbling grade and buttery texture. Australian Wagyu offers excellent marbling at a more accessible price point. Both are premium quality." },
      { question: "Do you deliver Wagyu to Al Reem Island and Khalifa City?", answer: "Yes, we deliver to all Abu Dhabi areas including Al Reem Island, Khalifa City, Saadiyat, Al Raha, MBZ City, and more with refrigerated transport." },
    ]}
  />
);

export default WagyuBeefAbuDhabiPage;
