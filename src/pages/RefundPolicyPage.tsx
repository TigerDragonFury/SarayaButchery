import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/seo/SEOHead";
import PageLayout from "@/components/layout/PageLayout";

const RefundPolicyPage = () => {
  const { isRTL } = useLanguage();

  return (
    <PageLayout>
      <SEOHead
        title="سياسة الاسترجاع"
        titleEn="Refund Policy"
        description="سياسة الاسترجاع والاستبدال لملحمة السرايا"
        descriptionEn="Refund and Exchange Policy for Al Saraya Butchery"
        canonical="/refund-policy"
      />
      
      <div className="container mx-auto px-4 py-16" dir={isRTL ? "rtl" : "ltr"}>
        <h1 className="text-4xl font-bold text-center mb-12">
          {isRTL ? "سياسة الاسترجاع والاستبدال" : "Refund and Exchange Policy"}
        </h1>
        
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          {isRTL ? (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. ضمان الجودة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نلتزم في ملحمة السرايا بتقديم أجود اللحوم الطازجة. إذا لم تكن راضياً عن جودة المنتج، 
                  نضمن لك حقك في الاسترجاع أو الاستبدال.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. شروط الاسترجاع</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • يجب الإبلاغ عن أي مشكلة خلال 24 ساعة من استلام الطلب<br />
                  • يجب أن يكون المنتج في حالته الأصلية ومحفوظاً بشكل صحيح<br />
                  • يجب تقديم إثبات الشراء (الفاتورة أو رقم الطلب)<br />
                  • يجب إرفاق صور توضح المشكلة إن وجدت
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. حالات الاسترجاع المقبولة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • وجود عيب في جودة المنتج<br />
                  • استلام منتج مختلف عن الطلب<br />
                  • تلف المنتج أثناء التوصيل<br />
                  • عدم مطابقة الوزن للمطلوب
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. حالات لا يُقبل فيها الاسترجاع</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • مرور أكثر من 24 ساعة على الاستلام<br />
                  • سوء تخزين المنتج من قبل العميل<br />
                  • المنتجات المحضرة حسب طلب خاص<br />
                  • تغيير رأي العميل بعد الاستلام
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. طريقة الاسترجاع</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • التواصل معنا عبر الهاتف: 023339111<br />
                  • أو عبر واتساب: 971566808565<br />
                  • أو البريد الإلكتروني: info@alsarayabutcheryllc.com<br />
                  • سيتم معالجة طلبك خلال 24-48 ساعة
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. طرق التعويض</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • استبدال المنتج بمنتج مماثل<br />
                  • استرداد المبلغ بنفس طريقة الدفع الأصلية<br />
                  • رصيد للاستخدام في الطلبات المستقبلية<br />
                  • يتم إرجاع المبلغ خلال 5-7 أيام عمل
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Quality Guarantee</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At Al Saraya Butchery, we are committed to providing the finest fresh meat. If you are not satisfied 
                  with the product quality, we guarantee your right to a refund or exchange.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Refund Conditions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • Any issue must be reported within 24 hours of receiving the order<br />
                  • The product must be in its original condition and properly stored<br />
                  • Proof of purchase must be provided (invoice or order number)<br />
                  • Photos showing the issue must be attached if applicable
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Accepted Refund Cases</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • Defect in product quality<br />
                  • Receiving a different product than ordered<br />
                  • Product damaged during delivery<br />
                  • Weight not matching the order
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Non-Refundable Cases</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • More than 24 hours since receipt<br />
                  • Poor storage by the customer<br />
                  • Custom-prepared products<br />
                  • Customer change of mind after receipt
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. How to Request a Refund</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • Contact us by phone: 023339111<br />
                  • Or via WhatsApp: 971566808565<br />
                  • Or email: info@alsarayabutcheryllc.com<br />
                  • Your request will be processed within 24-48 hours
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Compensation Methods</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • Exchange for a similar product<br />
                  • Refund via the original payment method<br />
                  • Credit for future orders<br />
                  • Refund processed within 5-7 business days
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default RefundPolicyPage;
