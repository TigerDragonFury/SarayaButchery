import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Banknote, ArrowLeft, ArrowRight, CheckCircle, MapPin, User, MessageSquare, Loader2, Truck, Mic, Store, Calendar, Clock } from "lucide-react";
import { format, addDays, startOfDay, isToday } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from "@/components/layout/PageLayout";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePixel } from "@/contexts/PixelContext";
import { toast } from "@/hooks/use-toast";
import { openWhatsAppOrder } from "@/lib/whatsapp-order";
import { formatCartForIiko, createOrderInDatabase } from "@/lib/iiko-order";
import { supabase } from "@/integrations/supabase/client";
import VoiceNoteRecorder from "@/components/shared/VoiceNoteRecorder";
import { useSmartReorder } from "@/hooks/useSmartReorder";
import { useStoreSettings, getFullAddress } from "@/hooks/useStoreSettings";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Time slots for pickup/delivery - Always use English numerals
const TIME_SLOTS = [
  { value: "08:00-10:00", labelAr: "8:00 ص - 10:00 ص", labelEn: "8:00 AM - 10:00 AM", startHour: 8 },
  { value: "10:00-12:00", labelAr: "10:00 ص - 12:00 م", labelEn: "10:00 AM - 12:00 PM", startHour: 10 },
  { value: "12:00-14:00", labelAr: "12:00 م - 2:00 م", labelEn: "12:00 PM - 2:00 PM", startHour: 12 },
  { value: "14:00-16:00", labelAr: "2:00 م - 4:00 م", labelEn: "2:00 PM - 4:00 PM", startHour: 14 },
  { value: "16:00-18:00", labelAr: "4:00 م - 6:00 م", labelEn: "4:00 PM - 6:00 PM", startHour: 16 },
  { value: "18:00-20:00", labelAr: "6:00 م - 8:00 م", labelEn: "6:00 PM - 8:00 PM", startHour: 18 },
  { value: "20:00-22:00", labelAr: "8:00 م - 10:00 م", labelEn: "8:00 PM - 10:00 PM", startHour: 20 },
];

// Minimum lead time in hours for same-day orders
const MIN_LEAD_TIME_HOURS = 2;

