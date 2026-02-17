import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Network } from '@capacitor/network';
import { WifiOff, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import DriverMobileNav from './DriverMobileNav';
import { cn } from '@/lib/utils';

interface DriverAppShellProps {
  children: ReactNode;
}

const DriverAppShell = ({ children }: DriverAppShellProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(false);
  
  const isDriverRoute = location.pathname.startsWith('/driver');

  // Handle network status
  useEffect(() => {
    const checkNetwork = async () => {
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        setIsOffline(!status.connected);

        Network.addListener('networkStatusChange', (status) => {
          setIsOffline(!status.connected);
        });
      }
    };

    checkNetwork();

    return () => {
      if (Capacitor.isNativePlatform()) {
        Network.removeAllListeners();
      }
    };
  }, []);

  // Configure status bar for driver app
  useEffect(() => {
    const configureStatusBar = async () => {
      if (Capacitor.isNativePlatform() && isDriverRoute) {
        try {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#1e40af' }); // Blue for driver
        } catch (e) {
          console.error('StatusBar error:', e);
        }
      }
    };

    configureStatusBar();
  }, [isDriverRoute]);

  if (!isDriverRoute) {
    return <>{children}</>;
  }

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col bg-background",
        isRTL && "rtl"
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Driver Header Bar */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-blue-700 text-white"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6" />
            <span className="font-bold text-lg">
              {isRTL ? 'سائق السرايا' : 'Saraya Driver'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isOffline && (
              <div className="flex items-center gap-1 text-yellow-300 text-sm">
                <WifiOff className="w-4 h-4" />
                <span>{isRTL ? 'غير متصل' : 'Offline'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {isOffline && (
        <div 
          className="fixed top-14 left-0 right-0 z-40 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium"
          style={{ top: 'calc(56px + env(safe-area-inset-top, 0px))' }}
        >
          <WifiOff className="w-4 h-4 inline me-2" />
          {isRTL 
            ? 'لا يوجد اتصال بالإنترنت. سيتم مزامنة التحديثات عند الاتصال.' 
            : 'No internet connection. Updates will sync when connected.'}
        </div>
      )}

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 overflow-y-auto",
          "pb-20" // Space for bottom nav
        )}
        style={{ 
          paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))',
          marginTop: isOffline ? '40px' : '0'
        }}
      >
        {children}
      </main>

      {/* Driver Bottom Navigation */}
      <DriverMobileNav />
    </div>
  );
};

export default DriverAppShell;
