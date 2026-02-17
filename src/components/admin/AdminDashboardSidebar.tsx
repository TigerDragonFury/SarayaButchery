import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Settings,
  BarChart3,
  Bell,
  MapPin,
  TestTube,
  ChefHat,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  MessageSquare,
  UtensilsCrossed,
  CalendarDays,
  Bot,
  Palette,
  Link2,
  Menu
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AdminSection } from '@/pages/AdminDashboardPage';

interface AdminDashboardSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const menuItems: { section: AdminSection; labelAr: string; labelEn: string; icon: any }[] = [
  { section: 'dashboard', labelAr: 'مركز القيادة', labelEn: 'Command Center', icon: LayoutDashboard },
  { section: 'orders', labelAr: 'إدارة الطلبات', labelEn: 'Orders', icon: ClipboardList },
  { section: 'kitchen', labelAr: 'شاشة المطبخ', labelEn: 'Kitchen', icon: UtensilsCrossed },
  { section: 'products', labelAr: 'المنتجات', labelEn: 'Products', icon: ShoppingBag },
  { section: 'categories', labelAr: 'الأقسام', labelEn: 'Categories', icon: FolderTree },
  { section: 'delivery', labelAr: 'التوصيل', labelEn: 'Delivery', icon: Package },
  { section: 'drivers', labelAr: 'السائقين', labelEn: 'Drivers', icon: Truck },
  { section: 'map', labelAr: 'خريطة التتبع', labelEn: 'Live Map', icon: MapPin },
  { section: 'analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: BarChart3 },
  { section: 'alerts', labelAr: 'التنبيهات', labelEn: 'Alerts', icon: Bell },
  { section: 'butcher', labelAr: 'لوحة الجزار', labelEn: 'Butcher Panel', icon: ChefHat },
  { section: 'feedback', labelAr: 'ملاحظات العملاء', labelEn: 'Feedback', icon: MessageSquare },
  { section: 'bookings', labelAr: 'جدول الحجوزات', labelEn: 'Daily Bookings', icon: CalendarDays },
  { section: 'iiko-test', labelAr: 'اختبار iiko', labelEn: 'iiko Test', icon: TestTube },
  { section: 'ai-assistant', labelAr: 'مساعد AI', labelEn: 'AI Assistant', icon: Bot },
  { section: 'design-system', labelAr: 'نظام التصميم', labelEn: 'Design System', icon: Palette },
  { section: 'iiko-menu-link', labelAr: 'ربط قائمة iiko', labelEn: 'iiko Menu Link', icon: Link2 },
  { section: 'menus', labelAr: 'إدارة القوائم', labelEn: 'Menus', icon: Menu },
  { section: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
];

const AdminDashboardSidebar = ({ activeSection, onSectionChange }: AdminDashboardSidebarProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <aside className="hidden lg:flex flex-col w-64 border-e bg-card min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.section;

          return (
            <button
              key={item.section}
              onClick={() => onSectionChange(item.section)}
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

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          {isRTL ? 'ملحمة السرايا' : 'Al Saraya Butchery'}
          <br />
          {isRTL ? 'لوحة الإدارة' : 'Admin Dashboard'}
        </div>
      </div>
    </aside>
  );
};

export default AdminDashboardSidebar;
