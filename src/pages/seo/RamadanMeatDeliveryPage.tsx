import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";
import RamadanCountdown from "@/components/shared/RamadanCountdown";

const RamadanMeatDeliveryPage = () => (
  <SEOLandingPage
    slug="ramadan-meat-delivery-abu-dhabi"
    titleAr="توصيل لحوم رمضان أبوظبي | طلب إفطار أونلاين"
    titleEn="Ramadan Meat Delivery Abu Dhabi | Iftar Order Online"
    descriptionAr="خدمة توصيل لحوم رمضان في أبوظبي. اطلب لحوم الإفطار والسحور أونلاين مع توصيل مبرّد سريع. ملحمة السرايا — توصيل يومي في رمضان."
    descriptionEn="Ramadan meat delivery service in Abu Dhabi. Order Iftar & Suhoor meats online with fast refrigerated delivery. Al Saraya — daily Ramadan delivery."
    keywords="Ramadan meat delivery Abu Dhabi, Iftar meat delivery Abu Dhabi, halal meat delivery Ramadan, توصيل لحوم رمضان, توصيل لحوم افطار أبوظبي, طلب لحوم أونلاين رمضان, meat delivery UAE Ramadan, halal butcher delivery Ramadan UAE"
    productData={{ name: "Ramadan Meat Delivery Abu Dhabi", category: "Ramadan Delivery", description: "Iftar and Suhoor halal meat delivery with refrigerated same-day service across Abu Dhabi.", priceLow: 25, priceHigh: 400, image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770800297442-14ofov.webp" }}
    h1Ar="توصيل لحوم رمضان في أبوظبي — ملحمة السرايا"
    h1En="Ramadan Meat Delivery in Abu Dhabi — Al Saraya Butchery"
    extraContent={<RamadanCountdown />}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">خدمة توصيل لحوم رمضان — سريعة ومبرّدة</h2>
          <p>
            في شهر رمضان المبارك، وقتك ثمين ومحدود بين العبادة والعمل وتحضير الإفطار. ملحمة السرايا توفر لك خدمة توصيل لحوم متكاملة في أبوظبي — اطلب من هاتفك واستلم لحوماً طازجة على باب بيتك، مبرّدة ومحفوظة بأعلى معايير الجودة والنظافة.
          </p>
          <p>
            خدمتنا مصممة خصيصاً لرمضان: اطلب صباحاً واستلم قبل الإفطار. نغطي جميع مناطق أبوظبي بما فيها <Link to="/butcher-al-reem-island" className="text-primary hover:underline">جزيرة الريم</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">مدينة خليفة</Link>، السعديات، <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، المارينا، الشامخة، محمد بن زايد، وجميع المناطق السكنية.
          </p>
          <h3 className="text-xl font-semibold text-foreground">مواعيد التوصيل في رمضان</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>التوصيل الصباحي: 9 صباحاً - 1 ظهراً (اطلب قبل 10 صباحاً)</li>
            <li>توصيل ما قبل الإفطار: 2 ظهراً - 5 مساءً (اطلب قبل 12 ظهراً)</li>
            <li>التوصيل المسائي: 8 مساءً - 10 مساءً (اطلب قبل 6 مساءً)</li>
            <li>التوصيل السريع خلال ساعة: متاح لمناطق محددة بتكلفة إضافية</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">كيف تطلب لحوم الإفطار أونلاين؟</h3>
          <p>
            الطلب سهل وسريع: تصفح <Link to="/products" className="text-primary hover:underline">صفحة المنتجات</Link>، اختر اللحوم التي تريدها، حدد الكمية والتقطيع المطلوب، وأكمل الطلب. يمكنك أيضاً الطلب مباشرة عبر واتساب على 0566808565 — أرسل قائمة احتياجاتك وسنجهزها لك.
          </p>
          <p>
            نقبل الدفع عند الاستلام (كاش)، وبطاقات الائتمان (فيزا، ماستركارد)، وأبل باي. الحد الأدنى للطلب 100 درهم، والتوصيل مجاني للطلبات فوق 250 درهم. رسوم التوصيل العادية 15 درهم فقط.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لماذا توصيل السرايا في رمضان؟</h2>
          <p>
            نتميز بالتوصيل المبرّد المتخصص — كل طلب يُوصل في صناديق مبرّدة خاصة تحافظ على درجة حرارة اللحوم المثالية (0-4 درجات مئوية) من لحظة التعبئة حتى الاستلام. هذا يضمن وصول اللحوم طازجة تماماً كأنك اشتريتها من الملحمة مباشرة.
          </p>
          <p>
            سائقونا مدربون على التعامل مع المنتجات الغذائية الحساسة وملتزمون بمعايير سلامة الغذاء. نتتبع كل طلب من لحظة التعبئة حتى التسليم ونرسل لك إشعارات فورية عن حالة طلبك.
          </p>
          <h3 className="text-xl font-semibold text-foreground">اشتراك التوصيل الأسبوعي</h3>
          <p>
            وفّر وقتك ومالك مع اشتراك التوصيل الأسبوعي في رمضان. اختر <Link to="/ramadan-meat-offers-abu-dhabi" className="text-primary hover:underline">باقة رمضان</Link> المناسبة لعائلتك ونوصلها لك كل أسبوع في الموعد المحدد. الاشتراك يوفر لك خصم إضافي 10٪ على كل توصيلة.
          </p>
          <h3 className="text-xl font-semibold text-foreground">مناطق التوصيل في أبوظبي</h3>
          <p>
            نغطي جميع مناطق أبوظبي: جزيرة الريم، مدينة خليفة A وB، الراحة، جزيرة السعديات، شاطئ الراحة، مدينة محمد بن زايد، الشامخة، المرور، الكورنيش، المارينا، مدينة زايد، بني ياس، ومناطق أخرى. توصيل متاح أيضاً لمنطقة العين بحد أدنى طلب 300 درهم.
          </p>
          <h3 className="text-xl font-semibold text-foreground">ضمان الجودة والاسترجاع</h3>
          <p>
            نضمن جودة كل منتج نوصله. إذا لم تكن راضياً عن أي منتج، تواصل معنا خلال ساعة من الاستلام وسنستبدله أو نسترجع المبلغ. رضا عملائنا هو أولويتنا القصوى خصوصاً في رمضان.
          </p>
          <p>
            اطلب الآن عبر واتساب على 0566808565 أو زر <Link to="/products" className="text-primary hover:underline">متجرنا الإلكتروني</Link>. تصفح أيضاً <Link to="/ramadan-bbq-box-abu-dhabi" className="text-primary hover:underline">باقة شواء رمضان</Link> و<Link to="/ramadan-wagyu-offer" className="text-primary hover:underline">عرض واغيو رمضان</Link>.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Ramadan Meat Delivery — Fast & Refrigerated</h2>
          <p>
            During the blessed month of Ramadan, your time is precious between worship, work, and Iftar preparation. Al Saraya Butchery provides a complete meat delivery service in Abu Dhabi — order from your phone and receive fresh meat at your doorstep, refrigerated and preserved to the highest quality and hygiene standards.
          </p>
          <p>
            Our service is designed specifically for Ramadan: order in the morning and receive before Iftar. We cover all Abu Dhabi areas including <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem Island</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, Saadiyat, <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, Marina, Al Shamkha, MBZ City, and all residential areas.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Ramadan Delivery Schedule</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Morning delivery: 9 AM - 1 PM (order before 10 AM)</li>
            <li>Pre-Iftar delivery: 2 PM - 5 PM (order before 12 PM)</li>
            <li>Evening delivery: 8 PM - 10 PM (order before 6 PM)</li>
            <li>Express 1-hour delivery: available for select areas at additional cost</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">How to Order Iftar Meats Online</h3>
          <p>
            Ordering is easy and fast: browse our <Link to="/products" className="text-primary hover:underline">products page</Link>, select the meats you want, specify quantity and cutting preferences, and complete your order. You can also order directly via WhatsApp at 0566808565 — send us your shopping list and we'll prepare everything for you.
          </p>
          <p>
            We accept Cash on Delivery, credit cards (Visa, MasterCard), and Apple Pay. Minimum order is 100 AED, with free delivery on orders over 250 AED. Standard delivery fee is only 15 AED.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why Al Saraya Delivery for Ramadan?</h2>
          <p>
            We specialize in refrigerated delivery — every order is delivered in special cooling boxes that maintain optimal meat temperature (0-4°C) from packaging to receipt. This ensures your meat arrives as fresh as if you'd bought it directly from the butchery.
          </p>
          <p>
            Our drivers are trained in handling sensitive food products and committed to food safety standards. We track every order from packaging to delivery and send you real-time notifications about your order status.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Weekly Delivery Subscription</h3>
          <p>
            Save time and money with our weekly Ramadan delivery subscription. Choose the <Link to="/ramadan-meat-offers-abu-dhabi" className="text-primary hover:underline">Ramadan package</Link> that suits your family and we'll deliver it every week at your scheduled time. Subscription gives you an additional 10% discount on each delivery.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Abu Dhabi Delivery Areas</h3>
          <p>
            We cover all Abu Dhabi areas: Al Reem Island, Khalifa City A and B, Al Raha, Saadiyat Island, Al Raha Beach, MBZ City, Al Shamkha, Al Muroor, Corniche, Marina, Zayed City, Bani Yas, and more. Delivery also available to Al Ain with minimum order of 300 AED.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Quality Guarantee & Returns</h3>
          <p>
            We guarantee the quality of every product we deliver. If you're not satisfied with any item, contact us within one hour of receipt and we'll replace it or refund the amount. Customer satisfaction is our top priority especially during Ramadan.
          </p>
          <p>
            Order now via WhatsApp at 0566808565 or visit our <Link to="/products" className="text-primary hover:underline">online store</Link>. Also browse our <Link to="/ramadan-bbq-box-abu-dhabi" className="text-primary hover:underline">Ramadan BBQ Box</Link> and <Link to="/ramadan-wagyu-offer" className="text-primary hover:underline">Ramadan Wagyu Offer</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Do you deliver meat during Ramadan in Abu Dhabi?", answer: "Yes! We offer daily refrigerated meat delivery across all Abu Dhabi areas during Ramadan, with three delivery windows: morning (9AM-1PM), pre-Iftar (2PM-5PM), and evening (8PM-10PM)." },
      { question: "Can I get same-day delivery before Iftar?", answer: "Yes, order before 12 PM and we guarantee delivery before Iftar (2PM-5PM window). Express 1-hour delivery is also available for select areas." },
      { question: "What's the minimum order for Ramadan delivery?", answer: "Minimum order is 100 AED. Delivery is free for orders over 250 AED, otherwise a flat 15 AED delivery fee applies." },
      { question: "Do you offer weekly Ramadan delivery subscription?", answer: "Yes! Subscribe to our weekly Ramadan delivery plan and get an additional 10% discount. Choose your preferred package and delivery day, and we'll handle the rest." },
      { question: "Which areas in Abu Dhabi do you deliver to?", answer: "We deliver to all Abu Dhabi areas including Al Reem Island, Khalifa City, Al Raha, Saadiyat, MBZ City, Al Shamkha, Corniche, Marina, and more. Al Ain delivery available with 300 AED minimum." },
    ]}
  />
);

export default RamadanMeatDeliveryPage;
