import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const CartIcon = () => {
  const { totalItems } = useCart();
  const { isRTL } = useLanguage();

  return (
    <Link to="/cart">
      <Button
        variant="outline"
        size="icon"
        className="relative"
        aria-label={isRTL ? "سلة التسوق" : "Shopping cart"}
      >
        <ShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartIcon;
