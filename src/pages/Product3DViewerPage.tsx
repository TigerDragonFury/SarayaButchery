import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ProductViewer3D from '@/components/shared/ProductViewer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  MessageCircle, 
  Info, 
  Truck,
  Shield,
  Star
} from 'lucide-react';

// Demo products with 3D models
// NOTE: Replace these with your actual .glb file paths
const demoProducts = [
  {
    id: 'lamb-chops',
    name: 'ريش غنم أسترالي',
    nameEn: 'Australian Lamb Chops',
    description: 'ريش غنم أسترالي طازج، مقطع بعناية من أفضل القطعيات. مثالي للشوي والمناسبات.',
    price: 89,
    unit: 'كيلو',
    // Replace with your actual GLB file path
    modelSrc: '/models/lamb-chops.glb',
    iosSrc: '/models/lamb-chops.usdz',
    poster: '/images/lamb-chops-poster.jpg',
    features: ['حلال 100%', 'طازج يومياً', 'مبرد'],
    rating: 4.9,
    reviews: 124,
  },
  {
    id: 'ribeye-steak',
    name: 'ستيك ريب آي',
    nameEn: 'Ribeye Steak',
    description: 'قطعة ريب آي فاخرة من اللحم البقري المميز، مناسبة للشوي والقلي.',
    price: 145,
    unit: 'كيلو',
    modelSrc: '/models/ribeye-steak.glb',
    iosSrc: '/models/ribeye-steak.usdz',
    poster: '/images/ribeye-poster.jpg',
    features: ['USDA Choice', 'مُعتق 21 يوم', 'مبرد'],
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 'tomahawk',
    name: 'توماهوك ستيك',
    nameEn: 'Tomahawk Steak',
    description: 'قطعة توماهوك الشهيرة بالعظم الطويل، من أفخر قطع اللحم البقري.',
    price: 220,
    unit: 'قطعة',
    modelSrc: '/models/tomahawk.glb',
    iosSrc: '/models/tomahawk.usdz',
    poster: '/images/tomahawk-poster.jpg',
    features: ['بلاك أنجوس', 'Prime Grade', 'مُعتق'],
    rating: 5.0,
    reviews: 56,
  },
];

