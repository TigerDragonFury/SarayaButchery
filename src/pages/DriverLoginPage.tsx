import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Truck, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DriverLoginPage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check if already logged in as driver
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is a driver
        const { data: driverData } = await supabase
          .from('drivers')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (driverData) {
          navigate('/driver');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneForAuth = (phoneNumber: string) => {
    // Remove all non-digits
    let cleaned = phoneNumber.replace(/\D/g, '');
    // Ensure it starts with 971
    if (cleaned.startsWith('0')) {
      cleaned = '971' + cleaned.slice(1);
    } else if (!cleaned.startsWith('971')) {
      cleaned = '971' + cleaned;
    }
    return '+' + cleaned;
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 9) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneForAuth(phone);
      
      // First check if this phone belongs to a driver
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id, phone')
        .eq('phone', formattedPhone)
        .single();

      if (driverError || !driverData) {
        toast({
          title: isRTL ? 'غير مصرح' : 'Unauthorized',
          description: isRTL ? 'رقم الهاتف غير مسجل كسائق' : 'This phone number is not registered as a driver',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Send OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setStep('otp');
      setCountdown(60);
      toast({
        title: isRTL ? 'تم إرسال الرمز' : 'Code Sent',
        description: isRTL ? 'يرجى إدخال رمز التحقق المرسل إلى هاتفك' : 'Please enter the verification code sent to your phone',
      });
    } catch (error: any) {
      console.error('OTP error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل إرسال الرمز' : 'Failed to send code'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال الرمز كاملاً' : 'Please enter the complete code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneForAuth(phone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      if (data.session) {
        // Link driver record to user if not already linked
        const { error: updateError } = await supabase
          .from('drivers')
          .update({ user_id: data.session.user.id })
          .eq('phone', formattedPhone)
          .is('user_id', null);

        if (updateError) {
          console.warn('Driver linking warning:', updateError);
        }

        toast({
          title: isRTL ? 'تم تسجيل الدخول' : 'Logged In',
          description: isRTL ? 'مرحباً بك في تطبيق السائق' : 'Welcome to the Driver App',
        });
        navigate('/driver');
      }
    } catch (error: any) {
      console.error('Verify error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'رمز غير صحيح' : 'Invalid code'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  return (
    <div 
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        "bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Truck className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            {isRTL ? 'تسجيل دخول السائق' : 'Driver Login'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'ملحمة السرايا - تطبيق السائق' : 'Al Saraya Butchery - Driver App'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                </Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={isRTL ? '5xxxxxxxx' : '5xxxxxxxx'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="ps-10 text-lg"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'أدخل رقم الهاتف المسجل لدى الإدارة' : 'Enter the phone number registered with admin'}
                </p>
              </div>

              <Button
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin me-2" />
                ) : (
                  <ShieldCheck className="w-5 h-5 me-2" />
                )}
                {isRTL ? 'إرسال رمز التحقق' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('phone')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 me-2" />
                {isRTL ? 'تغيير الرقم' : 'Change Number'}
              </Button>

              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'أدخل رمز التحقق المرسل إلى' : 'Enter the code sent to'}
                  <br />
                  <span className="font-mono font-bold text-foreground" dir="ltr">
                    {formatPhoneForAuth(phone)}
                  </span>
                </p>

                <div className="flex justify-center" dir="ltr">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className="text-sm"
                >
                  {countdown > 0 
                    ? (isRTL ? `إعادة الإرسال بعد ${countdown} ثانية` : `Resend in ${countdown}s`)
                    : (isRTL ? 'إعادة إرسال الرمز' : 'Resend Code')
                  }
                </Button>
              </div>

              <Button
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin me-2" />
                ) : (
                  <Truck className="w-5 h-5 me-2" />
                )}
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Button>
            </>
          )}

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            {isRTL 
              ? 'تطبيق السائق للاستخدام الداخلي فقط'
              : 'Driver app for internal use only'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverLoginPage;
