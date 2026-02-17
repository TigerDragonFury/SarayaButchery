import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Loader2, Calendar, Sparkles, Clock } from 'lucide-react';
import type { SeasonalEventData } from '@/hooks/useSeasonalEvents';

const SeasonalEventsManager = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<SeasonalEventData[]>([]);

  const { data: savedEvents, isLoading } = useQuery({
    queryKey: ['seasonal-events-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'seasonal_events')
        .single();
      if (error) return [];
      return (data?.value as unknown as SeasonalEventData[]) || [];
    },
  });

  useEffect(() => {
    if (savedEvents) setEvents(savedEvents);
  }, [savedEvents]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(events)), updated_at: new Date().toISOString() })
        .eq('key', 'seasonal_events');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonal-events'] });
      queryClient.invalidateQueries({ queryKey: ['seasonal-events-admin'] });
      toast.success(isRTL ? 'تم حفظ المناسبات الموسمية' : 'Seasonal events saved');
    },
    onError: () => {
      toast.error(isRTL ? 'حدث خطأ في الحفظ' : 'Error saving');
    },
  });

  const updateEvent = (index: number, field: keyof SeasonalEventData, value: unknown) => {
    setEvents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const months = isRTL
    ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {isRTL ? 'المناسبات الموسمية' : 'Seasonal Events'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'تحكم في تواريخ ورسائل المناسبات الموسمية (رمضان، الأعياد، المناسبات الإماراتية)' : 'Manage seasonal event dates and messages (Ramadan, Eids, UAE holidays)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${event.gradient_from}, ${event.gradient_to})` }}
                />
                <div>
                  <h4 className="font-semibold text-sm">{isRTL ? event.name_ar : event.name_en}</h4>
                  <p className="text-xs text-muted-foreground">
                    {months[event.startMonth - 1]} {event.startDay} → {months[event.endMonth - 1]} {event.endDay}
                  </p>
                </div>
              </div>
              <Switch
                checked={event.is_active}
                onCheckedChange={(checked) => updateEvent(index, 'is_active', checked)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'الرسالة (عربي)' : 'Message (AR)'}</Label>
                <Input
                  value={event.message_ar}
                  onChange={(e) => updateEvent(index, 'message_ar', e.target.value)}
                  dir="rtl"
                  className="text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'الرسالة (إنجليزي)' : 'Message (EN)'}</Label>
                <Input
                  value={event.message_en}
                  onChange={(e) => updateEvent(index, 'message_en', e.target.value)}
                  className="text-sm h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {isRTL ? 'بداية الشهر' : 'Start Mo'}
                </Label>
                <Input
                  type="number" min={1} max={12}
                  value={event.startMonth}
                  onChange={(e) => updateEvent(index, 'startMonth', parseInt(e.target.value) || 1)}
                  className="text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'بداية اليوم' : 'Start Day'}</Label>
                <Input
                  type="number" min={1} max={31}
                  value={event.startDay}
                  onChange={(e) => updateEvent(index, 'startDay', parseInt(e.target.value) || 1)}
                  className="text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'نهاية الشهر' : 'End Mo'}</Label>
                <Input
                  type="number" min={1} max={12}
                  value={event.endMonth}
                  onChange={(e) => updateEvent(index, 'endMonth', parseInt(e.target.value) || 1)}
                  className="text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'نهاية اليوم' : 'End Day'}</Label>
                <Input
                  type="number" min={1} max={31}
                  value={event.endDay}
                  onChange={(e) => updateEvent(index, 'endDay', parseInt(e.target.value) || 1)}
                  className="text-sm h-8"
                />
              </div>
            </div>

            {/* Countdown target date - for events like Ramadan where campaign starts before the actual event */}
            {(event.id === 'ramadan' || event.countdownMonth || event.countdownDay) && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-accent/30 rounded-lg border border-dashed border-accent">
                <div className="col-span-2">
                  <Label className="text-xs font-semibold flex items-center gap-1 text-primary">
                    <Clock className="w-3 h-3" />
                    {isRTL ? '⏱️ تاريخ العداد التنازلي (بداية الصيام الفعلي)' : '⏱️ Countdown Target (Actual Start)'}
                  </Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isRTL ? 'العداد التنازلي يعد لهذا التاريخ بدلاً من بداية الحملة' : 'Countdown targets this date instead of campaign start'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'الشهر' : 'Month'}</Label>
                  <Input
                    type="number" min={1} max={12}
                    value={event.countdownMonth || event.startMonth}
                    onChange={(e) => updateEvent(index, 'countdownMonth', parseInt(e.target.value) || 1)}
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'اليوم' : 'Day'}</Label>
                  <Input
                    type="number" min={1} max={31}
                    value={event.countdownDay || event.startDay}
                    onChange={(e) => updateEvent(index, 'countdownDay', parseInt(e.target.value) || 1)}
                    className="text-sm h-8"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'لون التدرج (من)' : 'Gradient From'}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={event.gradient_from}
                    onChange={(e) => updateEvent(index, 'gradient_from', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={event.gradient_from}
                    onChange={(e) => updateEvent(index, 'gradient_from', e.target.value)}
                    className="text-sm h-8 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'لون التدرج (إلى)' : 'Gradient To'}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={event.gradient_to}
                    onChange={(e) => updateEvent(index, 'gradient_to', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={event.gradient_to}
                    onChange={(e) => updateEvent(index, 'gradient_to', e.target.value)}
                    className="text-sm h-8 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
          {saveMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
          <Save className="w-4 h-4 me-2" />
          {isRTL ? 'حفظ جميع التغييرات' : 'Save All Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeasonalEventsManager;
