import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Package, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  order_number: string;
  iiko_order_number: string | null;
  iiko_order_id: string | null;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: number;
  created_at: string;
}

const AdminOrderSearch = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchOrders = async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchTerm = q.trim().toLowerCase();
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, iiko_order_number, iiko_order_id, customer_name, customer_phone, status, total, created_at')
        .or(`order_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%,iiko_order_number.ilike.%${searchTerm}%,iiko_order_id.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        setResults(data as SearchResult[]);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchOrders(value), 300);
  };

  const handleSelectOrder = (order: SearchResult) => {
    setShowResults(false);
    setQuery('');
    navigate('/admin/orders-manage', { state: { searchQuery: order.order_number } });
  };

  const statusLabels: Record<string, { ar: string; en: string; color: string }> = {
    pending: { ar: 'انتظار', en: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed', color: 'bg-blue-500/20 text-blue-400' },
    preparing: { ar: 'تحضير', en: 'Preparing', color: 'bg-orange-500/20 text-orange-400' },
    ready: { ar: 'جاهز', en: 'Ready', color: 'bg-green-500/20 text-green-400' },
    out_for_delivery: { ar: 'في الطريق', en: 'On Way', color: 'bg-primary/20 text-primary' },
    delivered: { ar: 'تم', en: 'Done', color: 'bg-green-600/20 text-green-300' },
    cancelled: { ar: 'ملغي', en: 'Cancel', color: 'bg-destructive/20 text-destructive' },
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className={cn(
          "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
          isRTL ? "right-3" : "left-3"
        )} />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={isRTL ? 'ابحث عن طلب...' : 'Search orders...'}
          className={cn(
            "h-9 bg-muted/50 border-border/50 text-sm",
            isRTL ? "pr-9 pl-8" : "pl-9 pr-8"
          )}
        />
        {isSearching && (
          <Loader2 className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground",
            isRTL ? "left-3" : "right-3"
          )} />
        )}
        {query && !isSearching && (
          <button
            onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground",
              isRTL ? "left-3" : "right-3"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full mt-1 w-full min-w-[320px] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isRTL ? 'لا توجد نتائج' : 'No results found'}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((order) => {
                const status = statusLabels[order.status] || statusLabels.pending;
                return (
                  <button
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-start border-b border-border/30 last:border-0"
                  >
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium truncate">
                          {order.iiko_order_number || order.order_number}
                        </span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", status.color)}>
                          {isRTL ? status.ar : status.en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{order.customer_name}</span>
                        <span>•</span>
                        <span>{order.total} AED</span>
                      </div>
                      {order.iiko_order_number && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                          <Hash className="h-3 w-3" />
                          <span>iiko: {order.iiko_order_number}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrderSearch;
