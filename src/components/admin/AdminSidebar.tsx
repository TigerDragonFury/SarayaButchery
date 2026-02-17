import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  Settings,
  BarChart3,
  Bell,
  MapPin,
  TestTube,
  ChefHat,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const AdminSidebar = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/delivery',
      labelAr: 'لوحة التحكم',
      labelEn: 'Dashboard',
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
      labelAr: 'إدارة الطلبات',
      labelEn: 'Manage Orders',
      icon: ClipboardList,
    },
    {
      path: '/admin/categories',
      labelAr: 'الأقسام',
      labelEn: 'Categories',
      icon: FolderTree,
    },
    {
      path: '/admin/orders',
      labelAr: 'التوصيل',
      labelEn: 'Delivery',
      icon: Package,
    },
    {
      path: '/admin/drivers',
      labelAr: 'السائقين',
      labelEn: 'Drivers',
      icon: Truck,
    },
    {
      path: '/admin/map',
      labelAr: 'خريطة التتبع',
      labelEn: 'Live Map',
      icon: MapPin,
    },
    {
      path: '/admin/analytics',
      labelAr: 'التحليلات',
      labelEn: 'Analytics',
      icon: BarChart3,
    },
    {
      path: '/admin/alerts',
      labelAr: 'التنبيهات',
      labelEn: 'Alerts',
      icon: Bell,
    },
    {
      path: '/admin/butcher',
      labelAr: 'لوحة الجزار',
      labelEn: 'Butcher Panel',
      icon: ChefHat,
    },
    {
      path: '/admin/feedback',
      labelAr: 'ملاحظات العملاء',
      labelEn: 'Feedback',
      icon: MessageSquare,
    },
    {
      path: '/admin/iiko-test',
      labelAr: 'اختبار iiko',
      labelEn: 'iiko Test',
      icon: TestTube,
    },
    {
      path: '/admin/settings',
      labelAr: 'الإعدادات',
      labelEn: 'Settings',
      icon: Settings,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-e bg-card min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
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

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          {isRTL ? 'ملحمة السرايا' : 'Al Saraya Butchery'}
          <br />
          {isRTL ? 'لوحة إدارة التوصيل' : 'Delivery Management'}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
