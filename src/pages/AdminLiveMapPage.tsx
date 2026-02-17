import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Navigation, 
  Phone, 
  Package, 
  MapPin,
  RefreshCw,
  Users,
  Truck,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverWithLocation {
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  order_id: string | null;
  order_number: string | null;
  customer_name: string | null;
  delivery_address: string | null;
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  location_updated_at: string;
  availability: 'available' | 'on_delivery' | 'offline';
}

// Google Maps API Key - configured for alsarayabutcheryllc.com and lovable.app domains
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCo4x4PgxMRu1rTRvyYyWR4xST_bSM64Js';

// Abu Dhabi center coordinates (Al Saraya Butchery area)
const MAP_CENTER = { lat: 24.4574, lng: 54.3364 };

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const AdminLiveMapPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [selectedDriver, setSelectedDriver] = useState<DriverWithLocation | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Fetch all drivers with their locations
  const { data: drivers, isLoading, refetch } = useQuery({
    queryKey: ['admin-drivers-live'],
    queryFn: async () => {
      // Get all drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .neq('availability', 'offline');

      if (driversError) throw driversError;

      // Get latest locations for each driver
      const driversWithLocations: DriverWithLocation[] = [];

      for (const driver of driversData || []) {
        // Get latest location
        const { data: locationData } = await supabase
          .from('driver_locations')
          .select('*')
          .eq('driver_id', driver.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get current order if on delivery
        let orderInfo = null;
        if (driver.current_order_id) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('id, order_number, customer_name, delivery_address')
            .eq('id', driver.current_order_id)
            .single();
          orderInfo = orderData;
        }

        if (locationData) {
          driversWithLocations.push({
            driver_id: driver.id,
            driver_name: driver.name,
            driver_phone: driver.phone,
            order_id: orderInfo?.id || null,
            order_number: orderInfo?.order_number || null,
            customer_name: orderInfo?.customer_name || null,
            delivery_address: orderInfo?.delivery_address || null,
            latitude: Number(locationData.latitude),
            longitude: Number(locationData.longitude),
            heading: locationData.heading ? Number(locationData.heading) : null,
            speed: locationData.speed ? Number(locationData.speed) : null,
            location_updated_at: locationData.created_at,
            availability: driver.availability || 'offline',
          });
        }
      }

      return driversWithLocations;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Subscribe to realtime driver location updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-driver-locations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_locations',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Fit map to show all drivers
  useEffect(() => {
    if (mapRef && drivers && drivers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      drivers.forEach((driver) => {
        bounds.extend({ lat: driver.latitude, lng: driver.longitude });
      });
      mapRef.fitBounds(bounds, 50);
    }
  }, [mapRef, drivers]);

  const getMarkerIcon = (driver: DriverWithLocation): google.maps.Symbol => {
    const color = driver.availability === 'on_delivery' ? '#22c55e' : '#3b82f6';
    const rotation = driver.heading || 0;

    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation,
    };
  };

  const activeDrivers = useMemo(() => 
    drivers?.filter(d => d.availability === 'on_delivery') || [], 
    [drivers]
  );

  const availableDrivers = useMemo(() => 
    drivers?.filter(d => d.availability === 'available') || [], 
    [drivers]
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return isRTL ? 'الآن' : 'Just now';
    if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
  };

  return (
    <AdminLayout title="Live Tracking Map" titleAr="خريطة التتبع المباشر">
      <div className="space-y-4 h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)]">
        {/* Stats Bar */}
        <div className="flex flex-wrap gap-3">
          <Card className="flex-1 min-w-[140px]">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Truck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeDrivers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'في التوصيل' : 'On Delivery'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[140px]">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableDrivers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'متاحين' : 'Available'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="h-auto py-3"
          >
            <RefreshCw className="h-4 w-4 me-2" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Map Container */}
        <div className="flex-1 h-full min-h-[400px] rounded-lg overflow-hidden border">
          {!isLoaded ? (
            <Skeleton className="w-full h-full" />
          ) : loadError ? (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-center p-6 max-w-md">
                <MapPin className="h-12 w-12 mx-auto text-destructive mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isRTL ? 'فشل تحميل الخريطة' : 'Failed to load map'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL 
                    ? 'تحقق من صلاحية مفتاح Google Maps API وتأكد من تفعيل الفوترة في Google Cloud Console'
                    : 'Please verify your Google Maps API key is valid and billing is enabled in Google Cloud Console'}
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 me-2" />
                  {isRTL ? 'إعادة المحاولة' : 'Retry'}
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={MAP_CENTER}
              zoom={11}
              options={mapOptions}
              onLoad={onMapLoad}
            >
              {drivers?.map((driver) => (
                <Marker
                  key={driver.driver_id}
                  position={{ lat: driver.latitude, lng: driver.longitude }}
                  icon={getMarkerIcon(driver)}
                  onClick={() => setSelectedDriver(driver)}
                  title={driver.driver_name}
                />
              ))}

              {selectedDriver && (
                <InfoWindow
                  position={{ lat: selectedDriver.latitude, lng: selectedDriver.longitude }}
                  onCloseClick={() => setSelectedDriver(null)}
                >
                  <div className="p-2 min-w-[200px]" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        selectedDriver.availability === 'on_delivery' 
                          ? "bg-green-500" 
                          : "bg-blue-500"
                      )} />
                      <h3 className="font-bold text-foreground">{selectedDriver.driver_name}</h3>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${selectedDriver.driver_phone}`} className="hover:underline">
                          {selectedDriver.driver_phone}
                        </a>
                      </div>

                      {selectedDriver.speed && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Navigation className="h-3 w-3" />
                          <span>{Math.round(selectedDriver.speed)} km/h</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(selectedDriver.location_updated_at)}</span>
                      </div>

                      {selectedDriver.order_number && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-primary" />
                            <span className="font-medium text-foreground">
                              {selectedDriver.order_number}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedDriver.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {selectedDriver.delivery_address}
                          </p>
                        </div>
                      )}
                    </div>

                    <Badge 
                      variant={selectedDriver.availability === 'on_delivery' ? 'default' : 'secondary'}
                      className="mt-2"
                    >
                      {selectedDriver.availability === 'on_delivery'
                        ? (isRTL ? 'في التوصيل' : 'On Delivery')
                        : (isRTL ? 'متاح' : 'Available')}
                    </Badge>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>

        {/* Drivers List (Mobile) */}
        <div className="lg:hidden">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {isRTL ? 'السائقين النشطين' : 'Active Drivers'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {drivers && drivers.length > 0 ? (
                <div className="space-y-2">
                  {drivers.map((driver) => (
                    <div 
                      key={driver.driver_id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      onClick={() => {
                        setSelectedDriver(driver);
                        mapRef?.panTo({ lat: driver.latitude, lng: driver.longitude });
                        mapRef?.setZoom(15);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          driver.availability === 'on_delivery' 
                            ? "bg-green-500/10" 
                            : "bg-blue-500/10"
                        )}>
                          <Navigation className={cn(
                            "h-5 w-5",
                            driver.availability === 'on_delivery' 
                              ? "text-green-500" 
                              : "text-blue-500"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{driver.driver_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {driver.order_number || (isRTL ? 'لا يوجد طلب' : 'No active order')}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={driver.availability === 'on_delivery' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {driver.speed ? `${Math.round(driver.speed)} km/h` : (isRTL ? 'ثابت' : 'Idle')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {isRTL ? 'لا يوجد سائقين نشطين' : 'No active drivers'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLiveMapPage;
