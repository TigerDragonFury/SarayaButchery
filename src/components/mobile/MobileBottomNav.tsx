import { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
// Capacitor loaded dynamically to keep it out of the main bundle

const MobileBottomNav = forwardRef<HTMLElement, object>((_, ref) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { totalItems } = useCart();
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      icon: Home,
    },
    {
      path: '/shop',
      labelAr: 'المفضلة',
      labelEn: 'Favorites',
      icon: Heart,
    },
    {
      path: '/products',
      labelAr: 'الأقسام',
      labelEn: 'Categories',
      icon: LayoutGrid,
    },
    {
      path: '/cart',
      labelAr: 'السلة',
      labelEn: 'Cart',
      icon: ShoppingCart,
      badge: totalItems,
    },
    {
      path: '/account',
      labelAr: 'حسابي',
      labelEn: 'Account',
      icon: User,
    },
  ];

  const handleNavClick = async () => {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch {
      // Not native or haptics unavailable
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-lg border-t border-border",
        "pb-safe-area-inset-bottom",
        "md:hidden"
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14">
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
                    "h-5 w-5 transition-transform duration-200",
                    active && "scale-110"
                  )} 
                  fill={active && item.icon === Heart ? "currentColor" : "none"}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 font-medium",
                active && "font-bold"
              )}>
                {isArabic ? item.labelAr : item.labelEn}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;
