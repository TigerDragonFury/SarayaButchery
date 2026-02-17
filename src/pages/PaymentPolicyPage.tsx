import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/seo/SEOHead";
import PageLayout from "@/components/layout/PageLayout";

const PaymentPolicyPage = () => {
  const { isRTL } = useLanguage();

  return (
    <PageLayout>
      <SEOHead
        title="سياسة الدفع"
        titleEn="Payment Policy"
        description="سياسة الدفع وطرق الدفع المتاحة في ملحمة السرايا"
        descriptionEn="Payment Policy and Available Payment Methods at Al Saraya Butchery"
        canonical="/payment-policy"
      />
      
      <div className="container mx-auto px-4 py-16" dir={isRTL ? "rtl" : "ltr"}>
        <h1 className="text-4xl font-bold text-center mb-12">
          {isRTL ? "سياسة الدفع" : "Payment Policy"}
        </h1>
        
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          {isRTL ? (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. طرق الدفع المتاحة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نوفر لعملائنا عدة خيارات للدفع لتسهيل عملية الشراء:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                  <li><strong>بطاقات الائتمان:</strong> Visa و MasterCard</li>
                  <li><strong>Apple Pay:</strong> للدفع السريع والآمن</li>
                  <li><strong>الدفع عند الاستلام (COD):</strong> نقداً أو بالبطاقة</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. أمان الدفع</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • جميع المعاملات مشفرة بتقنية SSL<br />
                  • نستخدم بوابة دفع آمنة ومعتمدة (Stripe)<br />
                  • لا نحتفظ ببيانات بطاقتك الائتمانية<br />
                  • معاملاتك محمية بأحدث معايير الأمان PCI DSS
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. العملة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  جميع الأسعار معروضة بالدرهم الإماراتي (AED). 
                  في حالة الدفع ببطاقة دولية، قد يتم تحويل العملة حسب سعر الصرف البنكي.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. تأكيد الطلب</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • ستتلقى تأكيداً فورياً عبر البريد الإلكتروني بعد إتمام الدفع<br />
                  • سيتضمن التأكيد تفاصيل الطلب ورقم التتبع<br />
                  • في حالة الدفع عند الاستلام، ستتلقى تأكيداً للطلب فقط
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. فشل الدفع</h2>
                <p className="text-muted-foreground leading-relaxed">
                  في حالة فشل عملية الدفع:<br />
                  • تأكد من صحة بيانات البطاقة<br />
                  • تأكد من توفر رصيد كافٍ<br />
                  • جرب طريقة دفع بديلة<br />
                  • تواصل معنا للمساعدة
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. الفواتير</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • ستصلك فاتورة إلكترونية مع كل طلب<br />
                  • يمكنك طلب فاتورة ضريبية إذا لزم الأمر<br />
                  • الفواتير متوافقة مع متطلبات ضريبة القيمة المضافة في الإمارات
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. للتواصل بخصوص الدفع</h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>شركة ملحمة السرايا ذ.م.م</strong><br />
                  أبوظبي، الإمارات العربية المتحدة<br />
                  هاتف: 023339111<br />
                  واتساب: 971566808565<br />
                  البريد: info@alsarayabutcheryllc.com
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Available Payment Methods</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We provide our customers with several payment options for convenient shopping:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                  <li><strong>Credit Cards:</strong> Visa and MasterCard</li>
                  <li><strong>Apple Pay:</strong> For quick and secure payments</li>
                  <li><strong>Cash on Delivery (COD):</strong> Cash or card payment</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Payment Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • All transactions are encrypted with SSL technology<br />
                  • We use a secure and certified payment gateway (Stripe)<br />
                  • We do not store your credit card information<br />
                  • Your transactions are protected by the latest PCI DSS security standards
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Currency</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All prices are displayed in UAE Dirhams (AED). 
                  When paying with an international card, currency conversion may apply at bank exchange rates.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Order Confirmation</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • You will receive instant confirmation via email after payment<br />
                  • Confirmation includes order details and tracking number<br />
                  • For COD, you will receive order confirmation only
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Payment Failure</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In case of payment failure:<br />
                  • Verify your card details are correct<br />
                  • Ensure sufficient balance is available<br />
                  • Try an alternative payment method<br />
                  • Contact us for assistance
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Invoices</h2>
                <p className="text-muted-foreground leading-relaxed">
                  • You will receive an electronic invoice with each order<br />
                  • Tax invoices available upon request<br />
                  • Invoices comply with UAE VAT requirements
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Payment Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Al Saraya Butchery LLC</strong><br />
                  Abu Dhabi, United Arab Emirates<br />
                  Phone: 023339111<br />
                  WhatsApp: 971566808565<br />
                  Email: info@alsarayabutcheryllc.com
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PaymentPolicyPage;
