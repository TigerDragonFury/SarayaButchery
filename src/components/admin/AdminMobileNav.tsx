import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag,
  ClipboardList,
  Settings,
  MoreHorizontal,
  X,
  Truck,
  MapPin,
  BarChart3,
  ChefHat,
  FolderTree,
  TestTube,
  Bell
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const AdminMobileNav = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const mainItems = [
    {
      path: '/admin/delivery',
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/products',
      labelAr: 'المنتجات',
      labelEn: 'Products',
      icon: ShoppingBag,
    },
    {
      path: '/admin/orders-manage',
      labelAr: 'الطلبات',
      labelEn: 'Orders',
      icon: ClipboardList,
    },
    {
      path: '/admin/settings',
      labelAr: 'الإعدادات',
      labelEn: 'Settings',
      icon: Settings,
    },
  ];

  const moreItems = [
    { path: '/admin/categories', labelAr: 'الأقسام', labelEn: 'Categories', icon: FolderTree },
    { path: '/admin/orders', labelAr: 'التوصيل', labelEn: 'Delivery', icon: Package },
    { path: '/admin/drivers', labelAr: 'السائقين', labelEn: 'Drivers', icon: Truck },
    { path: '/admin/map', labelAr: 'الخريطة', labelEn: 'Map', icon: MapPin },
    { path: '/admin/analytics', labelAr: 'تحليلات', labelEn: 'Stats', icon: BarChart3 },
    { path: '/admin/alerts', labelAr: 'التنبيهات', labelEn: 'Alerts', icon: Bell },
    { path: '/admin/butcher', labelAr: 'لوحة الجزار', labelEn: 'Butcher', icon: ChefHat },
    { path: '/admin/iiko-test', labelAr: 'اختبار iiko', labelEn: 'iiko Test', icon: TestTube },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isMoreActive = moreItems.some(item => isActive(item.path));

  return (
    <>
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
          "bg-card/95 backdrop-blur-lg border-t border-border"
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-16">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "w-full h-full relative",
                  "transition-all duration-200",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active && "scale-110"
                  )} 
                />
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  active && "font-bold"
                )}>
                  {isRTL ? item.labelAr : item.labelEn}
                </span>
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center",
              "w-full h-full relative",
              "transition-all duration-200",
              isMoreActive
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className={cn(
              "text-[10px] mt-1 font-medium",
              isMoreActive && "font-bold"
            )}>
              {isRTL ? 'المزيد' : 'More'}
            </span>
            {isMoreActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* More Sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side={isRTL ? 'right' : 'left'} className="w-72">
          <SheetHeader>
            <SheetTitle>{isRTL ? 'المزيد' : 'More'}</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 space-y-1">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">
                    {isRTL ? item.labelAr : item.labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminMobileNav;