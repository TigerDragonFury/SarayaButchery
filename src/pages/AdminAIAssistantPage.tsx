import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Bot, Send, Loader2, CheckCircle2, XCircle, Undo2, 
  Shield, AlertTriangle, Clock, Sparkles, History 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAction {
  type: string;
  [key: string]: any;
}

interface AIResponse {
  message: string;
  actions: AIAction[];
  requiresApproval: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: AIAction[];
  requiresApproval?: boolean;
  auditLogId?: string;
  status?: 'pending' | 'applied' | 'undone' | 'failed';
  timestamp: Date;
}

const ACTION_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  UPDATE_PRODUCT: { ar: 'تحديث منتج', en: 'Update Product', color: 'bg-blue-500/10 text-blue-600' },
  BULK_PRICE_UPDATE: { ar: 'تحديث أسعار جماعي', en: 'Bulk Price Update', color: 'bg-orange-500/10 text-orange-600' },
  CREATE_CATEGORY: { ar: 'إنشاء قسم', en: 'Create Category', color: 'bg-green-500/10 text-green-600' },
  UPDATE_CATEGORY: { ar: 'تحديث قسم', en: 'Update Category', color: 'bg-blue-500/10 text-blue-600' },
  MOVE_PRODUCTS_TO_CATEGORY: { ar: 'نقل منتجات', en: 'Move Products', color: 'bg-purple-500/10 text-purple-600' },
  UPDATE_STORE_SETTING: { ar: 'تحديث إعداد', en: 'Update Setting', color: 'bg-teal-500/10 text-teal-600' },
  UPDATE_ORDER_STATUS: { ar: 'تحديث حالة طلب', en: 'Update Order', color: 'bg-amber-500/10 text-amber-600' },
  UPDATE_SEASONAL_EVENT: { ar: 'تحديث مناسبة', en: 'Update Event', color: 'bg-pink-500/10 text-pink-600' },
  QUERY_DATA: { ar: 'استعلام بيانات', en: 'Query Data', color: 'bg-gray-500/10 text-gray-600' },
  UPDATE_DESIGN_THEME: { ar: 'تعديل التصميم', en: 'Update Theme', color: 'bg-violet-500/10 text-violet-600' },
  UPDATE_SECTION_CONFIG: { ar: 'تعديل الأقسام', en: 'Update Sections', color: 'bg-indigo-500/10 text-indigo-600' },
  UPDATE_PRODUCT_CARD: { ar: 'تعديل كارت المنتج', en: 'Update Product Card', color: 'bg-cyan-500/10 text-cyan-600' },
  ACTIVATE_SEASONAL_THEME: { ar: 'تفعيل ثيم موسمي', en: 'Seasonal Theme', color: 'bg-emerald-500/10 text-emerald-600' },
};

const EXAMPLE_PROMPTS = [
  { ar: 'ارفع أسعار قسم BBQ بنسبة 10%', en: 'Increase BBQ category prices by 10%' },
  { ar: 'أنشئ قسم جديد "عصائر رمضان"', en: 'Create new "Ramadan Juices" category' },
  { ar: 'كم عدد الطلبات اليوم؟', en: 'How many orders today?' },
  { ar: 'فعّل ثيم رمضان', en: 'Activate Ramadan theme' },
  { ar: 'خلي الموقع شكله فخم أكتر', en: 'Make the site look more premium' },
  { ar: 'كبر صور المنتجات', en: 'Make product images bigger' },
  { ar: 'غير الألوان لثيم رمضاني', en: 'Change colors to Ramadan theme' },
  { ar: 'خلي الكروت مستطيلة بدل مربعة', en: 'Make cards rectangular instead of square' },
  { ar: 'حط Shadow أقوى', en: 'Add stronger shadows' },
  { ar: 'صغر الهيدر', en: 'Make the header smaller' },
];

const AdminAIAssistantPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['ai-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendPrompt = async (promptText?: string) => {
    const text = promptText || input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(isRTL ? 'يجب تسجيل الدخول' : 'Please log in');
        return;
      }

      // Build conversation history for context memory
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role,
          content: m.role === 'assistant' 
            ? JSON.stringify({ message: m.content, actions: m.actions || [] })
            : m.content,
        }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ prompt: text, conversationHistory: history }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Request failed');
      }

      const data: AIResponse = await response.json();

      // Find the audit log ID from the latest log
      const { data: latestLog } = await supabase
        .from('ai_audit_logs')
        .select('id')
        .eq('prompt', text)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        actions: data.actions,
        requiresApproval: data.requiresApproval,
        auditLogId: latestLog?.id,
        status: 'pending',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Auto-apply if no approval needed (read-only queries)
      if (!data.requiresApproval && data.actions?.length > 0) {
        await executeActions(assistantMsg.id, data.actions, latestLog?.id);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: `❌ ${err.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const executeActions = async (msgId: string, actions: AIAction[], auditLogId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: 'execute', actions, auditLogId }),
        }
      );

      const result = await response.json();
      
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId ? { ...m, status: result.success ? 'applied' : 'failed' } : m
        )
      );

      if (result.success) {
        toast.success(isRTL ? '✅ تم تطبيق التغييرات بنجاح' : '✅ Changes applied successfully');
        queryClient.invalidateQueries();
      } else {
        toast.error(isRTL ? '❌ فشل في تطبيق بعض التغييرات' : '❌ Some changes failed');
      }
    } catch (err: any) {
      toast.error(err.message);
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  const undoAction = async (msgId: string, auditLogId?: string) => {
    if (!auditLogId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: 'undo', auditLogId }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setMessages(prev =>
          prev.map(m => (m.id === msgId ? { ...m, status: 'undone' } : m))
        );
        toast.success(isRTL ? '↩️ تم التراجع بنجاح' : '↩️ Undo successful');
        queryClient.invalidateQueries();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{isRTL ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant'}</h2>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'اكتب أوامرك بالعربي أو الإنجليزي' : 'Type commands in Arabic or English'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-1"
        >
          <History className="w-4 h-4" />
          {isRTL ? 'السجل' : 'History'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chat */}
        <Card className="lg:col-span-2 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Sparkles className="w-12 h-12 text-primary/30 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    {isRTL ? 'مرحباً! كيف أقدر أساعدك؟' : 'Hello! How can I help?'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    {isRTL 
                      ? 'اكتب أي أمر مثل تعديل المنتجات، إنشاء أقسام، تحديث الأسعار، أو إدارة الطلبات'
                      : 'Type any command like editing products, creating categories, updating prices, or managing orders'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {EXAMPLE_PROMPTS.map((p, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => { setInput(isRTL ? p.ar : p.en); }}
                      >
                        {isRTL ? p.ar : p.en}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : msg.role === 'system'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted'
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                        {/* Actions Preview */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {msg.actions.map((action, i) => {
                                const label = ACTION_LABELS[action.type] || { ar: action.type, en: action.type, color: 'bg-gray-500/10 text-gray-600' };
                                return (
                                  <Badge key={i} variant="secondary" className={cn("text-[10px]", label.color)}>
                                    {isRTL ? label.ar : label.en}
                                  </Badge>
                                );
                              })}
                            </div>

                            {/* Action details */}
                            <div className="bg-background/50 rounded-lg p-2 text-xs font-mono max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-[10px]" dir="ltr">
                                {JSON.stringify(msg.actions, null, 2)}
                              </pre>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 mt-2">
                              {msg.status === 'pending' && msg.requiresApproval && (
                                <>
                                  <Button
                                    size="sm"
                                    className="gap-1 h-7 text-xs"
                                    onClick={() => executeActions(msg.id, msg.actions!, msg.auditLogId)}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    {isRTL ? 'تطبيق' : 'Apply'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1 h-7 text-xs"
                                    onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'failed' } : m))}
                                  >
                                    <XCircle className="w-3 h-3" />
                                    {isRTL ? 'رفض' : 'Reject'}
                                  </Button>
                                </>
                              )}
                              {msg.status === 'applied' && (
                                <>
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {isRTL ? 'تم التطبيق' : 'Applied'}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1 h-7 text-xs text-amber-600"
                                    onClick={() => undoAction(msg.id, msg.auditLogId)}
                                  >
                                    <Undo2 className="w-3 h-3" />
                                    {isRTL ? 'تراجع' : 'Undo'}
                                  </Button>
                                </>
                              )}
                              {msg.status === 'undone' && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 gap-1">
                                  <Undo2 className="w-3 h-3" />
                                  {isRTL ? 'تم التراجع' : 'Undone'}
                                </Badge>
                              )}
                              {msg.status === 'failed' && (
                                <Badge variant="destructive" className="gap-1">
                                  <XCircle className="w-3 h-3" />
                                  {isRTL ? 'فشل' : 'Failed'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <span className="text-[10px] opacity-50 mt-1 block">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {isRTL ? 'جاري التحليل...' : 'Analyzing...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendPrompt();
                    }
                  }}
                  placeholder={isRTL ? 'اكتب أمرك هنا... مثال: ارفع سعر اللحم البقري 5%' : 'Type your command... e.g. Increase beef prices by 5%'}
                  className="resize-none min-h-[44px] max-h-[120px]"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendPrompt()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0 h-11 w-11"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {isRTL 
                    ? 'جميع التغييرات تتطلب موافقتك أولاً وقابلة للتراجع'
                    : 'All changes require your approval and are reversible'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - History & Safety */}
        <div className="space-y-4">
          {/* Safety Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {isRTL ? 'ضوابط الأمان' : 'Safety Controls'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                <span>{isRTL ? 'معاينة التغييرات قبل التطبيق' : 'Preview changes before applying'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                <span>{isRTL ? 'زر تراجع لكل عملية' : 'Undo button for every action'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                <span>{isRTL ? 'سجل كامل لجميع التغييرات' : 'Full audit log of all changes'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                <span>{isRTL ? 'الاستعلامات القراءة فقط تُنفذ تلقائياً' : 'Read-only queries auto-execute'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {isRTL ? 'سجل العمليات' : 'Audit Log'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {isRTL ? 'لا يوجد عمليات سابقة' : 'No previous actions'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log: any) => (
                      <div key={log.id} className="border border-border rounded-lg p-2.5 text-xs">
                        <p className="font-medium truncate">{log.prompt}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={cn(
                            "text-[9px]",
                            log.status === 'applied' && 'bg-green-500/10 text-green-600',
                            log.status === 'undone' && 'bg-amber-500/10 text-amber-600',
                            log.status === 'failed' && 'bg-red-500/10 text-red-600',
                            log.status === 'pending' && 'bg-gray-500/10 text-gray-600',
                          )}>
                            {log.status}
                          </Badge>
                          <span className="text-muted-foreground text-[10px]">
                            {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAIAssistantPage;
