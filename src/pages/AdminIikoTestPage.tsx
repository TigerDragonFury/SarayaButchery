import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  XCircle, 
  Send, 
  RefreshCw, 
  Trash2, 
  Plus,
  Terminal,
  Wifi,
  WifiOff,
  AlertTriangle,
  ShieldX,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Sample products for testing
const SAMPLE_PRODUCTS = [
  { id: "lamb-16", name: "ريش غنم", nameEn: "Lamb Chops", price: 93, unit: "kg" as const },
  { id: "beef-11", name: "فيلية عجل", nameEn: "Beef Fillet", price: 94, unit: "kg" as const },
  { id: "chicken-1", name: "صدر دجاج", nameEn: "Chicken Breast", price: 28, unit: "kg" as const },
  { id: "steak-1", name: "ريب آي ستيك", nameEn: "Ribeye Steak", price: 145, unit: "kg" as const },
  { id: "lamb-8", name: "موزات غنم", nameEn: "Lamb Shank", price: 60, unit: "kg" as const },
];

interface TestOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: 'kg' | 'piece';
  price: number;
  notes?: string;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

const AdminIikoTestPage = () => {
  const { isRTL } = useLanguage();
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Order form state
  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery');
  const [items, setItems] = useState<TestOrderItem[]>([]);
  const [customerName, setCustomerName] = useState('TEST CUSTOMER');
  const [customerPhone, setCustomerPhone] = useState('+971500000000');
  const [customerAddress, setCustomerAddress] = useState('Test Address, Dubai');
  const [orderNotes, setOrderNotes] = useState('');

  // Auth protection
  // Auth is handled by AdminLayout

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      type,
      message
    }]);
  };

  const clearLogs = () => setLogs([]);

  const testConnection = async () => {
    setIsLoading(true);
    addLog('info', 'Testing iiko connection...');
    
    try {
      const { data, error } = await supabase.functions.invoke('iiko-test-order', {
        body: {},
        headers: { 'Content-Type': 'application/json' },
      });

      // Parse the action parameter
      const response = await supabase.functions.invoke('iiko-test-order?action=ping', {
        body: {},
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      
      if (result.success) {
        setConnectionStatus('connected');
        addLog('success', 'Connection successful!');
        result.logs?.forEach((log: string) => addLog('info', log));
        toast.success('iiko connection successful!');
      } else {
        setConnectionStatus('disconnected');
        addLog('error', `Connection failed: ${result.error}`);
        toast.error('iiko connection failed');
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      addLog('error', `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error('Failed to connect to iiko');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (product: typeof SAMPLE_PRODUCTS[0]) => {
    const existingIndex = items.findIndex(i => i.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.nameEn,
        quantity: 1,
        unit: product.unit,
        price: product.price,
      }]);
    }
    addLog('info', `Added ${product.nameEn} to test order`);
  };

  const removeItem = (index: number) => {
    const item = items[index];
    setItems(items.filter((_, i) => i !== index));
    addLog('info', `Removed ${item.productName} from test order`);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return removeItem(index);
    const updated = [...items];
    updated[index].quantity = quantity;
    setItems(updated);
  };

  const sendTestOrder = async () => {
    if (items.length === 0) {
      toast.error('Add at least one item to the order');
      return;
    }

    setIsLoading(true);
    addLog('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    addLog('info', 'Sending TEST ORDER to iiko...');
    addLog('info', `Order Type: ${orderType.toUpperCase()}`);
    addLog('info', `Items: ${items.length}`);
    addLog('info', `Customer: ${customerName}`);

    try {
      const response = await supabase.functions.invoke('iiko-test-order?action=test-order', {
        body: {
          items,
          orderType,
          customerName,
          customerPhone,
          customerAddress: orderType === 'delivery' ? customerAddress : undefined,
          notes: orderNotes || 'Test order from admin panel',
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      
      // Add all logs from the response
      result.logs?.forEach((log: string) => {
        if (log.includes('✓') || log.includes('success')) {
          addLog('success', log);
        } else if (log.includes('✗') || log.includes('error') || log.includes('ERROR')) {
          addLog('error', log);
        } else if (log.includes('WARNING')) {
          addLog('warning', log);
        } else {
          addLog('info', log);
        }
      });

      if (result.success) {
        addLog('success', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('success', `✓ TEST ORDER CREATED SUCCESSFULLY!`);
        addLog('success', `Order ID: ${result.orderId}`);
        addLog('success', `Order Number: ${result.orderNumber}`);
        toast.success('Test order sent to iiko!', {
          description: `Order #${result.orderNumber}`,
        });
      } else {
        addLog('error', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('error', `✗ ORDER FAILED: ${result.error}`);
        if (result.details) {
          addLog('error', `Details: ${JSON.stringify(result.details)}`);
        }
        toast.error('Test order failed', {
          description: result.error,
        });
      }
    } catch (err) {
      addLog('error', `Order error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error('Failed to send test order');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AdminLayout title="iiko POS Test" titleAr="اختبار iiko POS">
      <div className="container mx-auto py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">iiko POS Test Panel</h1>
            <p className="text-muted-foreground mt-1">
              Send test orders to iiko dashboard without affecting accounting
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'disconnected' ? 'destructive' : 'secondary'}
              className="flex items-center gap-1"
            >
              {connectionStatus === 'connected' ? <Wifi className="h-3 w-3" /> : 
               connectionStatus === 'disconnected' ? <WifiOff className="h-3 w-3" /> : 
               <AlertTriangle className="h-3 w-3" />}
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'disconnected' ? 'Disconnected' : 'Unknown'}
            </Badge>
            <Button onClick={testConnection} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Test Order Builder</CardTitle>
              <CardDescription>Build a test order to send to iiko</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Type */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={(v) => setOrderType(v as 'delivery' | 'collection')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">🚚 Delivery</SelectItem>
                    <SelectItem value="collection">🏪 Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Customer Info</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+971..."
                    />
                  </div>
                </div>
                {orderType === 'delivery' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Delivery Address</Label>
                    <Input 
                      value={customerAddress} 
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Full delivery address"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Add Products</Label>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PRODUCTS.map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(product)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {product.nameEn}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <Label>Order Items</Label>
                  <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-background rounded p-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.price} AED × {item.quantity} {item.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 text-center"
                            step="0.5"
                            min="0.5"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{totalAmount.toFixed(2)} AED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Order Notes</Label>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                />
              </div>

              {/* Send Button */}
              <Button 
                onClick={sendTestOrder} 
                disabled={isLoading || items.length === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test Order to iiko
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Test orders are marked as [TEST] and should not affect accounting
              </p>
            </CardContent>
          </Card>

          {/* Logs Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Activity Logs
                </CardTitle>
                <CardDescription>Real-time iiko API communication logs</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearLogs}>
                Clear
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] rounded-lg border bg-black/90 p-4 font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">No logs yet. Test the connection or send an order.</p>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-2 py-1 ${
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}
                    >
                      <span className="text-muted-foreground shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="shrink-0">
                        {log.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> :
                         log.type === 'error' ? <XCircle className="h-3 w-3" /> :
                         log.type === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                         '→'}
                      </span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIikoTestPage;
