import { useState, ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Performance-optimized image component for Core Web Vitals.
 * - Above-the-fold images: priority=true → fetchpriority="high", no lazy load
 * - Below-the-fold images: lazy loaded with fade-in transition
 * - Explicit width/height to prevent CLS
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  style,
  ...props
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(priority);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? undefined : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      style={{
        ...(width && height ? { aspectRatio: `${width}/${height}` } : {}),
        ...style,
      }}
      {...props}
    />
  );
};

export default OptimizedImage;
