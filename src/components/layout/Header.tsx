import { useState } from "react";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#home", label: "الرئيسية", labelEn: "Home" },
    { href: "#shop", label: "المتجر", labelEn: "Shop" },
    { href: "#catering", label: "التموين", labelEn: "Catering" },
    { href: "#menu", label: "القائمة", labelEn: "Menu" },
    { href: "#recipes", label: "الوصفات", labelEn: "Recipes" },
    { href: "#about", label: "من نحن", labelEn: "About" },
    { href: "#testimonials", label: "آراء العملاء", labelEn: "Reviews" },
    { href: "#contact", label: "تواصل معنا", labelEn: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <img src={logo} alt="ملحمة السرايا" className="h-16 w-auto" />
            <div className="text-right">
              <h1 className="text-xl font-bold text-primary">ملحمة السرايا</h1>
              <p className="text-xs text-muted-foreground">Al Saraya Butchery</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6" dir="rtl">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="w-4 h-4" />
              <span>اتصل بنا</span>
            </Button>
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4" />
              <span>واتساب</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border" dir="rtl">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  <span>اتصل بنا</span>
                </Button>
                <Button size="sm" className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4" />
                  <span>واتساب</span>
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
