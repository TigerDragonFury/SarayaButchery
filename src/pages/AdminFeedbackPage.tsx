import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, AlertTriangle, MessageSquare, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Feedback {
  id: string;
  order_id: string | null;
  order_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  feedback_type: 'rating' | 'suggestion' | 'complaint';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const typeConfig = {
  rating: { icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', labelAr: 'تقييم', labelEn: 'Rating' },
  suggestion: { icon: ThumbsUp, color: 'text-blue-500', bgColor: 'bg-blue-500/10', labelAr: 'اقتراح', labelEn: 'Suggestion' },
  complaint: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10', labelAr: 'شكوى', labelEn: 'Complaint' },
};

const statusConfig = {
  new: { labelAr: 'جديد', labelEn: 'New', variant: 'default' as const },
  in_progress: { labelAr: 'قيد المتابعة', labelEn: 'In Progress', variant: 'secondary' as const },
  resolved: { labelAr: 'تم الحل', labelEn: 'Resolved', variant: 'outline' as const },
  closed: { labelAr: 'مغلق', labelEn: 'Closed', variant: 'outline' as const },
};

const AdminFeedbackPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from('customer_feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching feedback:', error);
    } else {
      setFeedback((data || []) as unknown as Feedback[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();

    const channel = supabase
      .channel('feedback-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_feedback' }, () => {
        fetchFeedback();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('customer_feedback')
      .update({ status: editStatus, admin_notes: editNotes } as any)
      .eq('id', id);
    if (error) {
      toast.error(isRTL ? 'خطأ في التحديث' : 'Update failed');
    } else {
      toast.success(isRTL ? 'تم التحديث' : 'Updated');
      setEditingId(null);
      fetchFeedback();
    }
  };

  const filtered = activeTab === 'all' ? feedback : feedback.filter(f => f.feedback_type === activeTab);

  const counts = {
    all: feedback.length,
    rating: feedback.filter(f => f.feedback_type === 'rating').length,
    suggestion: feedback.filter(f => f.feedback_type === 'suggestion').length,
    complaint: feedback.filter(f => f.feedback_type === 'complaint').length,
  };

  const newCount = feedback.filter(f => f.status === 'new').length;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              {isRTL ? 'ملاحظات العملاء' : 'Customer Feedback'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL ? 'إدارة التقييمات والشكاوى والاقتراحات' : 'Manage ratings, complaints, and suggestions'}
            </p>
          </div>
          {newCount > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {newCount} {isRTL ? 'جديد' : 'New'}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['all', 'rating', 'suggestion', 'complaint'] as const).map(type => {
            const config = type === 'all' 
              ? { icon: MessageSquare, color: 'text-primary', bgColor: 'bg-primary/10', labelAr: 'الكل', labelEn: 'All' }
              : typeConfig[type];
            const Icon = config.icon;
            return (
              <Card key={type} className={cn("cursor-pointer transition-all hover:shadow-md", activeTab === type && "ring-2 ring-primary")}
                onClick={() => setActiveTab(type)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{counts[type]}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? config.labelAr : config.labelEn}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">{isRTL ? 'لا توجد ملاحظات بعد' : 'No feedback yet'}</h3>
              <p className="text-muted-foreground">{isRTL ? 'ستظهر هنا عند إرسال العملاء لملاحظاتهم' : 'Feedback will appear here when customers submit it'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const tConfig = typeConfig[item.feedback_type];
              const sConfig = statusConfig[item.status];
              const Icon = tConfig.icon;
              const isEditing = editingId === item.id;

              return (
                <Card key={item.id} className={cn("transition-all", item.status === 'new' && "border-primary/50 shadow-sm")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn("p-2 rounded-lg mt-0.5 flex-shrink-0", tConfig.bgColor)}>
                          <Icon className={cn("w-4 h-4", tConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-sm">
                              {isRTL ? tConfig.labelAr : tConfig.labelEn}
                            </span>
                            <Badge variant={sConfig.variant} className="text-xs">
                              {isRTL ? sConfig.labelAr : sConfig.labelEn}
                            </Badge>
                            {item.order_number && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {item.order_number}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-0.5">
                            {item.customer_name && <p>👤 {item.customer_name}</p>}
                            {item.customer_phone && (
                              <p>
                                📱 <a href={`https://wa.me/${item.customer_phone.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" rel="noopener noreferrer" 
                                  className="text-primary hover:underline">{item.customer_phone}</a>
                              </p>
                            )}
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(item.created_at), { 
                                addSuffix: true, locale: isRTL ? ar : enUS 
                              })}
                            </p>
                          </div>
                          {item.admin_notes && !isEditing && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <span className="font-medium">{isRTL ? 'ملاحظات الإدارة:' : 'Admin Notes:'}</span>{' '}
                              {item.admin_notes}
                            </div>
                          )}

                          {isEditing && (
                            <div className="mt-3 space-y-3">
                              <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([key, val]) => (
                                    <SelectItem key={key} value={key}>
                                      {isRTL ? val.labelAr : val.labelEn}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Textarea 
                                value={editNotes} 
                                onChange={e => setEditNotes(e.target.value)}
                                placeholder={isRTL ? 'أضف ملاحظاتك...' : 'Add your notes...'}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleUpdate(item.id)}>
                                  <CheckCircle2 className="w-4 h-4 me-1" />
                                  {isRTL ? 'حفظ' : 'Save'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                  {isRTL ? 'إلغاء' : 'Cancel'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {!isEditing && (
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditingId(item.id);
                          setEditNotes(item.admin_notes || '');
                          setEditStatus(item.status);
                        }}>
                          {isRTL ? 'تعديل' : 'Edit'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeedbackPage;
