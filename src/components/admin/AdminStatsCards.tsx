import { Package, Truck, Users, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
  pendingOrders: number;
  activeDeliveries: number;
  availableDrivers: number;
  completedToday: number;
  avgDeliveryTime?: number;
  todayRevenue?: number;
}

interface AdminStatsCardsProps {
  stats: StatsData;
}

const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const cards = [
    {
      icon: Package,
      value: stats.pendingOrders,
      labelAr: 'طلبات قيد الانتظار',
      labelEn: 'Pending Orders',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      icon: Truck,
      value: stats.activeDeliveries,
      labelAr: 'توصيلات نشطة',
      labelEn: 'Active Deliveries',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Users,
      value: stats.availableDrivers,
      labelAr: 'سائقين متاحين',
      labelEn: 'Available Drivers',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: CheckCircle2,
      value: stats.completedToday,
      labelAr: 'تم التوصيل اليوم',
      labelEn: 'Delivered Today',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Clock,
      value: stats.avgDeliveryTime || 0,
      labelAr: 'متوسط وقت التوصيل (د)',
      labelEn: 'Avg. Delivery (min)',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      suffix: isRTL ? ' د' : ' min',
    },
    {
      icon: DollarSign,
      value: stats.todayRevenue || 0,
      labelAr: 'إيرادات اليوم',
      labelEn: "Today's Revenue",
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      suffix: isRTL ? ' د.إ' : ' AED',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold">
                {card.value}{card.suffix || ''}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL ? card.labelAr : card.labelEn}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStatsCards;
