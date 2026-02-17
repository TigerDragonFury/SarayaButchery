import { ReactNode } from "react";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";

interface PageLayoutProps {
  children: ReactNode;
  showWhatsAppBanner?: boolean;
}

const PageLayout = ({ children, showWhatsAppBanner = false }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      <main className="flex-1 pt-20">{children}</main>
      {showWhatsAppBanner && <WhatsAppCTA variant="banner" />}
      <MainFooter />
      {/* Floating WhatsApp button on ALL pages */}
      <WhatsAppCTA variant="fixed" />
    </div>
  );
};

export default PageLayout;
