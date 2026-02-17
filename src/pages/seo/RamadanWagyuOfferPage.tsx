import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";
import RamadanCountdown from "@/components/shared/RamadanCountdown";

const RamadanWagyuOfferPage = () => (
  <SEOLandingPage
    slug="ramadan-wagyu-offer"
    titleAr="عرض واغيو رمضان أبوظبي | واغيو فاخر للإفطار"
    titleEn="Ramadan Wagyu Offer Abu Dhabi | Premium Wagyu for Iftar"
    descriptionAr="عرض واغيو رمضان الحصري من ملحمة السرايا. واغيو A5 ياباني وأسترالي بأسعار رمضان الخاصة مع توصيل مبرّد في أبوظبي."
    descriptionEn="Exclusive Ramadan Wagyu offer from Al Saraya. Japanese A5 & Australian Wagyu at special Ramadan prices with refrigerated delivery in Abu Dhabi."
    keywords="Wagyu Ramadan special, Ramadan Wagyu Abu Dhabi, واغيو رمضان, عرض واغيو أبوظبي, premium Iftar meat UAE, Wagyu Iftar Abu Dhabi, A5 Wagyu Ramadan, واغيو إفطار"
    productData={{ name: "Ramadan Wagyu Offer Abu Dhabi", category: "Premium Wagyu", description: "Exclusive Ramadan Wagyu pack with Japanese A5 ribeye, Australian striploin MBS 7+, burgers and tenderloin. Save up to 30%.", priceLow: 199, priceHigh: 899, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770797121494-vbqj5.webp" }}
    h1Ar="عرض واغيو رمضان الحصري — ملحمة السرايا أبوظبي"
    h1En="Exclusive Ramadan Wagyu Offer — Al Saraya Butchery Abu Dhabi"
    extraContent={<RamadanCountdown />}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">واغيو فاخر لمائدة رمضان</h2>
          <p>
            رمضان هو شهر الكرم والضيافة، وما أجمل أن تكرم ضيوفك بأجود أنواع اللحوم في العالم — لحم الواغيو. ملحمة السرايا تقدم لكم عرض واغيو رمضان الحصري بأسعار استثنائية لن تجدها طوال العام. هذا هو الوقت المثالي لتجربة الواغيو الأصلي على مائدة إفطارك.
          </p>
          <p>
            <Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">الواغيو</Link> ليس مجرد لحم — إنه تجربة طعام فريدة. التمشيح الرخامي الكثيف يمنحه نكهة غنية وطراوة لا مثيل لها. في رمضان، نقدم لكم أسعاراً خاصة على أجود القطع لنجعل هذه التجربة في متناول الجميع.
          </p>
          <h3 className="text-xl font-semibold text-foreground">باقة واغيو رمضان الفاخرة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>واغيو ريب آي A5 ياباني — 500 غرام</li>
            <li>واغيو سترب لوين أسترالي MBS 7+ — 500 غرام</li>
            <li>واغيو برجر باتي — 4 قطع (200 غرام لكل قطعة)</li>
            <li>واغيو تندرلوين — 300 غرام</li>
          </ul>
          <p>
            الباقة الكاملة بسعر رمضان الخاص — وفّر حتى 30٪ مقارنة بالأسعار العادية. الكمية محدودة جداً خلال شهر رمضان لأننا نستورد فقط أفضل القطع من المزارع المعتمدة.
          </p>
          <h3 className="text-xl font-semibold text-foreground">كيف تقدم الواغيو في الإفطار</h3>
          <p>
            الواغيو يحتاج طريقة تحضير بسيطة لإبراز نكهته الطبيعية. ننصح بشويه على حرارة عالية لمدة قصيرة (2-3 دقائق لكل جهة) والاكتفاء بالملح والفلفل فقط. للإفطار، قدّمه كطبق رئيسي مع أرز بسمتي وسلطة فتوش، أو كستيك مع خضار مشوية.
          </p>
          <p>
            يمكنك أيضاً تحضير سلايدرز واغيو صغيرة كمقبّلات فاخرة لضيوفك، أو تقديم شرائح واغيو رقيقة على طريقة التاتاكي الياباني كطبق تقديم مميز. فريقنا سيساعدك في اختيار أفضل طريقة تقديم حسب عدد الضيوف ونوع المناسبة.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لماذا واغيو السرايا في رمضان؟</h2>
          <p>
            كل قطعة واغيو في ملحمة السرايا تأتي مع شهادة أصالة تثبت مصدرها ودرجة التمشيح. نحن الوكيل المعتمد في أبوظبي للواغيو الياباني A5 والواغيو الأسترالي عالي الجودة. في رمضان، نقدم أسعاراً حصرية لعملائنا لأننا نؤمن أن الجودة الاستثنائية يجب أن تكون متاحة في هذا الشهر الكريم.
          </p>
          <h3 className="text-xl font-semibold text-foreground">واغيو ياباني vs أسترالي</h3>
          <p>
            الواغيو الياباني A5 هو الأعلى جودة في العالم بتمشيح رخامي كثيف جداً ونكهة زبدية فريدة. الواغيو الأسترالي MBS 7-9 يقدم تجربة ممتازة بسعر أقل مع تمشيح رائع. في باقة رمضان نجمع بين النوعين لنقدم لك أفضل تجربة متكاملة.
          </p>
          <h3 className="text-xl font-semibold text-foreground">هدية رمضان المثالية</h3>
          <p>
            باقة واغيو رمضان تأتي في تغليف هدايا أنيق، مما يجعلها الهدية المثالية للأهل والأصدقاء في رمضان. أرسل هدية واغيو لمن تحب مع رسالة تهنئة شخصية — نوصلها مبرّدة لأي عنوان في أبوظبي.
          </p>
          <h3 className="text-xl font-semibold text-foreground">احجز واغيو رمضان الآن</h3>
          <p>
            الكمية محدودة جداً والطلب مرتفع في رمضان. احجز باقتك الآن عبر واتساب على 0566808565 لضمان التوفر. يمكنك أيضاً زيارة <Link to="/products" className="text-primary hover:underline">صفحة المنتجات</Link> أو الاطلاع على <Link to="/ramadan-meat-offers-abu-dhabi" className="text-primary hover:underline">جميع عروض رمضان</Link>.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Premium Wagyu for Your Ramadan Table</h2>
          <p>
            Ramadan is the month of generosity and hospitality, and what better way to honor your guests than with the world's finest meat — Wagyu beef. Al Saraya Butchery presents an exclusive Ramadan Wagyu offer at exceptional prices you won't find all year. This is the perfect time to experience authentic Wagyu at your Iftar table.
          </p>
          <p>
            <Link to="/wagyu-beef-abu-dhabi" className="text-primary hover:underline">Wagyu</Link> isn't just meat — it's a unique culinary experience. The intense marbling delivers unmatched richness and tenderness. During Ramadan, we offer special pricing on the finest cuts to make this experience accessible to everyone.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Premium Ramadan Wagyu Pack</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Japanese A5 Wagyu Ribeye — 500g</li>
            <li>Australian Wagyu Striploin MBS 7+ — 500g</li>
            <li>Wagyu Burger Patties — 4 pieces (200g each)</li>
            <li>Wagyu Tenderloin — 300g</li>
          </ul>
          <p>
            The complete pack at special Ramadan pricing — save up to 30% compared to regular prices. Quantities are very limited during Ramadan as we import only the finest cuts from certified farms.
          </p>
          <h3 className="text-xl font-semibold text-foreground">How to Serve Wagyu at Iftar</h3>
          <p>
            Wagyu needs simple preparation to highlight its natural flavor. We recommend searing at high heat for a short time (2-3 minutes per side) with just salt and pepper. For Iftar, serve it as a main course with basmati rice and fattoush salad, or as steak with grilled vegetables.
          </p>
          <p>
            You can also prepare mini Wagyu sliders as premium appetizers for your guests, or serve thin Wagyu slices tataki-style as an impressive presentation dish. Our team will help you choose the best serving method based on your guest count and occasion type.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why Al Saraya's Wagyu for Ramadan?</h2>
          <p>
            Every Wagyu cut at Al Saraya comes with a certificate of authenticity verifying its origin and marbling grade. We are the authorized distributor in Abu Dhabi for Japanese A5 Wagyu and premium Australian Wagyu. During Ramadan, we offer exclusive pricing for our customers because we believe exceptional quality should be accessible during this blessed month.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Japanese vs Australian Wagyu</h3>
          <p>
            Japanese A5 Wagyu is the highest quality in the world with extremely dense marbling and a unique buttery flavor. Australian Wagyu MBS 7-9 offers an excellent experience at a lower price point with remarkable marbling. In our Ramadan pack, we combine both types to deliver the best comprehensive experience.
          </p>
          <h3 className="text-xl font-semibold text-foreground">The Perfect Ramadan Gift</h3>
          <p>
            Our Ramadan Wagyu pack comes in elegant gift packaging, making it the perfect gift for family and friends during Ramadan. Send a Wagyu gift to your loved ones with a personalized greeting — we deliver it refrigerated to any address in Abu Dhabi.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Reserve Your Ramadan Wagyu Now</h3>
          <p>
            Quantities are very limited and demand is high during Ramadan. Reserve your pack now via WhatsApp at 0566808565 to ensure availability. You can also visit our <Link to="/products" className="text-primary hover:underline">products page</Link> or check out <Link to="/ramadan-meat-offers-abu-dhabi" className="text-primary hover:underline">all Ramadan offers</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "What's included in the Ramadan Wagyu pack?", answer: "The pack includes Japanese A5 Wagyu Ribeye (500g), Australian Wagyu Striploin MBS 7+ (500g), Wagyu Burger Patties (4 pieces), and Wagyu Tenderloin (300g) — all at special Ramadan pricing with up to 30% savings." },
      { question: "Is the Wagyu halal certified?", answer: "Yes, all Wagyu at Al Saraya is 100% halal certified, sourced from approved halal suppliers and slaughtered according to Islamic guidelines." },
      { question: "Can I send the Wagyu pack as a Ramadan gift?", answer: "Yes! Our Ramadan Wagyu pack comes in elegant gift packaging with a personalized greeting card. We deliver refrigerated to any address in Abu Dhabi." },
      { question: "How should I cook Wagyu for Iftar?", answer: "Sear at high heat for 2-3 minutes per side with just salt and pepper. Serve medium-rare to medium for the best flavor. No oil or butter needed — the marbling fat is sufficient." },
      { question: "Are quantities limited during Ramadan?", answer: "Yes, we import limited quantities of premium Wagyu cuts during Ramadan. We strongly recommend pre-ordering via WhatsApp at 0566808565 to ensure availability." },
    ]}
  />
);

export default RamadanWagyuOfferPage;
