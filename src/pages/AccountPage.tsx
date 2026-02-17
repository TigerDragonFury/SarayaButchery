import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, Phone, LogOut, Package, MapPin, Heart, 
  Bell, Settings, ChevronRight, Shield
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useSmartReorder } from '@/hooks/useSmartReorder';

const AccountPage = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { preferences } = useSmartReorder();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      toast.error(isArabic ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    setSendingOtp(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+971${phone.replace(/^0/, '')}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setShowOtpInput(true);
      toast.success(isArabic ? 'تم إرسال رمز التحقق' : 'OTP sent successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error(isArabic ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter the 6-digit OTP');
      return;
    }

    setSendingOtp(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+971${phone.replace(/^0/, '')}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast.success(isArabic ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast.error(isArabic ? 'يرجى إدخال البريد وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setSendingOtp(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) throw error;
        toast.success(isArabic ? 'تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني' : 'Account created! Check your email');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(isArabic ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(isArabic ? 'تم تسجيل الخروج' : 'Logged out successfully');
  };

  const menuItems = [
    {
      icon: Package,
      labelAr: 'طلباتي',
      labelEn: 'My Orders',
      path: '/track',
    },
    {
      icon: Heart,
      labelAr: 'المفضلة',
      labelEn: 'Favorites',
      path: '/shop',
      badge: preferences.length,
    },
    {
      icon: MapPin,
      labelAr: 'عناويني',
      labelEn: 'My Addresses',
      path: '/addresses',
    },
    {
      icon: Bell,
      labelAr: 'إعدادات الإشعارات',
      labelEn: 'Notification Settings',
      path: '/notifications/settings',
    },
    {
      icon: Settings,
      labelAr: 'الإعدادات',
      labelEn: 'Settings',
      path: '/settings',
    },
  ];

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  // Not logged in - Show login form
  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>
                {isSignUp 
                  ? (isArabic ? 'إنشاء حساب' : 'Sign Up')
                  : (isArabic ? 'تسجيل الدخول' : 'Sign In')}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                {authMode === 'email'
                  ? (isArabic ? 'أدخل بريدك الإلكتروني للمتابعة' : 'Enter your email to continue')
                  : (isArabic ? 'أدخل رقم هاتفك للمتابعة' : 'Enter your phone number to continue')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auth Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setAuthMode('email')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'email' ? 'bg-background shadow' : 'text-muted-foreground'
                  }`}
                >
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </button>
                <button
                  onClick={() => setAuthMode('phone')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'phone' ? 'bg-background shadow' : 'text-muted-foreground'
                  }`}
                >
                  {isArabic ? 'رقم الهاتف' : 'Phone'}
                </button>
              </div>

              {authMode === 'email' ? (
                <>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'كلمة المرور' : 'Password'}</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleEmailAuth} 
                    disabled={sendingOtp}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 me-2" />
                    {sendingOtp 
                      ? (isArabic ? 'جاري المعالجة...' : 'Processing...') 
                      : isSignUp
                        ? (isArabic ? 'إنشاء حساب' : 'Sign Up')
                        : (isArabic ? 'تسجيل الدخول' : 'Sign In')}
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full"
                  >
                    {isSignUp
                      ? (isArabic ? 'لديك حساب؟ تسجيل الدخول' : 'Have an account? Sign In')
                      : (isArabic ? 'ليس لديك حساب؟ إنشاء حساب' : "Don't have an account? Sign Up")}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'رقم الهاتف' : 'Phone Number'}</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-muted rounded-md border border-input">
                        <span className="text-sm text-muted-foreground">+971</span>
                      </div>
                      <Input
                        type="tel"
                        placeholder={isArabic ? '5X XXX XXXX' : '5X XXX XXXX'}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={showOtpInput}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {showOtpInput && (
                    <div className="space-y-2">
                      <Label>{isArabic ? 'رمز التحقق' : 'Verification Code'}</Label>
                      <Input
                        type="text"
                        placeholder="XXXXXX"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>
                  )}

                  {!showOtpInput ? (
                    <Button 
                      onClick={handleSendOtp} 
                      disabled={sendingOtp}
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 me-2" />
                      {sendingOtp 
                        ? (isArabic ? 'جاري الإرسال...' : 'Sending...') 
                        : (isArabic ? 'إرسال رمز التحقق' : 'Send OTP')}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        onClick={handleVerifyOtp} 
                        disabled={sendingOtp}
                        className="w-full"
                      >
                        <Shield className="h-4 w-4 me-2" />
                        {sendingOtp 
                          ? (isArabic ? 'جاري التحقق...' : 'Verifying...') 
                          : (isArabic ? 'تأكيد الرمز' : 'Verify OTP')}
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => {
                          setShowOtpInput(false);
                          setOtp('');
                        }}
                        className="w-full"
                      >
                        {isArabic ? 'تغيير رقم الهاتف' : 'Change Phone Number'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Logged in - Show account dashboard
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {user.phone || user.email}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'مرحباً بعودتك!' : 'Welcome back!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="flex-1 text-start font-medium">
                      {isArabic ? item.labelAr : item.labelEn}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`h-5 w-5 text-muted-foreground ${isArabic ? 'rotate-180' : ''}`} />
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full mt-6 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4 me-2" />
          {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
        </Button>
      </div>
    </PageLayout>
  );
};

export default AccountPage;
