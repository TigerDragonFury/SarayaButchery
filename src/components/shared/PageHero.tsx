import { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  titleEn?: string;
  subtitle?: string;
  backgroundImage?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const PageHero = ({
  title,
  titleEn,
  subtitle,
  backgroundImage,
  children,
  size = "md",
}: PageHeroProps) => {
  const sizeClasses = {
    sm: "py-16",
    md: "py-24",
    lg: "py-32",
  };

  return (
    <section
      className={`relative ${sizeClasses[size]} bg-foreground text-background overflow-hidden`}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90" />

      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center" dir="rtl">
          {titleEn && (
            <p className="text-accent font-medium text-sm uppercase tracking-wider mb-2">
              {titleEn}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
