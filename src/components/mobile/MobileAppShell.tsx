import { ReactNode, lazy, Suspense, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { NativeState } from './MobileNativeEffects';

const SeasonalBanner = lazy(() => import('@/components/shared/SeasonalBanner'));
const MobileNativeEffects = lazy(() => import('./MobileNativeEffects'));

interface MobileAppShellProps {
  children: ReactNode;
}

// Routes that should NOT show customer bottom navigation (they have their own shells)
const HIDE_CUSTOMER_NAV_ROUTES = [
  '/checkout',
  '/order-success',
  '/driver',  // Driver app has its own shell
  '/admin',   // Admin panel has its own layout
];

const MobileAppShell = ({ children }: MobileAppShellProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [nativeState, setNativeState] = useState<NativeState>({
    networkConnected: true,
    keyboardHeight: 0,
    isKeyboardVisible: false,
  });

  const handleNativeState = useCallback((s: NativeState) => setNativeState(s), []);

  // Check if current route should hide bottom nav
  const shouldHideNav = HIDE_CUSTOMER_NAV_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  // For driver and admin routes, render children without customer shell
  if (location.pathname.startsWith('/driver') || location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col",
        isMobile && !shouldHideNav && "pb-16"
      )}
      style={{
        paddingBottom: nativeState.isKeyboardVisible ? nativeState.keyboardHeight : undefined,
      }}
    >
      {/* Lazy-load native effects (Firebase, Capacitor) */}
      <Suspense fallback={null}>
        <MobileNativeEffects onState={handleNativeState} />
      </Suspense>

      {/* Seasonal Banner */}
      <Suspense fallback={null}>
        <SeasonalBanner />
      </Suspense>

      {/* Offline Banner */}
      {!nativeState.networkConnected && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>{isArabic ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection'}</span>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        !nativeState.networkConnected && "mt-10"
      )}>
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only (Customer App) */}
      {isMobile && !shouldHideNav && <MobileBottomNav />}
    </div>
  );
};

export default MobileAppShell;
