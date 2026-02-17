import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
const SEOContentBlock = () => {
  const { isRTL } = useLanguage();

  return (
    <section className="py-16 lg:py-20 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        <article dir={isRTL ? "rtl" : "ltr"} className="prose prose-lg max-w-none dark:prose-invert">
          {isRTL ? (
            <>
              <h2 className="text-3xl lg:text-[40px] font-bold text-foreground mb-6 text-center">
                لماذا تختار ملحمة السرايا في أبوظبي؟
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">أفضل توصيل لحوم طازجة في أبوظبي</h3>
                  <p>
                    ملحمة السرايا هي وجهتك الأولى لشراء اللحوم الطازجة الحلال في أبوظبي والإمارات العربية المتحدة. نقدم <Link to="/fresh-meat-delivery-abu-dhabi" className="text-primary hover:underline">خدمة توصيل لحوم أبوظبي</Link> بأعلى معايير الجودة والنظافة، مع ضمان وصول طلبك طازجاً إلى باب منزلك في نفس اليوم. سواء كنت تبحث عن <Link to="/shop/beef" className="text-primary hover:underline">لحم بقري فاخر</Link>، <Link to="/shop/lamb" className="text-primary hover:underline">لحم غنم طازج</Link>، أو <Link to="/shop/chicken" className="text-primary hover:underline">دجاج محلي</Link>، فإن ملحمة السرايا توفر لك أفضل القطعيات بأسعار تنافسية.
                  </p>
                  <p>
                    نحن نفخر بكوننا <Link to="/butcher-abu-dhabi" className="text-primary hover:underline">أفضل ملحمة في أبوظبي</Link> الموثوقة التي تخدم العائلات والمطاعم والفنادق في جميع أنحاء الإمارات. يعمل فريقنا من الجزارين المحترفين على تقطيع اللحوم وفقاً لطلبك الخاص - سواء كانت شرائح ستيك، مكعبات للطبخ، لحم مفروم، أو قطع كاملة للمناسبات.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">لحوم حلال مضمونة 100٪</h3>
                  <p>
                    جميع لحومنا مذبوحة وفق أحكام الشريعة الإسلامية بنسبة 100٪ كونها <Link to="/halal-butcher-uae" className="text-primary hover:underline">ملحمة حلال معتمدة في الإمارات</Link>، ونحرص على استيراد أجود أنواع اللحوم من مصادر موثوقة حول العالم. نوفر لحوم بقري أسترالي وبرازيلي، لحم غنم أردني وأسترالي، ودجاج طازج محلي. كل قطعة لحم تمر بفحوصات جودة صارمة لضمان أفضل تجربة لعملائنا.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">لحوم مشاوي وشوي جاهزة في أبوظبي</h3>
                  <p>
                    هل تخطط لحفلة شواء أو مناسبة خاصة؟ ملحمة السرايا تقدم تشكيلة واسعة من لحوم المشاوي الجاهزة في أبوظبي. من ريب آي ستيك الفاخر إلى مشاكيك اللحم المتبلة، شيش طاووق، كفتة، وكباب - كل شيء محضّر ومتبّل بعناية وجاهز للشوي مباشرة.
                  </p>
                  <p>
                    نقدم أيضاً بوكسات اللحوم المميزة التي تناسب جميع المناسبات: بوكس العائلة، بوكس الشوي، بوكس البرجر، وبوكسات مخصصة حسب طلبك. كل بوكس يحتوي على تشكيلة منتقاة من أفضل قطع اللحوم الطازجة.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">خدمات تموين المناسبات</h3>
                  <p>
                    نقدم خدمات تموين متكاملة للأعراس، حفلات الشركات، المناسبات الخاصة، وحفلات الشوي في أبوظبي والإمارات. يشمل ذلك توفير اللحوم الطازجة بالكميات المطلوبة، التقطيع والتتبيل حسب الطلب، والتوصيل في الموعد المحدد.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">اطلب الآن - توصيل سريع في أبوظبي</h3>
                  <p>
                    يمكنك الطلب بسهولة عبر موقعنا الإلكتروني أو من خلال واتساب على الرقم 0566808565. نوفر خدمة التوصيل السريع في جميع مناطق أبوظبي بما في ذلك الكورنيش، المارينا، الريم، السعديات، مدينة خليفة، مدينة محمد بن زايد، والمصفح. زُرنا في فرعنا الرئيسي في برج الهنا - الكورنيش - أبوظبي، أو اتصل بنا على 023339111.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl lg:text-[40px] font-bold text-foreground mb-6 text-center">
                Why Choose Al Saraya Butchery in Abu Dhabi?
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-muted-foreground leading-relaxed">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Best Fresh Meat Delivery in Abu Dhabi</h3>
                  <p>
                    Al Saraya Butchery is your premier destination for <Link to="/fresh-meat-delivery-abu-dhabi" className="text-primary hover:underline">fresh halal meat delivery in Abu Dhabi</Link> and across the UAE. We offer same-day meat delivery with the highest standards of quality and hygiene, ensuring your order arrives fresh at your doorstep. Whether you're looking for <Link to="/shop/beef" className="text-primary hover:underline">premium beef</Link>, <Link to="/shop/lamb" className="text-primary hover:underline">fresh lamb</Link>, or <Link to="/shop/chicken" className="text-primary hover:underline">local chicken</Link>, Al Saraya Butchery provides the finest cuts at competitive prices.
                  </p>
                  <p>
                    We take pride in being <Link to="/butcher-abu-dhabi" className="text-primary hover:underline">Abu Dhabi's trusted halal butcher</Link>, serving families, restaurants, and hotels across the Emirates. Our team of professional butchers prepares meat to your exact specifications — whether it's steak slices, cubes for cooking, minced meat, or whole cuts for special occasions.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">100% Guaranteed Halal Meat</h3>
                  <p>
                    As a <Link to="/halal-butcher-uae" className="text-primary hover:underline">certified halal butcher in the UAE</Link>, all our meat is slaughtered in strict accordance with Islamic Sharia law. We source the finest quality meats from trusted suppliers worldwide, including Australian and Brazilian beef, Jordanian and Australian lamb, and fresh local chicken. Every cut undergoes rigorous quality checks to ensure the best experience for our customers.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Ready-to-Grill BBQ Meat in Abu Dhabi</h3>
                  <p>
                    Planning a BBQ party or special event? Al Saraya Butchery offers a wide selection of ready-to-grill BBQ meat in Abu Dhabi. From premium ribeye steaks to marinated meat skewers, shish tawook, kofta, and kebabs — everything is carefully prepared, seasoned, and ready to grill.
                  </p>
                  <p>
                    We also offer signature meat boxes for every occasion: Family Box, BBQ Box, Burger Box, and custom boxes tailored to your needs. Each box contains a curated selection of the finest fresh meat cuts.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">Event Catering Services</h3>
                  <p>
                    We provide comprehensive catering services for weddings, corporate events, private gatherings, and BBQ parties across Abu Dhabi and the UAE. This includes supplying fresh meat in required quantities, custom cutting and marinating, and on-time delivery.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">Order Now — Fast Delivery in Abu Dhabi</h3>
                  <p>
                    Order easily through our website or via WhatsApp at 0566808565. We offer fast delivery across all Abu Dhabi areas including Corniche, Marina, Al Reem, Saadiyat, Khalifa City, Mohammed Bin Zayed City, and Musaffah. Visit our main branch at Al Hana Tower, Corniche, Abu Dhabi, or call us at 023339111.
                  </p>
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
};

export default SEOContentBlock;
