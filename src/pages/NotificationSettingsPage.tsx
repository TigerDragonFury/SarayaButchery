import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Bell, Package, Truck, CheckCircle, XCircle, ChefHat, Megaphone } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface NotificationPrefs {
  order_confirmed: boolean;
  order_preparing: boolean;
  order_ready: boolean;
  order_out_for_delivery: boolean;
  order_delivered: boolean;
  order_cancelled: boolean;
  promotions: boolean;
}

const defaultPrefs: NotificationPrefs = {
  order_confirmed: true,
  order_preparing: true,
  order_ready: true,
  order_out_for_delivery: true,
  order_delivered: true,
  order_cancelled: true,
  promotions: true,
};

const NotificationSettingsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/account');
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPrefs({
          order_confirmed: data.order_confirmed,
          order_preparing: data.order_preparing,
          order_ready: data.order_ready,
          order_out_for_delivery: data.order_out_for_delivery,
          order_delivered: data.order_delivered,
          order_cancelled: data.order_cancelled,
          promotions: data.promotions,
        });
      }
      setLoading(false);
    };
    loadPrefs();
  }, [navigate]);

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(
          { user_id: userId, ...prefs },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
      toast.success(isArabic ? 'تم حفظ إعدادات الإشعارات' : 'Notification settings saved');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const notificationItems = [
    {
      key: 'order_confirmed' as const,
      icon: CheckCircle,
      labelAr: 'تأكيد الطلب',
      labelEn: 'Order Confirmed',
      descAr: 'إشعار عند تأكيد طلبك',
      descEn: 'Notified when your order is confirmed',
    },
    {
      key: 'order_preparing' as const,
      icon: ChefHat,
      labelAr: 'تحضير الطلب',
      labelEn: 'Order Preparing',
      descAr: 'إشعار عند بدء تحضير طلبك',
      descEn: 'Notified when your order is being prepared',
    },
    {
      key: 'order_ready' as const,
      icon: Package,
      labelAr: 'الطلب جاهز',
      labelEn: 'Order Ready',
      descAr: 'إشعار عند جاهزية طلبك',
      descEn: 'Notified when your order is ready',
    },
    {
      key: 'order_out_for_delivery' as const,
      icon: Truck,
      labelAr: 'الطلب في الطريق',
      labelEn: 'Out for Delivery',
      descAr: 'إشعار عند خروج طلبك للتوصيل',
      descEn: 'Notified when your order is out for delivery',
    },
    {
      key: 'order_delivered' as const,
      icon: CheckCircle,
      labelAr: 'تم التوصيل',
      labelEn: 'Order Delivered',
      descAr: 'إشعار عند وصول طلبك',
      descEn: 'Notified when your order is delivered',
    },
    {
      key: 'order_cancelled' as const,
      icon: XCircle,
      labelAr: 'إلغاء الطلب',
      labelEn: 'Order Cancelled',
      descAr: 'إشعار عند إلغاء طلبك',
      descEn: 'Notified when your order is cancelled',
    },
  ];

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
            <ArrowLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {isArabic ? 'إعدادات الإشعارات' : 'Notification Settings'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'تحكم في الإشعارات التي تصلك' : 'Control which notifications you receive'}
            </p>
          </div>
        </div>

        {/* Order Notifications */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                {isArabic ? 'إشعارات الطلبات' : 'Order Notifications'}
              </CardTitle>
            </div>
            <CardDescription>
              {isArabic ? 'إشعارات تحديثات حالة الطلب' : 'Order status update notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {notificationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">
                          {isArabic ? item.labelAr : item.labelEn}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? item.descAr : item.descEn}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={item.key}
                      checked={prefs[item.key]}
                      onCheckedChange={() => handleToggle(item.key)}
                    />
                  </div>
                  {index < notificationItems.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Promotions */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                {isArabic ? 'العروض والتسويق' : 'Promotions & Marketing'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3 flex-1">
                <div>
                  <Label htmlFor="promotions" className="font-medium cursor-pointer">
                    {isArabic ? 'العروض الخاصة' : 'Special Offers'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'إشعارات العروض والخصومات' : 'Deals and discount notifications'}
                  </p>
                </div>
              </div>
              <Switch
                id="promotions"
                checked={prefs.promotions}
                onCheckedChange={() => handleToggle('promotions')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving
            ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
            : (isArabic ? 'حفظ الإعدادات' : 'Save Settings')}
        </Button>
      </div>
    </PageLayout>
  );
};

export default NotificationSettingsPage;
