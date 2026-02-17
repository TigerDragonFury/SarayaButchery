import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/seo/SEOHead";
import PageLayout from "@/components/layout/PageLayout";

const TermsPage = () => {
  const { isRTL } = useLanguage();

  return (
    <PageLayout>
      <SEOHead
        title="الشروط والأحكام"
        titleEn="Terms and Conditions"
        description="الشروط والأحكام لملحمة السرايا"
        descriptionEn="Terms and Conditions for Al Saraya Butchery"
        canonical="/terms"
      />
      
      <div className="container mx-auto px-4 py-16" dir={isRTL ? "rtl" : "ltr"}>
        <h1 className="text-4xl font-bold text-center mb-12">
          {isRTL ? "الشروط والأحكام" : "Terms and Conditions"}
        </h1>
        
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          {isRTL ? (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. معلومات الشركة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>الاسم القانوني:</strong> شركة ملحمة السرايا ذ.م.م<br />
                  <strong>Al Saraya Butchery LLC</strong><br />
                  <strong>العنوان:</strong> أبوظبي، الإمارات العربية المتحدة<br />
                  <strong>الهاتف:</strong> 023339111<br />
                  <strong>البريد الإلكتروني:</strong> info@alsarayabutcheryllc.com
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. قبول الشروط</h2>
                <p className="text-muted-foreground leading-relaxed">
                  باستخدامك لموقع ملحمة السرايا، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
                  إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. المنتجات والخدمات</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نقدم لحوماً طازجة حلال 100% من أجود المصادر. جميع منتجاتنا تخضع لمعايير الجودة الصارمة 
                  ومعتمدة من الجهات المختصة في دولة الإمارات العربية المتحدة.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. الطلبات والتوصيل</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • نوفر خدمة التوصيل إلى جميع مناطق أبوظبي والإمارات<br />
                  • أوقات التوصيل: من 8 صباحاً حتى 11 مساءً<br />
                  • الحد الأدنى للطلب يتم تحديده عند الطلب<br />
                  • قد تختلف رسوم التوصيل حسب الموقع
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. حقوق الملكية الفكرية</h2>
                <p className="text-muted-foreground leading-relaxed">
                  جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات، 
                  هي ملك لشركة ملحمة السرايا ذ.م.م ومحمية بموجب قوانين حقوق الملكية الفكرية.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. تعديل الشروط</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. القانون المعمول به</h2>
                <p className="text-muted-foreground leading-relaxed">
                  تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة، 
                  وأي نزاعات تنشأ يتم حلها في محاكم إمارة أبوظبي.
                </p>
              </section>

              <section id="weight-policy" className="mb-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  ⚖️ 8. سياسة الوزن والتنظيف
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  <p>حرصًا على الشفافية مع عملائنا الكرام، يرجى العلم بما يلي:</p>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">1️⃣</span>
                      <p><strong>الوزن المعروض في الموقع هو وزن تقريبي قبل التنظيف والتقطيع.</strong><br />
                      بسبب إزالة الدهون، العظام، الجلد أو الأجزاء غير المطلوبة، قد يقل الوزن النهائي بعد التجهيز.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">2️⃣</span>
                      <p><strong>نسبة الفاقد الطبيعي أثناء التنظيف:</strong><br />
                      قد يتراوح الفاقد الطبيعي بين 5% إلى 20% حسب نوع المنتج وطريقة التقطيع المطلوبة.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">3️⃣</span>
                      <p><strong>الاحتساب المالي:</strong><br />
                      يتم احتساب السعر بناءً على الوزن قبل التنظيف كما هو موضح في الطلب.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">4️⃣</span>
                      <p>في حال طلب تقطيع خاص أو إزالة دهون إضافية، قد يؤثر ذلك على الوزن النهائي ولا يُعتبر فرق الوزن خطأ من المتجر.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">5️⃣</span>
                      <p><strong>بإتمام الطلب، يقر العميل بموافقته على سياسة الوزن والتنظيف المذكورة أعلاه.</strong></p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Company Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Legal Name:</strong> Al Saraya Butchery LLC<br />
                  <strong>شركة ملحمة السرايا ذ.م.م</strong><br />
                  <strong>Address:</strong> Abu Dhabi, United Arab Emirates<br />
                  <strong>Phone:</strong> 023339111<br />
                  <strong>Email:</strong> info@alsarayabutcheryllc.com
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By using Al Saraya Butchery website, you agree to be bound by these terms and conditions. 
                  If you do not agree to any of these terms, please do not use the website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Products and Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We offer 100% halal fresh meat from the finest sources. All our products undergo strict quality standards 
                  and are certified by competent authorities in the United Arab Emirates.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Orders and Delivery</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • We provide delivery service to all areas of Abu Dhabi and the Emirates<br />
                  • Delivery hours: 8 AM to 11 PM<br />
                  • Minimum order is determined at checkout<br />
                  • Delivery fees may vary by location
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this website, including text, images, and logos, 
                  is the property of Al Saraya Butchery LLC and is protected by intellectual property laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Modification of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Any changes will be posted on this page.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms are governed by the laws of the United Arab Emirates, 
                  and any disputes shall be resolved in the courts of Abu Dhabi Emirate.
                </p>
              </section>

              <section id="weight-policy" className="mb-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  ⚖️ 8. Weight & Cleaning Policy
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  <p>For full transparency with our valued customers, please note the following:</p>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">1️⃣</span>
                      <p><strong>The weight displayed on the website is an approximate weight before cleaning and cutting.</strong><br />
                      Due to the removal of fat, bones, skin, or unwanted parts, the final weight may decrease after preparation.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">2️⃣</span>
                      <p><strong>Natural loss during cleaning:</strong><br />
                      Natural loss may range between 5% to 20% depending on the product type and the requested cutting method.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">3️⃣</span>
                      <p><strong>Price calculation:</strong><br />
                      The price is calculated based on the weight before cleaning as shown in the order.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">4️⃣</span>
                      <p>If special cutting or additional fat removal is requested, this may affect the final weight and the weight difference is not considered a store error.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-bold shrink-0">5️⃣</span>
                      <p><strong>By completing the order, the customer acknowledges acceptance of the above weight and cleaning policy.</strong></p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default TermsPage;
