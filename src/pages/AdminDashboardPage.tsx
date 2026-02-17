import { lazy, Suspense, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { AdminEmbeddedProvider } from '@/contexts/AdminEmbeddedContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminOrderSearch from '@/components/admin/AdminOrderSearch';
import AdminDashboardSidebar from '@/components/admin/AdminDashboardSidebar';
import AdminDashboardMobileNav from '@/components/admin/AdminDashboardMobileNav';
import LanguageToggle from '@/components/shared/LanguageToggle';
import { cn } from '@/lib/utils';

// Lazy load all admin sections
const AdminDeliveryDashboard = lazy(() => import('./AdminDeliveryDashboard'));
const AdminProductsPage = lazy(() => import('./AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./AdminOrdersPage'));
const AdminCategoriesPage = lazy(() => import('./AdminCategoriesPage'));
const AdminSettingsPage = lazy(() => import('./AdminSettingsPage'));
const AdminLiveMapPage = lazy(() => import('./AdminLiveMapPage'));
const AdminIikoTestPage = lazy(() => import('./AdminIikoTestPage'));
const AdminAnalyticsPage = lazy(() => import('./AdminAnalyticsPage'));
const AdminFeedbackPage = lazy(() => import('./AdminFeedbackPage'));
const ButcherDashboard = lazy(() => import('./ButcherDashboard'));
const KitchenModePage = lazy(() => import('./KitchenModePage'));
const CommandCenter = lazy(() => import('@/components/admin/CommandCenter'));
const AdminBookingsPage = lazy(() => import('./AdminBookingsPage'));
const AdminAIAssistantPage = lazy(() => import('./AdminAIAssistantPage'));
const AdminDesignSystemPage = lazy(() => import('./AdminDesignSystemPage'));
const AdminIikoMenuLinkPage = lazy(() => import('./AdminIikoMenuLinkPage'));
const AdminMenusPage = lazy(() => import('./AdminMenusPage'));
export type AdminSection = 
  | 'dashboard' 
  | 'products' 
  | 'orders' 
  | 'categories' 
  | 'delivery' 
  | 'drivers' 
  | 'map' 
  | 'analytics' 
  | 'alerts' 
  | 'butcher' 
  | 'feedback' 
  | 'iiko-test' 
  | 'kitchen'
  | 'bookings'
  | 'ai-assistant'
  | 'design-system'
  | 'iiko-menu-link'
  | 'menus'
  | 'settings';

const sectionTitles: Record<AdminSection, { ar: string; en: string }> = {
  dashboard: { ar: 'مركز القيادة', en: 'Command Center' },
  products: { ar: 'المنتجات', en: 'Products' },
  orders: { ar: 'إدارة الطلبات', en: 'Manage Orders' },
  categories: { ar: 'الأقسام', en: 'Categories' },
  delivery: { ar: 'التوصيل', en: 'Delivery' },
  drivers: { ar: 'السائقين', en: 'Drivers' },
  map: { ar: 'خريطة التتبع', en: 'Live Map' },
  analytics: { ar: 'التحليلات', en: 'Analytics' },
  alerts: { ar: 'التنبيهات', en: 'Alerts' },
  butcher: { ar: 'لوحة الجزار', en: 'Butcher Panel' },
  feedback: { ar: 'ملاحظات العملاء', en: 'Feedback' },
  'iiko-test': { ar: 'اختبار iiko', en: 'iiko Test' },
  kitchen: { ar: 'شاشة المطبخ', en: 'Kitchen Display' },
  bookings: { ar: 'جدول الحجوزات', en: 'Daily Bookings' },
  'ai-assistant': { ar: 'مساعد الذكاء الاصطناعي', en: 'AI Assistant' },
  'design-system': { ar: 'نظام التصميم', en: 'Design System' },
  'iiko-menu-link': { ar: 'ربط قائمة iiko', en: 'iiko Menu Link' },
  menus: { ar: 'إدارة القوائم', en: 'Menu Management' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
};

const SectionLoader = () => (
  <div className="flex items-center justify-center p-12">
    <Skeleton className="h-12 w-48" />
  </div>
);

const AdminDashboardPage = () => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const { isLoading, isAdmin } = useAdminAuth('admin');
  const { isMuted, toggleMute } = useSoundSettings();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const handleSectionChange = useCallback((section: AdminSection) => {
    setActiveSection(section);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-center">
          {isRTL ? 'غير مصرح' : 'Access Denied'}
        </h1>
        <p className="text-muted-foreground text-center">
          {isRTL ? 'هذه الصفحة للمسؤولين فقط' : 'This page is for administrators only'}
        </p>
      </div>
    );
  }

  const currentTitle = sectionTitles[activeSection];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <CommandCenter />
            <AdminDeliveryDashboard />
          </div>
        );
      case 'delivery':
      case 'drivers':
      case 'alerts':
        return <AdminDeliveryDashboard />;
      case 'products':
        return <AdminProductsPage />;
      case 'orders':
        return <AdminOrdersPage />;
      case 'categories':
        return <AdminCategoriesPage />;
      case 'settings':
        return <AdminSettingsPage />;
      case 'map':
        return <AdminLiveMapPage />;
      case 'analytics':
        return <AdminAnalyticsPage />;
      case 'iiko-test':
        return <AdminIikoTestPage />;
      case 'feedback':
        return <AdminFeedbackPage />;
      case 'butcher':
        return <ButcherDashboard />;
      case 'kitchen':
        return <KitchenModePage />;
      case 'bookings':
        return <AdminBookingsPage />;
      case 'ai-assistant':
        return <AdminAIAssistantPage />;
      case 'design-system':
        return <AdminDesignSystemPage />;
      case 'iiko-menu-link':
        return <AdminIikoMenuLinkPage />;
      case 'menus':
        return <AdminMenusPage />;
      default:
        return <AdminDeliveryDashboard />;
    }
  };

  return (
    <AdminEmbeddedProvider value={true}>
      <div className={cn("flex min-h-screen bg-background", isRTL && "rtl")} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Desktop Sidebar */}
        <AdminDashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold lg:hidden shrink-0">
                {isRTL ? currentTitle.ar : currentTitle.en}
              </h1>
              <div className="flex-1 flex justify-end lg:justify-start gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                  className="h-10 w-10"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary" />
                  )}
                </Button>
                <LanguageToggle />
                <AdminOrderSearch />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
            <Suspense fallback={<SectionLoader />}>
              {renderSection()}
            </Suspense>
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <AdminDashboardMobileNav 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
      </div>
    </AdminEmbeddedProvider>
  );
};

export default AdminDashboardPage;
