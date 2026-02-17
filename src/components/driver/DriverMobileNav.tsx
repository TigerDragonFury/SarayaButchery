import { Link, useLocation } from 'react-router-dom';
import { Package, MapPin, User, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const DriverMobileNav = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const location = useLocation();

  const navItems = [
    {
      path: '/driver',
      labelAr: 'الطلبات',
      labelEn: 'Orders',
      icon: Package,
    },
    {
      path: '/driver/map',
      labelAr: 'الخريطة',
      labelEn: 'Map',
      icon: MapPin,
    },
    {
      path: '/driver/notifications',
      labelAr: 'التنبيهات',
      labelEn: 'Alerts',
      icon: Bell,
    },
    {
      path: '/driver/profile',
      labelAr: 'حسابي',
      labelEn: 'Profile',
      icon: User,
    },
  ];

  const handleNavClick = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available
      }
    }
  };

  const isActive = (path: string) => {
    if (path === '/driver') return location.pathname === '/driver';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-lg border-t border-border",
        "pb-safe-area-inset-bottom"
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center",
                "w-full h-full relative",
                "transition-all duration-200",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    active && "scale-110"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[11px] mt-1 font-medium",
                active && "font-bold"
              )}>
                {isArabic ? item.labelAr : item.labelEn}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default DriverMobileNav;
