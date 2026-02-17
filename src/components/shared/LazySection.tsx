import { useRef, useState, useEffect, Suspense, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** How many pixels before the section enters viewport to start loading */
  rootMargin?: string;
}

const DefaultFallback = () => <div className="min-h-[100px]" />;

/**
 * Defers rendering of children until the placeholder scrolls near the viewport.
 * Combines with React.lazy + Suspense for true on-demand loading.
 */
const LazySection = ({ children, fallback, rootMargin = "200px" }: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (!isVisible) {
    return <div ref={ref}>{fallback ?? <DefaultFallback />}</div>;
  }

  return (
    <Suspense fallback={fallback ?? <DefaultFallback />}>
      {children}
    </Suspense>
  );
};

export default LazySection;
