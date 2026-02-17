import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  MapPin, 
  Truck, 
  Clock, 
  DollarSign, 
  Plus,
  Save,
  Loader2,
  Trash2,
  Phone,
  Mail,
  Globe,
  Building,
  ExternalLink,
  Key,
  Server,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StoreLocation, StoreContact, StoreHours, StoreSocial } from '@/hooks/useStoreSettings';
import { Textarea } from '@/components/ui/textarea';
import BestSellersManager from '@/components/admin/BestSellersManager';
import OurProductsManager from '@/components/admin/OurProductsManager';
import SeasonalEventsManager from '@/components/admin/SeasonalEventsManager';
import HeroImagesManager from '@/components/admin/HeroImagesManager';

export interface IikoConfig {
  organizationId: string;
  terminalId: string;
  deliveryOrderTypeId: string;
  collectionOrderTypeId: string;
  paymentTypeId: string;
  baseUrl: string;
  webhookEnabled: boolean;
  webhookSecret: string;
}

const defaultIikoConfig: IikoConfig = {
  organizationId: '',
  terminalId: '',
  deliveryOrderTypeId: '',
  collectionOrderTypeId: '',
  paymentTypeId: '',
  baseUrl: 'https://api-eu.syrve.live',
  webhookEnabled: false,
  webhookSecret: '',
};

interface DeliveryZone {
  id: string;
  name: string;
  name_ar: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  estimated_minutes_min: number;
  estimated_minutes_max: number;
  is_active: boolean;
}

const AdminSettingsPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    name_ar: '',
    delivery_fee: 15,
    free_delivery_threshold: 250,
    estimated_minutes_min: 30,
    estimated_minutes_max: 60,
  });

  // Store settings state
  const [location, setLocation] = useState<StoreLocation | null>(null);
  const [contact, setContact] = useState<StoreContact | null>(null);
  const [hours, setHours] = useState<StoreHours | null>(null);
  const [social, setSocial] = useState<StoreSocial | null>(null);
  const [iikoConfig, setIikoConfig] = useState<IikoConfig>(defaultIikoConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [iikoApiKey, setIikoApiKey] = useState('');
  const [iikoTestStatus, setIikoTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [bookingsAlertThreshold, setBookingsAlertThreshold] = useState(5);

  // Fetch delivery zones
  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as DeliveryZone[];
    },
  });

  // Fetch store settings
  const { data: storeSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['store-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');
      
      if (error) throw error;
      return data;
    },
  });

  // Initialize store settings state when data loads
  useEffect(() => {
    if (storeSettings) {
      storeSettings.forEach((setting: { key: string; value: unknown }) => {
        switch (setting.key) {
          case 'location':
            setLocation(setting.value as StoreLocation);
            break;
          case 'contact':
            setContact(setting.value as StoreContact);
            break;
          case 'hours':
            setHours(setting.value as StoreHours);
            break;
          case 'social':
            setSocial(setting.value as StoreSocial);
            break;
          case 'iiko_config':
            setIikoConfig(setting.value as IikoConfig);
            break;
          case 'bookings_config':
            setBookingsAlertThreshold((setting.value as any)?.alertThreshold || 5);
            break;
        }
      });
    }
  }, [storeSettings]);

  // Update store settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: StoreLocation | StoreContact | StoreHours | StoreSocial }) => {
      const { error } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(value)) })
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings-admin'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success(isRTL ? 'تم حفظ التغييرات' : 'Changes saved');
    },
    onError: () => {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    },
  });

  // Update zone mutation
  const updateZoneMutation = useMutation({
    mutationFn: async (zone: DeliveryZone) => {
      const { error } = await supabase
        .from('delivery_zones')
        .update({
          name: zone.name,
          name_ar: zone.name_ar,
          delivery_fee: zone.delivery_fee,
          free_delivery_threshold: zone.free_delivery_threshold,
          estimated_minutes_min: zone.estimated_minutes_min,
          estimated_minutes_max: zone.estimated_minutes_max,
          is_active: zone.is_active,
        })
        .eq('id', zone.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
      toast.success(isRTL ? 'تم حفظ التغييرات' : 'Changes saved');
    },
    onError: () => {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    },
  });

  // Add zone mutation
  const addZoneMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('delivery_zones')
        .insert([newZone]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
      toast.success(isRTL ? 'تمت إضافة المنطقة' : 'Zone added');
      setIsAddDialogOpen(false);
      setNewZone({
        name: '',
        name_ar: '',
        delivery_fee: 15,
        free_delivery_threshold: 250,
        estimated_minutes_min: 30,
        estimated_minutes_max: 60,
      });
    },
    onError: () => {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    },
  });

  // Delete zone mutation
  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
      toast.success(isRTL ? 'تم حذف المنطقة' : 'Zone deleted');
    },
    onError: () => {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    },
  });

  const handleZoneChange = (zone: DeliveryZone, field: keyof DeliveryZone, value: string | number | boolean) => {
    const updatedZone = { ...zone, [field]: value };
    updateZoneMutation.mutate(updatedZone);
  };

  const handleSaveLocation = () => {
    if (location) {
      updateSettingMutation.mutate({ key: 'location', value: location });
    }
  };

  const handleSaveContact = () => {
    if (contact) {
      updateSettingMutation.mutate({ key: 'contact', value: contact });
    }
  };

  const handleSaveHours = () => {
    if (hours) {
      updateSettingMutation.mutate({ key: 'hours', value: hours });
    }
  };

  const handleSaveSocial = () => {
    if (social) {
      updateSettingMutation.mutate({ key: 'social', value: social });
    }
  };

  const handleSaveIikoConfig = async () => {
    // First upsert the config to store_settings
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: 'iiko_config', value: JSON.parse(JSON.stringify(iikoConfig)) }, { onConflict: 'key' });
    
    if (error) {
      toast.error(isRTL ? 'حدث خطأ في حفظ الإعدادات' : 'Error saving settings');
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['store-settings-admin'] });
    toast.success(isRTL ? 'تم حفظ إعدادات iiko' : 'iiko settings saved');
  };

  const handleTestIikoConnection = async () => {
    setIikoTestStatus('testing');
    try {
      const { data, error } = await supabase.functions.invoke('iiko-fetch-menu', {
        body: {}
      });
      
      if (error) throw error;
      if (data?.success) {
        setIikoTestStatus('success');
        toast.success(isRTL ? 'الاتصال ناجح ✅' : 'Connection successful ✅');
      } else {
        setIikoTestStatus('error');
        toast.error(isRTL ? 'فشل الاتصال' : 'Connection failed: ' + (data?.error || 'Unknown'));
      }
    } catch (err: any) {
      setIikoTestStatus('error');
      toast.error(isRTL ? 'فشل الاتصال' : 'Connection failed');
    }
    setTimeout(() => setIikoTestStatus('idle'), 5000);
  };

  const handleSaveBookingsConfig = async () => {
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: 'bookings_config', value: JSON.parse(JSON.stringify({ alertThreshold: bookingsAlertThreshold })) }, { onConflict: 'key' });
    if (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Error saving settings');
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['store-settings-admin'] });
    queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    queryClient.invalidateQueries({ queryKey: ['bookings-alert-threshold'] });
    toast.success(isRTL ? 'تم حفظ إعدادات الحجوزات' : 'Bookings settings saved');
  };

  const isLoading = zonesLoading || settingsLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Settings" titleAr="الإعدادات">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings" titleAr="الإعدادات">
      <div className="space-y-6">
        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="store">
              {isRTL ? 'معلومات المتجر' : 'Store Info'}
            </TabsTrigger>
            <TabsTrigger value="homepage">
              {isRTL ? 'الصفحة الرئيسية' : 'Homepage'}
            </TabsTrigger>
            <TabsTrigger value="delivery">
              {isRTL ? 'مناطق التوصيل' : 'Delivery Zones'}
            </TabsTrigger>
            <TabsTrigger value="api">
              {isRTL ? 'إعدادات API' : 'API Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Store Info Tab */}
          <TabsContent value="store" className="space-y-6">
            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {isRTL ? 'موقع الفرع' : 'Branch Location'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'العنوان الرسمي للمتجر وموقع خرائط جوجل' : 'Official store address and Google Maps location'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {location && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'اسم الفرع (إنجليزي)' : 'Branch Name (English)'}</Label>
                        <Input
                          value={location.name_en}
                          onChange={(e) => setLocation({ ...location, name_en: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'اسم الفرع (عربي)' : 'Branch Name (Arabic)'}</Label>
                        <Input
                          value={location.name_ar}
                          onChange={(e) => setLocation({ ...location, name_ar: e.target.value })}
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الشارع (إنجليزي)' : 'Street (English)'}</Label>
                        <Input
                          value={location.street_en}
                          onChange={(e) => setLocation({ ...location, street_en: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الشارع (عربي)' : 'Street (Arabic)'}</Label>
                        <Input
                          value={location.street_ar}
                          onChange={(e) => setLocation({ ...location, street_ar: e.target.value })}
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'المبنى (إنجليزي)' : 'Building (English)'}</Label>
                        <Input
                          value={location.building_en}
                          onChange={(e) => setLocation({ ...location, building_en: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'المبنى (عربي)' : 'Building (Arabic)'}</Label>
                        <Input
                          value={location.building_ar}
                          onChange={(e) => setLocation({ ...location, building_ar: e.target.value })}
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'المدينة (إنجليزي)' : 'City (English)'}</Label>
                        <Input
                          value={location.city_en}
                          onChange={(e) => setLocation({ ...location, city_en: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'المدينة (عربي)' : 'City (Arabic)'}</Label>
                        <Input
                          value={location.city_ar}
                          onChange={(e) => setLocation({ ...location, city_ar: e.target.value })}
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        {isRTL ? 'رابط خرائط جوجل' : 'Google Maps URL'}
                      </Label>
                      <Input
                        value={location.google_maps_url}
                        onChange={(e) => setLocation({ ...location, google_maps_url: e.target.value })}
                        dir="ltr"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'خط العرض' : 'Latitude'}</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={location.latitude}
                          onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'خط الطول' : 'Longitude'}</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={location.longitude}
                          onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveLocation} disabled={updateSettingMutation.isPending}>
                      {updateSettingMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                      <Save className="w-4 h-4 me-2" />
                      {isRTL ? 'حفظ الموقع' : 'Save Location'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'اسم الشركة الرسمي (إنجليزي)' : 'Official Company Name (English)'}</Label>
                        <Input
                          value={contact.company_name_en || ''}
                          onChange={(e) => setContact({ ...contact, company_name_en: e.target.value })}
                          placeholder="New Al Saraya Butchery L.L.C."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'اسم الشركة الرسمي (عربي)' : 'Official Company Name (Arabic)'}</Label>
                        <Input
                          value={contact.company_name_ar || ''}
                          onChange={(e) => setContact({ ...contact, company_name_ar: e.target.value })}
                          dir="rtl"
                          placeholder="ملحمة السرايا الجديدة للحوم ذ.م.م"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}</Label>
                        <Input
                          value={contact.whatsapp}
                          onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                          dir="ltr"
                          placeholder="971566808565"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => setContact({ ...contact, email: e.target.value })}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الرقم الضريبي (TRN)' : 'Tax Registration Number (TRN)'}</Label>
                        <Input
                          value={contact.vat_number || ''}
                          onChange={(e) => setContact({ ...contact, vat_number: e.target.value })}
                          dir="ltr"
                          placeholder="100XXXXXXXXX003"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رقم الرخصة التجارية' : 'Trade License Number'}</Label>
                        <Input
                          value={contact.license_number || ''}
                          onChange={(e) => setContact({ ...contact, license_number: e.target.value })}
                          dir="ltr"
                          placeholder="CN-3659621"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'عضوية غرفة التجارة (ADCCI)' : 'Chamber of Commerce (ADCCI)'}</Label>
                        <Input
                          value={contact.adcci_number || ''}
                          onChange={(e) => setContact({ ...contact, adcci_number: e.target.value })}
                          dir="ltr"
                          placeholder="10002085"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveContact} disabled={updateSettingMutation.isPending}>
                      {updateSettingMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                      <Save className="w-4 h-4 me-2" />
                      {isRTL ? 'حفظ معلومات الاتصال' : 'Save Contact'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Hours Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {isRTL ? 'ساعات العمل' : 'Working Hours'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hours && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'العرض (إنجليزي)' : 'Display (English)'}</Label>
                        <Input
                          value={hours.display_en}
                          onChange={(e) => setHours({ ...hours, display_en: e.target.value })}
                          placeholder="8 AM - 11 PM"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'العرض (عربي)' : 'Display (Arabic)'}</Label>
                        <Input
                          value={hours.display_ar}
                          onChange={(e) => setHours({ ...hours, display_ar: e.target.value })}
                          dir="rtl"
                          placeholder="8 ص - 11 م"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'وقت الافتتاح' : 'Opening Time'}</Label>
                        <Input
                          type="time"
                          value={hours.opening}
                          onChange={(e) => setHours({ ...hours, opening: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'وقت الإغلاق' : 'Closing Time'}</Label>
                        <Input
                          type="time"
                          value={hours.closing}
                          onChange={(e) => setHours({ ...hours, closing: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveHours} disabled={updateSettingMutation.isPending}>
                      {updateSettingMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                      <Save className="w-4 h-4 me-2" />
                      {isRTL ? 'حفظ ساعات العمل' : 'Save Hours'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Social Media Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {isRTL ? 'وسائل التواصل الاجتماعي' : 'Social Media'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {social && (
                  <>
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input
                        value={social.instagram}
                        onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                        dir="ltr"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Facebook</Label>
                      <Input
                        value={social.facebook}
                        onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                        dir="ltr"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>TikTok</Label>
                      <Input
                        value={social.tiktok}
                        onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                        dir="ltr"
                        placeholder="https://tiktok.com/..."
                      />
                    </div>
                    <Button onClick={handleSaveSocial} disabled={updateSettingMutation.isPending}>
                      {updateSettingMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                      <Save className="w-4 h-4 me-2" />
                      {isRTL ? 'حفظ وسائل التواصل' : 'Save Social Media'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bookings Alert Threshold */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {isRTL ? 'إعدادات الحجوزات' : 'Bookings Settings'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تحكم في عتبة تنبيهات الضغط في جدول الحجوزات' : 'Control the pressure alert threshold for the bookings schedule'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'عتبة التنبيه (عدد الطلبات في الساعة)' : 'Alert Threshold (orders per hour)'}</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      className="w-24"
                      value={bookingsAlertThreshold}
                      onChange={(e) => setBookingsAlertThreshold(Math.max(1, parseInt(e.target.value) || 5))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {isRTL 
                        ? `سيظهر تنبيه عند وجود ${bookingsAlertThreshold} طلبات أو أكثر في نفس الساعة`
                        : `Alert will show when ${bookingsAlertThreshold} or more orders are in the same hour`
                      }
                    </span>
                  </div>
                </div>
                <Button onClick={handleSaveBookingsConfig} disabled={updateSettingMutation.isPending}>
                  {updateSettingMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                  <Save className="w-4 h-4 me-2" />
                  {isRTL ? 'حفظ إعدادات الحجوزات' : 'Save Bookings Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homepage Tab */}
          <TabsContent value="homepage" className="space-y-6">
            <HeroImagesManager />
            <SeasonalEventsManager />
            <BestSellersManager />
            <OurProductsManager />
          </TabsContent>

          {/* Delivery Zones Tab */}
          <TabsContent value="delivery" className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {isRTL ? 'مناطق التوصيل' : 'Delivery Zones'}
                </h2>
                <p className="text-muted-foreground">
                  {isRTL ? 'إدارة مناطق التوصيل والرسوم' : 'Manage delivery zones and fees'}
                </p>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 me-2" />
                    {isRTL ? 'إضافة منطقة' : 'Add Zone'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isRTL ? 'إضافة منطقة توصيل جديدة' : 'Add New Delivery Zone'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                        <Input
                          value={newZone.name}
                          onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                          placeholder="Dubai"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                        <Input
                          value={newZone.name_ar}
                          onChange={(e) => setNewZone({ ...newZone, name_ar: e.target.value })}
                          placeholder="دبي"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رسوم التوصيل (درهم)' : 'Delivery Fee (AED)'}</Label>
                        <Input
                          type="number"
                          value={newZone.delivery_fee}
                          onChange={(e) => setNewZone({ ...newZone, delivery_fee: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'حد التوصيل المجاني' : 'Free Delivery Threshold'}</Label>
                        <Input
                          type="number"
                          value={newZone.free_delivery_threshold}
                          onChange={(e) => setNewZone({ ...newZone, free_delivery_threshold: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الوقت الأدنى (دقيقة)' : 'Min Time (min)'}</Label>
                        <Input
                          type="number"
                          value={newZone.estimated_minutes_min}
                          onChange={(e) => setNewZone({ ...newZone, estimated_minutes_min: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الوقت الأقصى (دقيقة)' : 'Max Time (min)'}</Label>
                        <Input
                          type="number"
                          value={newZone.estimated_minutes_max}
                          onChange={(e) => setNewZone({ ...newZone, estimated_minutes_max: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => addZoneMutation.mutate()}
                      disabled={!newZone.name || !newZone.name_ar || addZoneMutation.isPending}
                    >
                      {addZoneMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                      {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Zones Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {zones?.map((zone) => (
                <Card key={zone.id} className={!zone.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {isRTL ? zone.name_ar : zone.name}
                      </CardTitle>
                      <Switch
                        checked={zone.is_active}
                        onCheckedChange={(checked) => handleZoneChange(zone, 'is_active', checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Delivery Fee */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        {isRTL ? 'رسوم التوصيل (درهم)' : 'Delivery Fee (AED)'}
                      </Label>
                      <Input
                        type="number"
                        value={zone.delivery_fee}
                        onChange={(e) => handleZoneChange(zone, 'delivery_fee', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>

                    {/* Free Delivery Threshold */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4" />
                        {isRTL ? 'حد التوصيل المجاني' : 'Free Delivery Above'}
                      </Label>
                      <Input
                        type="number"
                        value={zone.free_delivery_threshold}
                        onChange={(e) => handleZoneChange(zone, 'free_delivery_threshold', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>

                    {/* ETA */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {isRTL ? 'وقت التوصيل (دقيقة)' : 'Delivery Time (min)'}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={zone.estimated_minutes_min}
                          onChange={(e) => handleZoneChange(zone, 'estimated_minutes_min', Number(e.target.value))}
                          className="h-9"
                          placeholder="Min"
                        />
                        <span className="flex items-center text-muted-foreground">-</span>
                        <Input
                          type="number"
                          value={zone.estimated_minutes_max}
                          onChange={(e) => handleZoneChange(zone, 'estimated_minutes_max', Number(e.target.value))}
                          className="h-9"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه المنطقة؟' : 'Are you sure you want to delete this zone?')) {
                          deleteZoneMutation.mutate(zone.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 me-2" />
                      {isRTL ? 'حذف المنطقة' : 'Delete Zone'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Info Card */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isRTL ? 'معلومات التوصيل' : 'Delivery Information'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL 
                        ? 'المناطق النشطة ستظهر للعملاء عند الطلب. رسوم التوصيل تُحسب تلقائياً بناءً على المنطقة المختارة.'
                        : 'Active zones will be shown to customers during checkout. Delivery fees are calculated automatically based on the selected zone.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings Tab */}
          <TabsContent value="api" className="space-y-6">
            {/* iiko POS Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  {isRTL ? 'إعدادات iiko POS (Syrve)' : 'iiko POS (Syrve) Settings'}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? 'إعدادات الربط مع نظام نقاط البيع iiko Cloud' 
                    : 'Integration settings for iiko Cloud POS system'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {iikoTestStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : iikoTestStatus === 'error' ? (
                    <XCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Server className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {iikoTestStatus === 'success' 
                        ? (isRTL ? 'الاتصال نشط ✅' : 'Connection Active ✅')
                        : iikoTestStatus === 'error'
                        ? (isRTL ? 'فشل الاتصال ❌' : 'Connection Failed ❌')
                        : (isRTL ? 'حالة الاتصال' : 'Connection Status')}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestIikoConnection}
                    disabled={iikoTestStatus === 'testing'}
                  >
                    {iikoTestStatus === 'testing' && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                    {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
                  </Button>
                </div>

                {/* Base URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {isRTL ? 'رابط API الأساسي' : 'API Base URL'}
                  </Label>
                  <Input
                    value={iikoConfig.baseUrl}
                    onChange={(e) => setIikoConfig({ ...iikoConfig, baseUrl: e.target.value })}
                    dir="ltr"
                    placeholder="https://api-eu.syrve.live"
                  />
                </div>

                {/* Organization ID */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'معرّف المنظمة (Organization ID)' : 'Organization ID'}</Label>
                  <Input
                    value={iikoConfig.organizationId}
                    onChange={(e) => setIikoConfig({ ...iikoConfig, organizationId: e.target.value })}
                    dir="ltr"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Terminal ID */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'معرّف الطرفية (Terminal ID)' : 'Terminal Group ID'}</Label>
                  <Input
                    value={iikoConfig.terminalId}
                    onChange={(e) => setIikoConfig({ ...iikoConfig, terminalId: e.target.value })}
                    dir="ltr"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Order Type IDs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نوع طلب التوصيل' : 'Delivery Order Type ID'}</Label>
                    <Input
                      value={iikoConfig.deliveryOrderTypeId}
                      onChange={(e) => setIikoConfig({ ...iikoConfig, deliveryOrderTypeId: e.target.value })}
                      dir="ltr"
                      placeholder="UUID"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نوع طلب الاستلام' : 'Collection Order Type ID'}</Label>
                    <Input
                      value={iikoConfig.collectionOrderTypeId}
                      onChange={(e) => setIikoConfig({ ...iikoConfig, collectionOrderTypeId: e.target.value })}
                      dir="ltr"
                      placeholder="UUID"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Payment Type ID */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'معرّف نوع الدفع' : 'Payment Type ID'}</Label>
                  <Input
                    value={iikoConfig.paymentTypeId}
                    onChange={(e) => setIikoConfig({ ...iikoConfig, paymentTypeId: e.target.value })}
                    dir="ltr"
                    placeholder="UUID"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Webhook Settings */}
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    {isRTL ? 'إعدادات Webhook' : 'Webhook Settings'}
                  </h3>
                  <div className="flex items-center justify-between">
                    <Label>{isRTL ? 'تفعيل Webhook' : 'Enable Webhook'}</Label>
                    <Switch
                      checked={iikoConfig.webhookEnabled}
                      onCheckedChange={(checked) => setIikoConfig({ ...iikoConfig, webhookEnabled: checked })}
                    />
                  </div>
                  {iikoConfig.webhookEnabled && (
                    <div className="space-y-2">
                      <Label>{isRTL ? 'مفتاح Webhook السري' : 'Webhook Secret'}</Label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={iikoConfig.webhookSecret}
                          onChange={(e) => setIikoConfig({ ...iikoConfig, webhookSecret: e.target.value })}
                          dir="ltr"
                          className="font-mono text-sm pe-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-0 top-0 h-10 w-10"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <Button onClick={handleSaveIikoConfig} className="w-full">
                  <Save className="w-4 h-4 me-2" />
                  {isRTL ? 'حفظ إعدادات iiko' : 'Save iiko Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isRTL ? 'ملاحظة أمنية' : 'Security Note'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL 
                        ? 'مفتاح API الخاص بـ iiko محفوظ بشكل آمن في الخادم ولا يمكن عرضه أو تعديله من هنا. للتعديل، تواصل مع المطور.'
                        : 'The iiko API Key is securely stored on the server and cannot be viewed or modified here. Contact the developer to change it.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
