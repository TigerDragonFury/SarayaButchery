import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Navigation, Phone, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { DriverLocation } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

interface LiveTrackingMapProps {
  driverLocation: DriverLocation | null;
  deliveryAddress: string;
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: string;
  className?: string;
  isDemo?: boolean;
  deliveryCoordinates?: { lat: number; lng: number };
  isLocationLive?: boolean;
}

// Default store location (Al Saraya Butchery)
const STORE_LOCATION = { lat: 24.4574, lng: 54.3364 };

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '0.75rem',
};

// Map options
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export const LiveTrackingMap = ({
  driverLocation,
  deliveryAddress,
  driverName,
  driverPhone,
  estimatedArrival,
  className,
  isDemo = false,
  deliveryCoordinates,
  isLocationLive = false,
}: LiveTrackingMapProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(
    deliveryCoordinates || null
  );

  // Google Maps API Key - configured for alsarayabutcheryllc.com and lovable.app domains
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCo4x4PgxMRu1rTRvyYyWR4xST_bSM64Js';

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Format ETA
  const formatETA = (eta: string) => {
    const date = new Date(eta);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.round(diffMs / 60000));
    
    if (diffMins < 60) {
      return isRTL ? `${diffMins} دقيقة` : `${diffMins} min`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return isRTL ? `${hours} ساعة ${mins} دقيقة` : `${hours}h ${mins}m`;
  };

  // Geocode delivery address to coordinates
  const geocodeAddress = useCallback(async (address: string) => {
    if (!isLoaded || !address || address === 'Pickup from store') return;
    
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ 
        address: `${address}, Abu Dhabi, UAE`,
        region: 'ae',
      });
      
      if (result.results[0]?.geometry?.location) {
        const location = result.results[0].geometry.location;
        setDestinationCoords({ lat: location.lat(), lng: location.lng() });
      }
    } catch (error) {
      console.warn('Geocoding failed:', error);
      // Use store location as fallback
      setDestinationCoords(STORE_LOCATION);
    }
  }, [isLoaded]);

  // Geocode address when component mounts or address changes
  useEffect(() => {
    if (!deliveryCoordinates && deliveryAddress) {
      geocodeAddress(deliveryAddress);
    }
  }, [deliveryAddress, deliveryCoordinates, geocodeAddress]);

  // Calculate route between driver and destination
  const calculateRoute = useCallback(async () => {
    if (!isLoaded || !driverLocation || !destinationCoords) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: { lat: driverLocation.latitude, lng: driverLocation.longitude },
        destination: destinationCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirections(result);
    } catch (error) {
      console.warn('Directions request failed:', error);
    }
  }, [isLoaded, driverLocation, destinationCoords]);

  // Update route when driver location changes
  useEffect(() => {
    if (driverLocation && destinationCoords) {
      calculateRoute();
    }
  }, [driverLocation, destinationCoords, calculateRoute]);

  // Fit map to show all markers
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    if (driverLocation && destinationCoords) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: driverLocation.latitude, lng: driverLocation.longitude });
      bounds.extend(destinationCoords);
      map.fitBounds(bounds, 60);
    }
  }, [driverLocation, destinationCoords]);

  // Update bounds when locations change
  useEffect(() => {
    if (mapRef.current && driverLocation && destinationCoords) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: driverLocation.latitude, lng: driverLocation.longitude });
      bounds.extend(destinationCoords);
      mapRef.current.fitBounds(bounds, 60);
    }
  }, [driverLocation, destinationCoords]);

  // API key is now embedded - no need for error state

  // Loading state
  if (!isLoaded) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          {isRTL ? 'تتبع السائق مباشرة' : 'Live Driver Tracking'}
        </h3>
        <div className="relative w-full h-64 md:h-80 bg-muted rounded-lg flex items-center justify-center animate-pulse">
          <p className="text-muted-foreground">
            {isRTL ? 'جاري تحميل الخريطة...' : 'Loading map...'}
          </p>
        </div>
      </div>
    );
  }

  // Error loading Maps
  if (loadError) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          {isRTL ? 'تتبع السائق مباشرة' : 'Live Driver Tracking'}
        </h3>
        <div className="relative w-full h-64 md:h-80 bg-muted rounded-lg flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-3" />
          <p className="text-muted-foreground text-center">
            {isRTL ? 'فشل تحميل الخريطة' : 'Failed to load map'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Navigation className="w-5 h-5 text-primary" />
        {isRTL ? 'تتبع السائق مباشرة' : 'Live Driver Tracking'}
      </h3>

      {/* Google Map */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={driverLocation 
            ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
            : destinationCoords || STORE_LOCATION
          }
          zoom={14}
          onLoad={onMapLoad}
          options={mapOptions}
        >
          {/* Driver Marker */}
          {driverLocation && (
            <Marker
              position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }}
              icon={{
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 7,
                rotation: driverLocation.heading || 0,
                fillColor: '#22c55e',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              title={driverName || (isRTL ? 'السائق' : 'Driver')}
            />
          )}

          {/* Destination Marker */}
          {destinationCoords && (
            <Marker
              position={destinationCoords}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              }}
              title={isRTL ? 'عنوان التوصيل' : 'Delivery Location'}
            />
          )}

          {/* Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#22c55e',
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>

        {/* Live indicator */}
        <div className={cn(
          "absolute top-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm",
          isLocationLive ? "border border-green-500/50" : ""
        )}>
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              isLocationLive ? "bg-green-400" : "bg-red-400"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isLocationLive ? "bg-green-500" : "bg-red-500"
            )} />
          </span>
          <span className={cn(
            "text-xs font-medium",
            isLocationLive ? "text-green-600" : "text-red-600"
          )}>
            {isLocationLive 
              ? (isRTL ? 'مباشر - متصل' : 'LIVE')
              : (isRTL ? 'جاري الاتصال...' : 'Connecting...')
            }
          </span>
        </div>

        {/* Demo badge */}
        {isDemo && (
          <div className="absolute top-4 right-4 bg-yellow-500/90 text-yellow-950 px-3 py-1 rounded-full text-xs font-bold">
            {isRTL ? 'عرض تجريبي' : 'DEMO'}
          </div>
        )}

        {/* Speed indicator */}
        {driverLocation?.speed && (
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-sm font-medium">
              {Math.round(driverLocation.speed)} {isRTL ? 'كم/س' : 'km/h'}
            </span>
          </div>
        )}
      </div>

      {/* Driver Info Card */}
      {(driverName || driverPhone || estimatedArrival) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Driver info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">{driverName || (isRTL ? 'السائق' : 'Your Driver')}</p>
                  {driverLocation?.speed && (
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'في الطريق إليك' : 'On the way to you'}
                    </p>
                  )}
                </div>
              </div>

              {/* ETA */}
              {estimatedArrival && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {formatETA(estimatedArrival)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'الوقت المتوقع للوصول' : 'Estimated Arrival'}
                  </p>
                </div>
              )}

              {/* Call button */}
              {driverPhone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${driverPhone}`}>
                    <Phone className="w-4 h-4 me-2" />
                    {isRTL ? 'اتصل' : 'Call'}
                  </a>
                </Button>
              )}
            </div>

            {/* Delivery address */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {isRTL ? 'عنوان التوصيل' : 'Delivery Address'}
                  </p>
                  <p className="text-sm text-muted-foreground">{deliveryAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
