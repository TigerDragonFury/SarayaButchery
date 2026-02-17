import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag,
  ClipboardList,
  Settings,
  MoreHorizontal,
  Truck,
  MapPin,
  BarChart3,
  ChefHat,
  FolderTree,
  TestTube,
  Bell,
  MessageSquare,
  CalendarDays,
  Bot,
  Palette,
  Link2,
  Menu
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AdminSection } from '@/pages/AdminDashboardPage';

interface AdminDashboardMobileNavProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const AdminDashboardMobileNav = ({ activeSection, onSectionChange }: AdminDashboardMobileNavProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [moreOpen, setMoreOpen] = useState(false);

  const mainItems: { section: AdminSection; labelAr: string; labelEn: string; icon: any }[] = [
    { section: 'dashboard', labelAr: 'الرئيسية', labelEn: 'Home', icon: LayoutDashboard },
    { section: 'orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: ClipboardList },
    { section: 'kitchen', labelAr: 'المطبخ', labelEn: 'Kitchen', icon: ChefHat },
    { section: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
  ];

  const moreItems: { section: AdminSection; labelAr: string; labelEn: string; icon: any }[] = [
    { section: 'products', labelAr: 'المنتجات', labelEn: 'Products', icon: ShoppingBag },
    { section: 'categories', labelAr: 'الأقسام', labelEn: 'Categories', icon: FolderTree },
    { section: 'delivery', labelAr: 'التوصيل', labelEn: 'Delivery', icon: Package },
    { section: 'drivers', labelAr: 'السائقين', labelEn: 'Drivers', icon: Truck },
    { section: 'map', labelAr: 'الخريطة', labelEn: 'Map', icon: MapPin },
    { section: 'analytics', labelAr: 'تحليلات', labelEn: 'Stats', icon: BarChart3 },
    { section: 'alerts', labelAr: 'التنبيهات', labelEn: 'Alerts', icon: Bell },
    { section: 'butcher', labelAr: 'لوحة الجزار', labelEn: 'Butcher', icon: ChefHat },
    { section: 'feedback', labelAr: 'الملاحظات', labelEn: 'Feedback', icon: MessageSquare },
    { section: 'bookings', labelAr: 'الحجوزات', labelEn: 'Bookings', icon: CalendarDays },
    { section: 'ai-assistant', labelAr: 'مساعد AI', labelEn: 'AI', icon: Bot },
    { section: 'design-system', labelAr: 'التصميم', labelEn: 'Design', icon: Palette },
    { section: 'iiko-menu-link', labelAr: 'ربط iiko', labelEn: 'iiko Link', icon: Link2 },
    { section: 'menus', labelAr: 'القوائم', labelEn: 'Menus', icon: Menu },
    { section: 'iiko-test', labelAr: 'اختبار iiko', labelEn: 'iiko Test', icon: TestTube },
  ];

  const isMoreActive = moreItems.some(item => activeSection === item.section);

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
            const active = activeSection === item.section;
            
            return (
              <button
                key={item.section}
                onClick={() => onSectionChange(item.section)}
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
              </button>
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
              const active = activeSection === item.section;
              return (
                <button
                  key={item.section}
                  onClick={() => {
                    onSectionChange(item.section);
                    setMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-start",
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">
                    {isRTL ? item.labelAr : item.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminDashboardMobileNav;
