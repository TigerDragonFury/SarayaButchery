import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { PixelProvider } from "@/contexts/PixelContext";
import PageLoader from "@/components/shared/PageLoader";
import MobileAppShell from "@/components/mobile/MobileAppShell";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

// Lazy load non-critical global components to reduce initial bundle
const StickyCTA = lazy(() => import("@/components/shared/StickyCTA"));
const SeasonalOverlay = lazy(() => import("@/components/shared/SeasonalOverlay"));
const BackgroundEffects = lazy(() => import("@/components/shared/BackgroundEffects"));
const SeasonalBanner = lazy(() => import("@/components/shared/SeasonalBanner"));
const DesignSettingsProvider = lazy(() => import("@/components/shared/DesignSettingsProvider"));

// Eager load critical pages
import HomePage from "./pages/HomePage";

// Lazy load non-critical pages for faster initial load
const ShopPage = lazy(() => import("./pages/ShopPage"));
const Product3DViewerPage = lazy(() => import("./pages/Product3DViewerPage"));
const BoxesPage = lazy(() => import("./pages/BoxesPage"));
const CateringPage = lazy(() => import("./pages/CateringPage"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const RestaurantPage = lazy(() => import("./pages/RestaurantPage"));
const RecipesPage = lazy(() => import("./pages/RecipesPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const RefundPolicyPage = lazy(() => import("./pages/RefundPolicyPage"));
const PaymentPolicyPage = lazy(() => import("./pages/PaymentPolicyPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Driver App Pages
const DriverLoginPage = lazy(() => import("./pages/DriverLoginPage"));
const DriverMobilePage = lazy(() => import("./pages/DriverMobilePage"));
const DriverPanelPage = lazy(() => import("./pages/DriverPanelPage"));

// Admin Pages
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const OrderMessagesPage = lazy(() => import("./pages/OrderMessagesPage"));

// Ad Landing Pages
const BoxesLandingPage = lazy(() => import("./pages/landing/BoxesLandingPage"));
const OffersLandingPage = lazy(() => import("./pages/landing/OffersLandingPage"));

// SEO Location Landing Pages
const ButcherAbuDhabiPage = lazy(() => import("./pages/seo/ButcherAbuDhabiPage"));
const FreshMeatDeliveryPage = lazy(() => import("./pages/seo/FreshMeatDeliveryPage"));
const HalalButcherUAEPage = lazy(() => import("./pages/seo/HalalButcherUAEPage"));
const WagyuBeefAbuDhabiPage = lazy(() => import("./pages/seo/WagyuBeefAbuDhabiPage"));
const BBQMeatAbuDhabiPage = lazy(() => import("./pages/seo/BBQMeatAbuDhabiPage"));
const BeefAbuDhabiPage = lazy(() => import("./pages/seo/BeefAbuDhabiPage"));
const LambMeatAbuDhabiPage = lazy(() => import("./pages/seo/LambMeatAbuDhabiPage"));
const ChickenAbuDhabiPage = lazy(() => import("./pages/seo/ChickenAbuDhabiPage"));
const ButcherAlReemIslandPage = lazy(() => import("./pages/seo/ButcherAlReemIslandPage"));
const ButcherKhalifaCityPage = lazy(() => import("./pages/seo/ButcherKhalifaCityPage"));
const ButcherAlRahaPage = lazy(() => import("./pages/seo/ButcherAlRahaPage"));
const RamadanMeatOffersPage = lazy(() => import("./pages/seo/RamadanMeatOffersPage"));
const RamadanBBQBoxPage = lazy(() => import("./pages/seo/RamadanBBQBoxPage"));
const RamadanWagyuOfferPage = lazy(() => import("./pages/seo/RamadanWagyuOfferPage"));
const RamadanMeatDeliveryPage = lazy(() => import("./pages/seo/RamadanMeatDeliveryPage"));

// Standalone Products Page
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const OffersPage = lazy(() => import("./pages/OffersPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));

const queryClient = new QueryClient();

// Inner component inside BrowserRouter to use router hooks (useLocation for visitor tracking)
const AppRoutes = () => {
  useVisitorTracking();
  return (
    <PixelProvider>
      <MobileAppShell>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/3d-viewer" element={<Product3DViewerPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/boxes" element={<BoxesPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/catering" element={<CateringPage />} />
            <Route path="/catering/:type" element={<CateringPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/restaurant" element={<RestaurantPage />} />
            <Route path="/restaurant/:category" element={<RestaurantPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/payment-policy" element={<PaymentPolicyPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/track" element={<TrackOrderPage />} />
            <Route path="/track/:orderNumber" element={<TrackOrderPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
            {/* Driver App Routes */}
            <Route path="/driver/login" element={<DriverLoginPage />} />
            <Route path="/driver" element={<DriverMobilePage />} />
            <Route path="/driver/map" element={<DriverMobilePage />} />
            <Route path="/driver/notifications" element={<DriverMobilePage />} />
            <Route path="/driver/profile" element={<DriverMobilePage />} />
            <Route path="/driver/legacy" element={<DriverPanelPage />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
            <Route path="/order/:orderNumber/messages" element={<OrderMessagesPage />} />
            {/* Ad Landing Pages */}
            <Route path="/landing/boxes" element={<BoxesLandingPage />} />
            <Route path="/landing/offers" element={<OffersLandingPage />} />
            {/* Standalone Pages */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoriesPage />} />
            {/* SEO Location Landing Pages */}
            <Route path="/butcher-abu-dhabi" element={<ButcherAbuDhabiPage />} />
            <Route path="/fresh-meat-delivery-abu-dhabi" element={<FreshMeatDeliveryPage />} />
            <Route path="/halal-butcher-uae" element={<HalalButcherUAEPage />} />
            <Route path="/wagyu-beef-abu-dhabi" element={<WagyuBeefAbuDhabiPage />} />
            <Route path="/bbq-meat-abu-dhabi" element={<BBQMeatAbuDhabiPage />} />
            <Route path="/beef-abu-dhabi" element={<BeefAbuDhabiPage />} />
            <Route path="/lamb-meat-abu-dhabi" element={<LambMeatAbuDhabiPage />} />
            <Route path="/chicken-abu-dhabi" element={<ChickenAbuDhabiPage />} />
            <Route path="/butcher-al-reem-island" element={<ButcherAlReemIslandPage />} />
            <Route path="/butcher-khalifa-city" element={<ButcherKhalifaCityPage />} />
            <Route path="/butcher-al-raha" element={<ButcherAlRahaPage />} />
            <Route path="/ramadan-meat-offers-abu-dhabi" element={<RamadanMeatOffersPage />} />
            <Route path="/ramadan-bbq-box-abu-dhabi" element={<RamadanBBQBoxPage />} />
            <Route path="/ramadan-wagyu-offer" element={<RamadanWagyuOfferPage />} />
            <Route path="/ramadan-meat-delivery-abu-dhabi" element={<RamadanMeatDeliveryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {/* Lazy load non-critical global overlays */}
        <Suspense fallback={null}>
          <StickyCTA />
          <SeasonalOverlay />
          <BackgroundEffects />
        </Suspense>
      </MobileAppShell>
    </PixelProvider>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <LanguageProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={null}>
              <DesignSettingsProvider />
            </Suspense>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </CartProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