const Product3DViewerPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]);

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(
      `مرحبًا، أريد طلب: ${selectedProduct.name} (${selectedProduct.nameEn}) - ${selectedProduct.price} د.إ/${selectedProduct.unit}`
    );
    window.open(`https://wa.me/971566808565?text=${message}`, '_blank');
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12" dir="rtl">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              تقنية العرض ثلاثي الأبعاد
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              شاهد منتجاتنا بتقنية 3D
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              استكشف منتجات السرايا بتقنية العرض ثلاثي الأبعاد. قم بتدوير المنتج 360 درجة، 
              أو استخدم الواقع المعزز لرؤيته على طاولتك!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8" dir="rtl">
            {/* 3D Viewer */}
            <div className="order-1 lg:order-2">
              <ProductViewer3D
                modelSrc={selectedProduct.modelSrc}
                iosSrc={selectedProduct.iosSrc}
                poster={selectedProduct.poster}
                alt={selectedProduct.name}
                productName={selectedProduct.name}
                price={`${selectedProduct.price} د.إ/${selectedProduct.unit}`}
                enableAR={true}
                enableGyroscope={true}
                shadowIntensity={1.2}
                height="500px"
                className="sticky top-24"
              />

              {/* Instructions */}
              <Card className="mt-4 bg-muted/30 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">كيفية الاستخدام:</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• اسحب بالماوس أو بإصبعك للتدوير 360°</li>
                        <li>• استخدم العجلة أو اضغط بإصبعين للتكبير/التصغير</li>
                        <li>• على الجوال: فعّل الجيروسكوب لتدوير المنتج بحركة الجهاز</li>
                        <li>• اضغط AR لعرض المنتج على طاولتك بالواقع المعزز</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Details */}
            <div className="order-2 lg:order-1 space-y-6">
              {/* Product Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">اختر المنتج</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {demoProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-4 rounded-lg border text-right transition-all ${
                          selectedProduct.id === product.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-foreground">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.nameEn}</p>
                          </div>
                          <span className="font-bold text-primary">
                            {product.price} د.إ
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(selectedProduct.rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({selectedProduct.reviews} تقييم)
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-muted-foreground mb-4">{selectedProduct.nameEn}</p>
                  
                  <p className="text-muted-foreground mb-6">
                    {selectedProduct.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProduct.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      {selectedProduct.price} د.إ
                    </span>
                    <span className="text-muted-foreground">
                      /{selectedProduct.unit}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={handleWhatsAppOrder}
                    >
                      <MessageCircle className="w-4 h-4" />
                      اطلب عبر واتساب
                    </Button>
                    <Button variant="outline" size="icon">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">توصيل سريع</p>
                      <p className="text-xs text-muted-foreground">خلال 2-4 ساعات</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">ضمان الجودة</p>
                      <p className="text-xs text-muted-foreground">100% حلال</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Developer Instructions */}
          <Card className="mt-12 bg-foreground text-background">
            <CardHeader>
              <CardTitle className="text-xl">📁 أين ترفع ملفات 3D؟</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="structure" className="w-full">
                <TabsList className="bg-background/10">
                  <TabsTrigger value="structure">هيكل الملفات</TabsTrigger>
                  <TabsTrigger value="formats">الصيغ المدعومة</TabsTrigger>
                  <TabsTrigger value="tips">نصائح</TabsTrigger>
                </TabsList>
                
                <TabsContent value="structure" className="mt-4">
                  <div className="bg-background/10 rounded-lg p-4 font-mono text-sm">
                    <pre className="text-background/90">{`public/
├── models/
│   ├── lamb-chops.glb      ← نموذج GLB للويب
│   ├── lamb-chops.usdz     ← نموذج USDZ لـ iOS AR
│   ├── ribeye-steak.glb
│   ├── ribeye-steak.usdz
│   └── tomahawk.glb
├── images/
│   ├── lamb-chops-poster.jpg  ← صورة تظهر أثناء التحميل
│   └── ribeye-poster.jpg`}</pre>
                  </div>
                  <p className="mt-3 text-sm text-background/70">
                    ارفع ملفات .glb و .usdz في مجلد <code className="bg-background/10 px-1 rounded">public/models/</code>
                  </p>
                </TabsContent>

                <TabsContent value="formats" className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 bg-background/10 rounded-lg p-4">
                    <Badge className="bg-blue-500">.GLB</Badge>
                    <div>
                      <p className="font-medium">للويب وأندرويد</p>
                      <p className="text-sm text-background/70">
                        الصيغة الرئيسية للعرض ثلاثي الأبعاد. يمكن تصديرها من Blender أو أي برنامج 3D.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-background/10 rounded-lg p-4">
                    <Badge className="bg-orange-500">.USDZ</Badge>
                    <div>
                      <p className="font-medium">لـ iOS AR (Quick Look)</p>
                      <p className="text-sm text-background/70">
                        مطلوب لتفعيل AR على أجهزة iPhone/iPad. يمكن تحويله باستخدام Reality Converter.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="mt-4">
                  <ul className="space-y-2 text-sm text-background/90">
                    <li>✓ حافظ على حجم الملف أقل من 10MB للتحميل السريع</li>
                    <li>✓ استخدم textures بدقة 1024x1024 أو أقل</li>
                    <li>✓ تأكد من أن النموذج مُضاء بشكل صحيح (PBR materials)</li>
                    <li>✓ اختبر AR على جهاز حقيقي (iOS Safari أو Android Chrome)</li>
                    <li>✓ أضف صورة poster تظهر أثناء تحميل النموذج</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Product3DViewerPage;
