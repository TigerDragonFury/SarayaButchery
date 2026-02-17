import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 min-w-[80px]"
      aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{language === "ar" ? "EN" : "عربي"}</span>
    </Button>
  );
};

export default LanguageToggle;
