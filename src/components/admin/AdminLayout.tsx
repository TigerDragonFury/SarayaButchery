import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminEmbedded } from '@/contexts/AdminEmbeddedContext';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from './AdminSidebar';
import AdminMobileNav from './AdminMobileNav';
import AdminOrderSearch from './AdminOrderSearch';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  titleAr?: string;
}

const AdminLayout = ({ children, title, titleAr }: AdminLayoutProps) => {
  const isEmbedded = useAdminEmbedded();
  
  // When embedded inside AdminDashboardPage, skip the layout shell
  if (isEmbedded) {
    return <>{children}</>;
  }

  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { isLoading, isAdmin } = useAdminAuth('admin');
  const { isMuted, toggleMute } = useSoundSettings();

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

  return (
    <div className={cn("flex min-h-screen bg-background", isRTL && "rtl")} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with Search */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold lg:hidden shrink-0">
              {isRTL ? (titleAr || 'لوحة الإدارة') : (title || 'Admin Panel')}
            </h1>
            <div className="flex-1 flex justify-end lg:justify-start gap-3">
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
              <AdminOrderSearch />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <AdminMobileNav />
    </div>
  );
};

export default AdminLayout;
