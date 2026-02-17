import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  nameEn?: string;
  price: number; // Price per KG
  quantity: number; // Weight in KG
  image: string;
  unit?: string;
  category?: string;
  notes?: string; // Special instructions for butcher
  voiceNoteBlob?: Blob; // Voice note recording (not persisted to localStorage)
  voiceNoteDuration?: number; // Duration in seconds
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, weight?: number, notes?: string) => void;
  removeItem: (id: string) => void;
  updateItemNotes: (id: string, notes: string) => void;
  updateItemVoiceNote: (id: string, voiceNoteBlob: Blob | null, duration?: number) => void;
  updateQuantity: (id: string, weight: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalWeight: number;
  subtotal: number;
  deliveryFee: number;
  minimumOrder: number;
  total: number;
  isMinimumMet: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "saraya-cart";
const DELIVERY_FEE = 15; // AED
const MINIMUM_ORDER = 100; // AED
const FREE_DELIVERY_THRESHOLD = 250; // AED

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>, weight: number = 1, notes?: string) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { 
                ...i, 
                quantity: parseFloat((i.quantity + weight).toFixed(1)),
                notes: notes || i.notes
              }
            : i
        );
      }
      return [...prevItems, { ...item, quantity: weight, notes }];
    });

    // Track add_to_cart via gtag directly (avoids circular context dependency)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "add_to_cart", {
        currency: "AED",
        value: item.price * weight,
        items: [{
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          quantity: weight,
          price: item.price,
        }],
      });
    }
  };

  const updateItemNotes = (id: string, notes: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  const updateItemVoiceNote = (id: string, voiceNoteBlob: Blob | null, duration?: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id 
          ? { 
              ...item, 
              voiceNoteBlob: voiceNoteBlob || undefined, 
              voiceNoteDuration: duration || undefined 
            } 
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, weight: number) => {
    if (weight <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: parseFloat(weight.toFixed(1)) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Get total weight for a specific product (across all weight variants)
  const getItemQuantity = (productId: string) => {
    // Match items that start with the productId (handles weight variants like "beef-1" matching "beef-1-0.5")
    const matchingItems = items.filter(i => i.id.startsWith(productId.split('-').slice(0, -1).join('-') || productId));
    return matchingItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Total unique items in cart
  const totalItems = items.length;
  
  // Total weight across all items
  const totalWeight = parseFloat(items.reduce((sum, item) => sum + item.quantity, 0).toFixed(1));
  
  // Subtotal (price per kg * weight)
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  
  const total = subtotal + deliveryFee;
  
  const isMinimumMet = subtotal >= MINIMUM_ORDER;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateItemNotes,
        updateItemVoiceNote,
        clearCart,
        getItemQuantity,
        totalItems,
        totalWeight,
        subtotal,
        deliveryFee,
        minimumOrder: MINIMUM_ORDER,
        total,
        isMinimumMet,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
