import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogIn, Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import logoImg from '@/assets/logo.png';

const AdminLoginPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          toast({
            title: isRTL ? 'تم إنشاء الحساب' : 'Account Created',
            description: isRTL 
              ? 'تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.' 
              : 'Your account has been created. You can now sign in.',
          });
          setIsSignUp(false);
          // Auto-login after signup
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!loginError && loginData.user) {
            // Check admin role
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', loginData.user.id);

            const isAdmin = roles?.some(r => r.role === 'admin');
            
            if (isAdmin) {
              toast({
                title: isRTL ? 'مرحباً بك!' : 'Welcome!',
                description: isRTL ? 'تم منحك صلاحيات المسؤول' : 'You have been granted admin access',
              });
              navigate('/admin/dashboard');
            } else {
              toast({
                title: isRTL ? 'تم إنشاء الحساب' : 'Account Created',
                description: isRTL ? 'بانتظار صلاحيات المسؤول' : 'Waiting for admin privileges',
              });
            }
          }
        }
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error('No user returned');
        }

        // Check if user has admin role
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id);

        if (rolesError) {
          console.error('Error checking roles:', rolesError);
          throw new Error('Failed to verify admin access');
        }

        const isAdmin = roles?.some(r => r.role === 'admin');

        if (!isAdmin) {
          await supabase.auth.signOut();
          toast({
            title: isRTL ? 'غير مصرح' : 'Access Denied',
            description: isRTL ? 'ليس لديك صلاحيات المسؤول' : 'You do not have admin privileges',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: isRTL ? 'تم تسجيل الدخول' : 'Login Successful',
          description: isRTL ? 'مرحباً بك في لوحة التحكم' : 'Welcome to the admin panel',
        });

        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'حدث خطأ' : 'An error occurred'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20">
            <img src={logoImg} alt="Al Saraya" className="w-full h-full object-cover" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isRTL ? 'لوحة تحكم ملحمة السرايا' : 'Al Saraya Admin Panel'}
            </CardTitle>
            <CardDescription className="mt-2">
              {isSignUp 
                ? (isRTL ? 'أنشئ حسابك للوصول إلى لوحة الإدارة' : 'Create your account to access the admin dashboard')
                : (isRTL ? 'سجّل دخولك للوصول إلى لوحة الإدارة' : 'Sign in to access the admin dashboard')
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRTL ? 'admin@example.com' : 'admin@example.com'}
                required
                disabled={isLoading}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isRTL ? 'كلمة المرور' : 'Password'}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  dir="ltr"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                </span>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  {isRTL ? 'إنشاء حساب' : 'Create Account'}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp 
                ? (isRTL ? 'لديك حساب؟ سجّل دخولك' : 'Have an account? Sign in')
                : (isRTL ? 'إنشاء حساب جديد' : 'Create new account')
              }
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              {isRTL ? 'اتصال آمن ومشفر' : 'Secure encrypted connection'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
