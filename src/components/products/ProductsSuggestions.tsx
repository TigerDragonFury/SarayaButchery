import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";

// Cross-sell rules: what add-ons go well with which meat types
const crossSellRules: Record<string, string[]> = {
  beef: ["spices", "bread", "pickles", "bbq"],
  lamb: ["spices", "bread", "pickles", "rice"],
  chicken: ["spices", "bread", "marinades", "bbq"],
  "ready-to-cook": ["bread", "salads", "drinks"],
  "special-cuts": ["spices", "wine", "bbq"],
};

const addOnCategories = ["spices", "frozen", "bread", "bbq", "pickles", "drinks", "salads"];

const ProductsSuggestions = () => {
  const { language } = useLanguage();
  const { items, addItem } = useCart();
  const { data: allProducts } = useProducts();

  // Determine what add-ons to suggest based on cart contents
  const suggestedProducts = useMemo(() => {
    if (!allProducts || items.length === 0) return [];

    // Get categories of items in cart
    const cartCategories = new Set(
      items.map((item) => item.category?.toLowerCase() || "")
    );

    // Determine which add-on types to suggest
    const suggestedTypes = new Set<string>();
    cartCategories.forEach((cat) => {
      const rules = crossSellRules[cat] || [];
      rules.forEach((type) => suggestedTypes.add(type));
    });

    // Filter add-on products that match suggestions
    const addOns = allProducts.filter((product) => {
      const productCat = product.category?.toLowerCase() || "";
      const productName = product.name.toLowerCase();
      
      // Check if product is an add-on type
      const isAddOn = addOnCategories.some(
        (addon) => productCat.includes(addon) || productName.includes(addon)
      );
      
      // Check if it's a suggested type
      const isSuggested = Array.from(suggestedTypes).some(
        (type) => productCat.includes(type) || productName.includes(type)
      );

      // Don't suggest items already in cart
      const notInCart = !items.some((item) => item.id === product.id);

      return isAddOn && isSuggested && notInCart;
    });

    // Return up to 4 suggestions
    return addOns.slice(0, 4);
  }, [allProducts, items]);

  if (suggestedProducts.length === 0) return null;

  const title = language === "ar" ? "قد تحتاج أيضاً" : "You may also need";

  const handleQuickAdd = (product: typeof suggestedProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      image: product.image,
      unit: product.unit,
      category: product.category,
    }, 1);
  };

  return (
    <div className="bg-accent/30 border border-accent rounded-lg p-4 my-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {suggestedProducts.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-32 bg-card rounded-lg p-2 border"
          >
            <div className="aspect-square mb-2 overflow-hidden rounded-md bg-muted">
              <img
                src={product.image}
                alt={language === "ar" ? product.name : product.nameEn || product.name}
                className="w-full h-full object-contain bg-muted/30"
                loading="lazy"
              />
            </div>
            <p className="text-xs font-medium line-clamp-2 mb-1">
              {language === "ar" ? product.name : product.nameEn || product.name}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">
                {product.price} AED
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => handleQuickAdd(product)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsSuggestions;
