import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  Truck, 
  CheckCircle2,
  XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderStatus, ORDER_STATUS_CONFIG, ORDER_STATUS_FLOW } from '@/types/order';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  className?: string;
}

const StatusIcon = ({ status, isActive, isComplete }: { 
  status: OrderStatus; 
  isActive: boolean; 
  isComplete: boolean;
}) => {
  const iconClass = cn(
    'w-6 h-6 transition-colors',
    isComplete ? 'text-green-500' : isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'
  );

  switch (status) {
    case 'pending':
      return <Clock className={iconClass} />;
    case 'confirmed':
      return <CheckCircle className={iconClass} />;
    case 'preparing':
      return <ChefHat className={iconClass} />;
    case 'ready':
      return <Package className={iconClass} />;
    case 'out_for_delivery':
      return <Truck className={iconClass} />;
    case 'delivered':
      return <CheckCircle2 className={iconClass} />;
    case 'cancelled':
      return <XCircle className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
};

export const OrderStatusTimeline = ({ currentStatus, className }: OrderStatusTimelineProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <div className={cn('p-6 rounded-lg bg-destructive/10 border border-destructive/20', className)}>
        <div className="flex items-center gap-3">
          <XCircle className="w-8 h-8 text-destructive" />
          <div>
            <h3 className="font-bold text-destructive">
              {isRTL ? 'تم إلغاء الطلب' : 'Order Cancelled'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-bold text-lg">
        {isRTL ? 'حالة الطلب' : 'Order Status'}
      </h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 start-6 h-full w-0.5 bg-muted -translate-x-1/2" />
        <div 
          className="absolute top-6 start-6 w-0.5 bg-primary transition-all duration-500 -translate-x-1/2"
          style={{ 
            height: `${Math.min((currentIndex / (ORDER_STATUS_FLOW.length - 1)) * 100, 100)}%` 
          }}
        />

        <div className="space-y-6">
          {ORDER_STATUS_FLOW.map((status, index) => {
            const config = ORDER_STATUS_CONFIG[status];
            const isComplete = index < currentIndex;
            const isActive = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div 
                key={status}
                className={cn(
                  'relative flex items-start gap-4 transition-opacity',
                  isPending && 'opacity-50'
                )}
              >
                {/* Status Circle */}
                <div className={cn(
                  'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors bg-background',
                  isComplete ? 'border-green-500 bg-green-50 dark:bg-green-950' : 
                  isActive ? 'border-primary bg-primary/10' : 
                  'border-muted'
                )}>
                  <StatusIcon status={status} isActive={isActive} isComplete={isComplete} />
                </div>

                {/* Status Info */}
                <div className="flex-1 pt-2">
                  <h4 className={cn(
                    'font-semibold transition-colors',
                    isActive && 'text-primary'
                  )}>
                    {isRTL ? config.label : config.labelEn}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? config.description : config.descriptionEn}
                  </p>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                      {isRTL ? 'الحالة الحالية' : 'Current Status'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
