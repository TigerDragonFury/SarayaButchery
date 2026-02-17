import { Link } from "react-router-dom";
import SEOLandingPage from "./SEOLandingPage";

const BBQMeatAbuDhabiPage = () => (
  <SEOLandingPage
    slug="bbq-meat-abu-dhabi"
    titleAr="لحوم مشاوي أبوظبي | أفضل لحوم شوي"
    titleEn="BBQ Meat Abu Dhabi | Best Grill Meats UAE"
    descriptionAr="أفضل لحوم مشاوي في أبوظبي جاهزة للشوي. كباب، تكا، شيش طاووق، ريب آي، وبوكسات شوي عائلية. توصيل سريع من ملحمة السرايا."
    descriptionEn="Best BBQ meat in Abu Dhabi ready to grill. Kebab, tikka, shish tawook, ribeye, and family grill boxes. Fast delivery from Al Saraya Butchery."
    keywords="BBQ meat Abu Dhabi, grill meat UAE, barbecue Abu Dhabi, kebab delivery Abu Dhabi, shish tawook Abu Dhabi, مشاوي أبوظبي, لحوم شوي, كباب أبوظبي"
    h1Ar="أفضل لحوم مشاوي في أبوظبي — ملحمة السرايا"
    h1En="Best BBQ Meat in Abu Dhabi — Al Saraya Butchery"
    productData={{ name: "BBQ Meat Collection", description: "Ready-to-grill BBQ meat - kebab, tikka, shish tawook, ribeye, family grill boxes. Al Saraya Butchery Abu Dhabi.", image: "https://mpqupbukacjemjhyhupw.supabase.co/storage/v1/object/public/product-images/1770648439770-3n7it6.webp", priceLow: 25, priceHigh: 200, category: "BBQ Meat" }}
    contentAr={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">لحوم مشاوي فاخرة جاهزة للشوي</h2>
          <p>
            ملحمة السرايا هي وجهتك الأولى للحوم المشاوي الفاخرة في أبوظبي. نقدم تشكيلة واسعة من اللحوم الجاهزة للشوي — طازجة ومتبلة بوصفات سرية تضمن لك أفضل تجربة شوي في المنزل أو في الحديقة. من الكباب والتكا إلى الستيك الفاخر والأضلاع المدخنة، كل ما تحتاجه لحفلة شوي مثالية تجده عندنا.
          </p>
          <p>
            نستخدم أجود أنواع اللحوم الحلال الطازجة في تحضير منتجات المشاوي. كل قطعة يتم تقطيعها وتتبيلها بعناية من قبل فريقنا المتخصص. تتبيلاتنا مستوحاة من المطبخ الشرقي الأصيل — لبناني، تركي، وخليجي — لتناسب جميع الأذواق.
          </p>
          <h3 className="text-xl font-semibold text-foreground">منتجات المشاوي المتوفرة</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">شيش طاووق</Link> — بتتبيلات متنوعة (ثوم، ليمون، تركي، يوغورت)</li>
            <li>كباب لحم — بقري وغنم فاخر</li>
            <li>تكا لحم متبل — جاهز للشوي مباشرة</li>
            <li>ريب آي ستيك — قطعيات سميكة للشوي</li>
            <li>أضلاع غنم — كاملة ومقطعة</li>
            <li>أجنحة دجاج متبلة — مشوية أو مقلية</li>
            <li>برجر باتي فاخر — لحم بقري 100٪</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">بوكسات شوي عائلية</h3>
          <p>
            نقدم <Link to="/shop/boxes" className="text-primary hover:underline">بوكسات شوي متكاملة</Link> بأحجام مختلفة تناسب العائلات الصغيرة والكبيرة. كل بوكس يحتوي على تشكيلة منوعة من اللحوم والدجاج الجاهز للشوي مع التتبيلات. الخيار المثالي لحفلات الشوي في عطلة نهاية الأسبوع والمناسبات العائلية.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">نصائح الشوي من خبراء السرايا</h2>
          <p>
            الشوي المثالي يبدأ من اختيار اللحم المناسب. ننصح باستخدام اللحوم الطازجة وليست المجمدة للحصول على أفضل نكهة. سخّن الشواية جيداً قبل وضع اللحم، واترك اللحم يصل لدرجة حرارة الغرفة قبل الشوي. لا تقلب اللحم كثيراً — مرة واحدة كافية للحصول على علامات الشوي المثالية.
          </p>
          <p>
            تعرف على المزيد من نصائح الشوي في <Link to="/blog/bbq-meat-guide-uae" className="text-primary hover:underline">دليل المشاوي الشامل</Link> على مدونتنا.
          </p>
          <h3 className="text-xl font-semibold text-foreground">خدمة تموين المشاوي للمناسبات</h3>
          <p>
            نقدم <Link to="/catering" className="text-primary hover:underline">خدمة تموين مشاوي متكاملة</Link> للمناسبات الكبيرة — أعراس، حفلات شركات، تجمعات عائلية، وحفلات خاصة. فريقنا المتخصص يتولى تحضير وتقطيع وتتبيل جميع اللحوم حسب عدد الضيوف والميزانية المحددة.
          </p>
          <h3 className="text-xl font-semibold text-foreground">توصيل لحوم مشاوي في أبوظبي</h3>
          <p>
            نوصل لحوم المشاوي الجاهزة لجميع مناطق أبوظبي بما فيها <Link to="/butcher-al-reem-island" className="text-primary hover:underline">جزيرة الريم</Link>، <Link to="/butcher-khalifa-city" className="text-primary hover:underline">مدينة خليفة</Link>، <Link to="/butcher-al-raha" className="text-primary hover:underline">الراحة</Link>، والسعديات. اطلب عبر واتساب 0566808565 أو من خلال <Link to="/contact" className="text-primary hover:underline">صفحة التواصل</Link>.
          </p>
        </div>
      </div>
    }
    contentEn={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Premium BBQ Meat Ready to Grill</h2>
          <p>
            Al Saraya Butchery is your premier destination for premium BBQ meat in Abu Dhabi. We offer an extensive selection of ready-to-grill meats — fresh and marinated with secret recipes for the best grilling experience at home or in the garden. From kebab and tikka to premium steaks and smoked ribs, everything you need for the perfect BBQ party is here.
          </p>
          <p>
            We use only the finest fresh halal meats for our BBQ products. Every cut is prepared and marinated carefully by our specialized team. Our marinades are inspired by authentic Middle Eastern cuisine — Lebanese, Turkish, and Gulf — to suit all palates.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Available BBQ Products</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to="/shop/ready-to-grill" className="text-primary hover:underline">Shish Tawook</Link> — multiple marinades (garlic, lemon, Turkish, yogurt)</li>
            <li>Meat Kebab — premium beef and lamb</li>
            <li>Marinated Tikka — ready to grill immediately</li>
            <li>Ribeye Steak — thick cuts for grilling</li>
            <li>Lamb Ribs — whole and sliced</li>
            <li>Marinated Chicken Wings — for grilling or frying</li>
            <li>Premium Burger Patties — 100% beef</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Family BBQ Boxes</h3>
          <p>
            We offer <Link to="/shop/boxes" className="text-primary hover:underline">complete BBQ boxes</Link> in various sizes for small and large families. Each box contains an assorted selection of ready-to-grill meats and chicken with marinades. The perfect choice for weekend BBQ parties and family gatherings.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">BBQ Tips from Al Saraya Experts</h2>
          <p>
            Perfect grilling starts with choosing the right meat. We recommend using fresh rather than frozen meat for the best flavor. Preheat your grill well before placing the meat, and let it reach room temperature before grilling. Don't flip the meat too often — once is enough for perfect grill marks.
          </p>
          <p>
            Learn more BBQ tips in our <Link to="/blog/bbq-meat-guide-uae" className="text-primary hover:underline">comprehensive BBQ guide</Link> on our blog.
          </p>
          <h3 className="text-xl font-semibold text-foreground">BBQ Catering for Events</h3>
          <p>
            We offer <Link to="/catering" className="text-primary hover:underline">complete BBQ catering services</Link> for large events — weddings, corporate parties, family gatherings, and private celebrations. Our team handles preparation, cutting, and marinating all meats based on guest count and budget.
          </p>
          <h3 className="text-xl font-semibold text-foreground">BBQ Meat Delivery in Abu Dhabi</h3>
          <p>
            We deliver ready-to-grill BBQ meats across all Abu Dhabi areas including <Link to="/butcher-al-reem-island" className="text-primary hover:underline">Al Reem Island</Link>, <Link to="/butcher-khalifa-city" className="text-primary hover:underline">Khalifa City</Link>, <Link to="/butcher-al-raha" className="text-primary hover:underline">Al Raha</Link>, and Saadiyat. Order via WhatsApp 0566808565 or through our <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
          </p>
        </div>
      </div>
    }
    faqs={[
      { question: "Where can I buy BBQ meat in Abu Dhabi?", answer: "Al Saraya Butchery offers the best selection of ready-to-grill BBQ meats in Abu Dhabi with same-day delivery. Order via WhatsApp at 0566808565." },
      { question: "Do you offer pre-marinated BBQ meat?", answer: "Yes, we offer a wide range of pre-marinated meats including shish tawook, kebab, tikka, chicken wings, and more in various Middle Eastern marinades." },
      { question: "What's included in the family BBQ box?", answer: "Our family BBQ boxes include a curated selection of kebab, tikka, shish tawook, steaks, and chicken — enough for 4-8 people depending on box size." },
      { question: "Do you provide BBQ catering for events?", answer: "Yes, we offer complete BBQ catering for weddings, corporate events, and private parties. Contact us for custom menus and pricing." },
      { question: "Is your BBQ meat halal?", answer: "Yes, 100% of our meats are halal certified and slaughtered according to Islamic guidelines." },
    ]}
  />
);

export default BBQMeatAbuDhabiPage;
