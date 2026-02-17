import { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Smartphone, 
  Move3D, 
  Maximize2,
  Eye,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductViewer3DProps {
  /** Path to the GLB 3D model file */
  modelSrc: string;
  /** Path to the USDZ model for iOS AR (optional) */
  iosSrc?: string;
  /** Poster image to show while loading */
  poster?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Product name to display */
  productName?: string;
  /** Product price to display */
  price?: string;
  /** Enable AR mode */
  enableAR?: boolean;
  /** Enable gyroscope control on mobile */
  enableGyroscope?: boolean;
  /** Shadow intensity (0-2) */
  shadowIntensity?: number;
  /** Auto-rotate speed */
  rotationSpeed?: string;
  /** Custom className for the container */
  className?: string;
  /** Height of the viewer */
  height?: string;
}

const ProductViewer3D = ({
  modelSrc,
  iosSrc,
  poster,
  alt = 'منتج 3D',
  productName,
  price,
  enableAR = true,
  enableGyroscope = true,
  shadowIntensity = 1,
  rotationSpeed = '30deg',
  className,
  height = '400px',
}: ProductViewer3DProps) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGyroscopeActive, setIsGyroscopeActive] = useState(false);
  const [hasGyroscope, setHasGyroscope] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);

  // Check for gyroscope support and AR support
  useEffect(() => {
    // Check gyroscope availability
    if (window.DeviceOrientationEvent) {
      setHasGyroscope(true);
    }

    // Check AR support when model-viewer is ready
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      const checkAR = () => {
        // @ts-ignore - model-viewer specific property
        setIsARSupported(modelViewer.canActivateAR);
      };
      
      modelViewer.addEventListener('load', checkAR);
      return () => modelViewer.removeEventListener('load', checkAR);
    }
  }, []);

  // Handle gyroscope orientation
  useEffect(() => {
    if (!enableGyroscope || !isGyroscopeActive) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const modelViewer = modelViewerRef.current;
      if (!modelViewer || !event.beta || !event.gamma) return;

      // Convert device orientation to camera orbit
      const beta = event.beta; // -180 to 180 (front/back tilt)
      const gamma = event.gamma; // -90 to 90 (left/right tilt)

      // Normalize values for smooth rotation
      const theta = 180 + gamma * 2; // Horizontal rotation
      const phi = 75 + beta * 0.5; // Vertical angle (clamped)

      // @ts-ignore - model-viewer specific method
      modelViewer.cameraOrbit = `${theta}deg ${Math.max(45, Math.min(120, phi))}deg auto`;
    };

    // Request permission on iOS 13+
    const requestPermission = async () => {
      // @ts-ignore - iOS specific API
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          // @ts-ignore
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        } catch (error) {
          console.warn('Gyroscope permission denied:', error);
          setIsGyroscopeActive(false);
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [enableGyroscope, isGyroscopeActive]);

  // Handle model loading
  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const handleLoad = () => setIsLoading(false);
    const handleError = () => setIsLoading(false);

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, []);

  const toggleGyroscope = async () => {
    if (isGyroscopeActive) {
      setIsGyroscopeActive(false);
    } else {
      setIsGyroscopeActive(true);
    }
  };

  const resetCamera = () => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      // @ts-ignore
      modelViewer.cameraOrbit = 'auto auto auto';
      // @ts-ignore
      modelViewer.fieldOfView = 'auto';
    }
  };

  const activateAR = () => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      // @ts-ignore
      modelViewer.activateAR();
    }
  };

  return (
    <div 
      className={cn(
        'relative rounded-2xl overflow-hidden bg-gradient-to-b from-muted/20 to-muted/40',
        'border border-border/50 backdrop-blur-sm',
        className
      )}
      style={{ height }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">جاري تحميل النموذج 3D...</p>
        </div>
      )}

      {/* Product Info Overlay */}
      {(productName || price) && (
        <div className="absolute top-4 right-4 z-10 text-right" dir="rtl">
          {productName && (
            <h3 className="text-lg font-bold text-foreground drop-shadow-lg">
              {productName}
            </h3>
          )}
          {price && (
            <Badge className="mt-1 bg-primary text-primary-foreground">
              {price}
            </Badge>
          )}
        </div>
      )}

      {/* 3D Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Badge variant="secondary" className="gap-1 bg-background/80 backdrop-blur-sm">
          <Move3D className="w-3 h-3" />
          360°
        </Badge>
        {enableAR && isARSupported && (
          <Badge variant="secondary" className="gap-1 bg-background/80 backdrop-blur-sm">
            <Eye className="w-3 h-3" />
            AR
          </Badge>
        )}
      </div>

      {/* Model Viewer */}
      <model-viewer
        ref={modelViewerRef}
        src={modelSrc}
        ios-src={iosSrc}
        poster={poster}
        alt={alt}
        ar={enableAR}
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        ar-placement="floor"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        auto-rotate-delay={3000}
        rotation-per-second={rotationSpeed}
        interaction-prompt="auto"
        interaction-prompt-style="basic"
        interaction-prompt-threshold={5000}
        shadow-intensity={shadowIntensity}
        shadow-softness={0.8}
        environment-image="neutral"
        exposure={1}
        camera-orbit="auto auto 105%"
        min-camera-orbit="auto 30deg auto"
        max-camera-orbit="auto 150deg auto"
        field-of-view="30deg"
        min-field-of-view="20deg"
        max-field-of-view="45deg"
        loading="eager"
        reveal="auto"
        interpolation-decay={100}
        xr-environment
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          '--poster-color': 'transparent',
        } as React.CSSProperties}
        className="w-full h-full"
      />

      {/* Control Buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {/* Reset Camera */}
        <Button
          variant="secondary"
          size="sm"
          onClick={resetCamera}
          className="gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">إعادة</span>
        </Button>

        {/* Gyroscope Toggle (Mobile Only) */}
        {hasGyroscope && enableGyroscope && (
          <Button
            variant={isGyroscopeActive ? 'default' : 'secondary'}
            size="sm"
            onClick={toggleGyroscope}
            className={cn(
              'gap-1.5 backdrop-blur-sm',
              isGyroscopeActive 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background/80 hover:bg-background/90'
            )}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isGyroscopeActive ? 'إيقاف الجيروسكوب' : 'تفعيل الجيروسكوب'}
            </span>
          </Button>
        )}

        {/* AR Button */}
        {enableAR && isARSupported && (
          <Button
            variant="secondary"
            size="sm"
            onClick={activateAR}
            className="gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">AR عرض</span>
          </Button>
        )}
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <p className="text-xs text-muted-foreground/70 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
          اسحب للتدوير • اضغط للتكبير
        </p>
      </div>
    </div>
  );
};

export default ProductViewer3D;