// Get available time slots based on selected date
const getAvailableTimeSlots = (selectedDate: Date | undefined) => {
  if (!selectedDate || !isToday(selectedDate)) {
    // For future dates, all slots are available
    return TIME_SLOTS;
  }
  
  // For today, filter out slots that don't have enough lead time
  const now = new Date();
  const currentHour = now.getHours();
  const minStartHour = currentHour + MIN_LEAD_TIME_HOURS;
  
  return TIME_SLOTS.filter(slot => slot.startHour >= minStartHour);
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, total, totalWeight, clearCart, isMinimumMet, minimumOrder } = useCart();
  const { t, isRTL } = useLanguage();
  const { trackBeginCheckout, trackPurchase } = usePixel();
  const { savePreference, isAuthenticated } = useSmartReorder();
  const { settings } = useStoreSettings();
  
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("delivery");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderVoiceNote, setOrderVoiceNote] = useState<{ blob: Blob; duration: number } | null>(null);
  const [weightPolicyAccepted, setWeightPolicyAccepted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Abu Dhabi",
    notes: "",
  });

  // Track begin_checkout when page loads with items
  useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(calculatedTotal, items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate delivery fee based on order type
  const calculatedDeliveryFee = orderType === "pickup" ? 0 : deliveryFee;
  const calculatedTotal = subtotal + calculatedDeliveryFee;

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generate unique idempotency key for this checkout session
  const [idempotencyKey] = useState(() => 
    `checkout-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation - address only required for delivery
    if (!formData.name || !formData.phone) {
      toast({
        title: t("checkout.errorTitle"),
        description: t("checkout.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    if (orderType === "delivery" && !formData.address) {
      toast({
        title: t("checkout.errorTitle"),
        description: isRTL ? "الرجاء إدخال عنوان التوصيل" : "Please enter delivery address",
        variant: "destructive",
      });
      return;
    }

    // Phone validation (UAE format)
    const phoneRegex = /^(05|5|\+9715)[0-9]{8}$/;
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast({
        title: t("checkout.errorTitle"),
        description: t("checkout.invalidPhone"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data for iiko
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || undefined,
        delivery_address: orderType === "pickup" ? "Pickup from store" : formData.address,
        delivery_city: formData.city,
        delivery_notes: formData.notes || undefined,
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          productNameEn: item.nameEn,
          quantity: item.quantity,
          unit: item.unit || 'kg',
          pricePerUnit: item.price,
          totalPrice: item.price * item.quantity,
          customerNotes: item.notes,
          category: item.category,
        })),
        subtotal,
        delivery_fee: calculatedDeliveryFee,
        discount: 0,
        total: calculatedTotal,
        total_weight: totalWeight,
        order_type: orderType,
        scheduled_date: scheduledDate ? format(scheduledDate, 'yyyy-MM-dd') : undefined,
        scheduled_time_slot: scheduledTimeSlot || undefined,
        branch_name: orderType === "pickup" ? "Abu Dhabi Main Branch" : undefined,
      };

      console.log('[Checkout] Sending order to iiko POS...');
      
      // Send order to iiko FIRST and get official order number
      const { data: iikoResult, error: iikoError } = await supabase.functions.invoke('iiko-create-order', {
        body: { 
          order_data: orderData,
          idempotency_key: idempotencyKey,
        }
      });

      if (iikoError) {
        console.error('[Checkout] iiko error:', iikoError);
        toast({
          title: isRTL ? "خطأ في النظام" : "System Error",
          description: isRTL 
            ? "تعذر الاتصال بنظام الكاشير. يرجى المحاولة مرة أخرى." 
            : "Could not connect to POS system. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!iikoResult?.success) {
        console.error('[Checkout] iiko order failed:', iikoResult);
        toast({
          title: isRTL ? "تعذر تأكيد الطلب" : "Order Failed",
          description: iikoResult?.error || (isRTL 
            ? "تعذر تأكيد الطلب. يرجى المحاولة مرة أخرى."
            : "Could not confirm order. Please try again."),
          variant: "destructive",
        });
        return;
      }

      // Get the official order number from iiko
      const officialOrderNumber = iikoResult.orderNumber || iikoResult.iikoOrderNumber;
      const orderId = iikoResult.orderId;

      console.log('[Checkout] ✓ Order confirmed by iiko:', officialOrderNumber, 'ID:', orderId);

      // Upload voice note if exists
      if (orderVoiceNote && orderId) {
        try {
          console.log('[Checkout] Uploading voice note...');
          const timestamp = Date.now();
          const extension = orderVoiceNote.blob.type.includes('webm') ? 'webm' : 'mp3';
          const fileName = `${orderId}/order-note-${timestamp}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from('voice-notes')
            .upload(fileName, orderVoiceNote.blob, {
              contentType: orderVoiceNote.blob.type,
              upsert: false,
            });

          if (uploadError) {
            console.warn('[Checkout] Voice note upload warning:', uploadError);
          } else {
            // Save voice note record
            const { error: recordError } = await supabase.functions.invoke('voice-note-upload', {
              body: {
                order_id: orderId,
                storage_path: fileName,
                duration_seconds: orderVoiceNote.duration,
              }
            });

            if (recordError) {
              console.warn('[Checkout] Voice note record warning:', recordError);
            } else {
              console.log('[Checkout] ✓ Voice note saved:', fileName);
            }
          }
        } catch (voiceErr) {
          console.warn('[Checkout] Voice note error (non-blocking):', voiceErr);
        }
      }

      // Save order preferences for Smart Reorder (if authenticated)
      if (isAuthenticated) {
        try {
          for (const item of items) {
            await savePreference(
              {
                id: item.id,
                name: item.name,
                nameEn: item.nameEn,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                unit: item.unit,
                notes: item.notes,
              },
              item.voiceNoteBlob ? `${orderId}/${item.id}-${Date.now()}.webm` : undefined,
              item.voiceNoteDuration
            );
          }
          console.log('[Checkout] ✓ Order preferences saved for Smart Reorder');
        } catch (prefErr) {
          console.warn('[Checkout] Preference save error (non-blocking):', prefErr);
        }
      }

      // Success!
      toast({
        title: t("checkout.successTitle"),
        description: paymentMethod === "cod" 
          ? t("checkout.codSuccess") 
          : t("checkout.orderSuccess"),
      });

      // Track purchase event
      trackPurchase(officialOrderNumber, calculatedTotal, items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })));

      clearCart();
      // Navigate with the OFFICIAL iiko order number
      navigate(`/order-success?order=${encodeURIComponent(officialOrderNumber)}`);

    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: t("checkout.errorTitle"),
        description: isRTL 
          ? "تعذر تأكيد الطلب. يرجى المحاولة مرة أخرى."
          : "Could not confirm order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 mt-20 text-center" dir={isRTL ? "rtl" : "ltr"}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("checkout.emptyCart")}</h1>
          <p className="text-muted-foreground mb-6">{t("checkout.emptyCartDesc")}</p>
          <Button asChild>
            <Link to="/shop">{t("cart.startShopping")}</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 mt-20" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/cart" className="gap-2">
              <ArrowIcon className="w-4 h-4" />
              {t("checkout.backToCart")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{t("checkout.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("checkout.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t("checkout.customerInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("checkout.name")} *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder={t("checkout.namePlaceholder")}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("checkout.phone")} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t("checkout.phonePlaceholder")}
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("checkout.email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t("checkout.emailPlaceholder")}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {isRTL ? 'طريقة الاستلام' : 'Delivery Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={orderType}
                    onValueChange={(value) => setOrderType(value as "pickup" | "delivery")}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={cn(
                      "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                      orderType === "pickup" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}>
                      <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                      <Label htmlFor="pickup" className="cursor-pointer text-center">
                        <Store className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">{isRTL ? 'استلام من الفرع' : 'Store Pickup'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isRTL ? 'بدون رسوم توصيل' : 'No delivery fee'}
                        </p>
                      </Label>
                    </div>
                    <div className={cn(
                      "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                      orderType === "delivery" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}>
                      <RadioGroupItem value="delivery" id="delivery-option" className="sr-only" />
                      <Label htmlFor="delivery-option" className="cursor-pointer text-center">
                        <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">{isRTL ? 'توصيل للمنزل' : 'Home Delivery'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {deliveryFee === 0 
                            ? (isRTL ? 'توصيل مجاني' : 'Free delivery')
                            : `${deliveryFee} ${isRTL ? 'د.إ' : 'AED'}`
                          }
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {orderType === "pickup" && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="font-medium mb-1">{isRTL ? 'عنوان الفرع' : 'Branch Address'}</p>
                      <p className="text-sm text-muted-foreground">
                        {getFullAddress(settings.location, isRTL)}
                      </p>
                      <a 
                        href={settings.location.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        {isRTL ? 'فتح في الخرائط' : 'Open in Maps'}
                      </a>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isRTL ? `ساعات العمل: ${settings.hours.display_ar}` : `Working hours: ${settings.hours.display_en}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Schedule Date & Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {isRTL ? 'موعد الاستلام / التوصيل' : 'Schedule Date & Time'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اختر التاريخ' : 'Select Date'}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="me-2 h-4 w-4" />
                            {scheduledDate 
                              ? format(scheduledDate, "PPP", { locale: isRTL ? ar : enUS })
                              : (isRTL ? 'اختر تاريخ' : 'Pick a date')
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={scheduledDate}
                            onSelect={(date) => {
                              setScheduledDate(date);
                              // Reset time slot when date changes (it might not be available for the new date)
                              if (date && isToday(date)) {
                                const availableSlots = getAvailableTimeSlots(date);
                                if (scheduledTimeSlot && !availableSlots.find(s => s.value === scheduledTimeSlot)) {
                                  setScheduledTimeSlot("");
                                }
                              }
                            }}
                            disabled={(date) =>
                              date < startOfDay(new Date()) || date > addDays(new Date(), 14)
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Slot Picker */}
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اختر الوقت' : 'Select Time Slot'}</Label>
                      <Select value={scheduledTimeSlot} onValueChange={setScheduledTimeSlot}>
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? 'اختر وقت' : 'Select time'} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableTimeSlots(scheduledDate).map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {isRTL ? slot.labelAr : slot.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {scheduledDate && isToday(scheduledDate) && getAvailableTimeSlots(scheduledDate).length === 0 && (
                        <p className="text-xs text-destructive">
                          {isRTL 
                            ? 'لا توجد أوقات متاحة اليوم. يرجى اختيار يوم آخر.'
                            : 'No time slots available today. Please select another day.'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? `يمكنك الطلب لنفس اليوم (قبل ساعتين على الأقل) أو حتى 14 يوم مقدماً.`
                      : `You can order for today (minimum ${MIN_LEAD_TIME_HOURS} hours in advance) or up to 14 days ahead.`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Delivery Address - Only show for delivery */}
              {orderType === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t("checkout.deliveryAddress")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("checkout.address")} *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder={t("checkout.addressPlaceholder")}
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("checkout.city")}</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">{t("checkout.cityNote")}</p>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Special Notes for Meat Preparation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {isRTL ? 'ملاحظات خاصة' : 'Special Instructions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">{isRTL ? 'تعليمات التحضير' : 'Preparation Notes'}</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder={isRTL 
                        ? 'مثال: تقطيع قطع صغيرة، مفروم ناعم، شرائح رفيعة، تنظيف كامل...' 
                        : 'E.g., small cuts, finely minced, thin slices, full cleaning...'
                      }
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  {/* Voice Note for Order */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      {isRTL ? 'ملاحظة صوتية للجزار' : 'Voice Note for Butcher'}
                    </Label>
                    <VoiceNoteRecorder
                      onRecordingComplete={(blob, duration) => {
                        setOrderVoiceNote({ blob, duration });
                      }}
                      onRecordingDeleted={() => {
                        setOrderVoiceNote(null);
                      }}
                      maxDuration={30}
                      isRTL={isRTL}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? 'سجل ملاحظة صوتية للجزار (30 ثانية كحد أقصى)' 
                        : 'Record a voice note for the butcher (max 30 seconds)'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {t("checkout.paymentMethod")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as "online" | "cod")}
                    className="space-y-3"
                  >
                    <div className={`flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{t("checkout.onlinePayment")}</p>
                            <p className="text-sm text-muted-foreground">{t("checkout.onlinePaymentDesc")}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Banknote className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">{t("checkout.cashOnDelivery")}</p>
                            <p className="text-sm text-muted-foreground">{t("checkout.codDesc")}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("cart.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        <img
                          src={item.image}
                          alt={isRTL ? item.name : (item.nameEn || item.name)}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">
                            {isRTL ? item.name : (item.nameEn || item.name)}
                          </p>
                          <p className="text-muted-foreground">
                            {item.quantity} × {item.price} {t("cart.currency")}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-accent-foreground bg-accent/50 rounded px-1.5 py-0.5 mt-1 line-clamp-1">
                              📝 {item.notes}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">
                          {(item.price * item.quantity).toFixed(0)} {t("cart.currency")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                      <span>{subtotal.toFixed(0)} {t("cart.currency")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("cart.delivery")}</span>
                      <span className={calculatedDeliveryFee === 0 ? "text-green-600" : ""}>
                        {orderType === "pickup" 
                          ? (isRTL ? 'استلام من الفرع' : 'Store Pickup')
                          : calculatedDeliveryFee === 0 
                            ? t("cart.freeDelivery") 
                            : `${calculatedDeliveryFee} ${t("cart.currency")}`
                        }
                      </span>
                    </div>
                    {scheduledDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'الموعد' : 'Scheduled'}</span>
                        <span className="text-primary">
                          {format(scheduledDate, "PP", { locale: isRTL ? ar : enUS })}
                          {scheduledTimeSlot && ` - ${scheduledTimeSlot.replace('-', ' - ')}`}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t("cart.total")}</span>
                      <span className="text-primary">{calculatedTotal.toFixed(0)} {t("cart.currency")}</span>
                    </div>
                  </div>

                  {/* COD Active Banner */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {t("checkout.codActive")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("checkout.codActiveDesc")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{t("checkout.iikoStatusReady")}</span>
                    </div>
                  </div>

                  {/* Weight & Cleaning Policy Checkbox */}
                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <Checkbox
                      id="weight-policy"
                      checked={weightPolicyAccepted}
                      onCheckedChange={(checked) => setWeightPolicyAccepted(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="weight-policy" className="text-sm cursor-pointer leading-relaxed">
                      {isRTL ? (
                        <>
                          ☑ أوافق على{' '}
                          <Link to="/terms#weight-policy" target="_blank" className="text-primary underline font-medium">
                            شروط الوزن والتنظيف
                          </Link>
                        </>
                      ) : (
                        <>
                          ☑ I agree to the{' '}
                          <Link to="/terms#weight-policy" target="_blank" className="text-primary underline font-medium">
                            Weight & Cleaning Policy
                          </Link>
                        </>
                      )}
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing || !isMinimumMet || !weightPolicyAccepted}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t("checkout.processing")}
                      </>
                    ) : !isMinimumMet ? (
                      t("cart.minimumNotMet")
                    ) : (
                      t("checkout.placeOrder")
                    )}
                  </Button>

                  {!isMinimumMet && (
                    <p className="text-xs text-destructive text-center mt-2">
                      {t("cart.minimumNotMet")} ({minimumOrder} {t("cart.currency")})
                    </p>
                  )}

                  {/* WhatsApp Alternative */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">{t("checkout.orOrderVia")}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => {
                        openWhatsAppOrder({
                          items,
                          subtotal,
                          deliveryFee,
                          total,
                          totalWeight,
                          customerInfo: {
                            name: formData.name,
                            phone: formData.phone,
                            email: formData.email,
                            address: formData.address,
                            city: formData.city,
                            notes: formData.notes
                          },
                          paymentMethod
                        }, isRTL);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {t("checkout.orderWhatsApp")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;
