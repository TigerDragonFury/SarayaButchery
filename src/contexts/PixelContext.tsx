import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PixelContextType {
  trackEvent: (eventName: string, data?: Record<string, unknown>) => void;
  trackPageView: (pageName?: string) => void;
  trackAddToCart: (item: CartItem) => void;
  trackBeginCheckout: (total: number, items: CartItem[]) => void;
  trackPurchase: (orderId: string, total: number, items: CartItem[]) => void;
  trackLead: (data?: Record<string, unknown>) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

const PixelContext = createContext<PixelContextType | undefined>(undefined);

// Facebook Pixel helper - will work once pixel ID is configured
const fbq = (...args: unknown[]) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq(...args);
  } else {
    // Queue events until pixel loads
    (window as any).fbqQueue = (window as any).fbqQueue || [];
    (window as any).fbqQueue.push(args);
  }
};

// TikTok Pixel helper - will work once pixel ID is configured
const ttq = (...args: unknown[]) => {
  if (typeof window !== "undefined" && (window as any).ttq) {
    (window as any).ttq.track(...args);
  } else {
    // Queue events until pixel loads
    (window as any).ttqQueue = (window as any).ttqQueue || [];
    (window as any).ttqQueue.push(args);
  }
};

// Google Analytics helper
const gtag = (...args: unknown[]) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

export const PixelProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  const trackPageView = (pageName?: string) => {
    const page = pageName || location.pathname;
    
    // Facebook Pixel
    fbq("track", "PageView");
    
    // TikTok Pixel
    ttq("PageView");
    
    // Google Analytics
    gtag("event", "page_view", {
      page_path: page,
      page_title: document.title,
    });

  };

  const trackEvent = (eventName: string, data?: Record<string, unknown>) => {
    fbq("track", eventName, data);
    ttq(eventName, data);
    gtag("event", eventName, data);
  };

  const trackAddToCart = (item: CartItem) => {
    fbq("track", "AddToCart", {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value: item.price * item.quantity,
      currency: "AED",
      quantity: item.quantity,
    });
    
    ttq("AddToCart", {
      content_id: item.id,
      content_name: item.name,
      quantity: item.quantity,
      price: item.price,
      value: item.price * item.quantity,
      currency: "AED",
    });
    
    gtag("event", "add_to_cart", {
      currency: "AED",
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
      }],
    });
  };

  const trackBeginCheckout = (total: number, items: CartItem[]) => {
    fbq("track", "InitiateCheckout", {
      content_ids: items.map(i => i.id),
      content_type: "product",
      value: total,
      currency: "AED",
      num_items: items.length,
    });

    ttq("InitiateCheckout", {
      content_ids: items.map(i => i.id),
      value: total,
      currency: "AED",
    });

    gtag("event", "begin_checkout", {
      currency: "AED",
      value: total,
      items: items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
  };

  const trackPurchase = (orderId: string, total: number, items: CartItem[]) => {
    const contentIds = items.map(i => i.id);
    
    fbq("track", "Purchase", {
      content_ids: contentIds,
      content_type: "product",
      value: total,
      currency: "AED",
      num_items: items.length,
      order_id: orderId,
    });
    
    ttq("CompletePayment", {
      content_ids: contentIds,
      value: total,
      currency: "AED",
      quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    });
    
    gtag("event", "purchase", {
      transaction_id: orderId,
      value: total,
      currency: "AED",
      items: items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
  };

  const trackLead = (data?: Record<string, unknown>) => {
    fbq("track", "Lead", data);
    ttq("SubmitForm", data);
    gtag("event", "generate_lead", data);
  };

  return (
    <PixelContext.Provider value={{ 
      trackEvent, 
      trackPageView, 
      trackAddToCart, 
      trackBeginCheckout,
      trackPurchase,
      trackLead 
    }}>
      {children}
    </PixelContext.Provider>
  );
};

export const usePixel = () => {
  const context = useContext(PixelContext);
  if (!context) {
    throw new Error("usePixel must be used within a PixelProvider");
  }
  return context;
};
