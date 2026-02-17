// SEO Schema generators for structured data

export const generateProductSchema = (product: {
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sku?: string;
  inStock?: boolean;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image.startsWith("http") 
    ? product.image 
    : `https://alsarayabutcheryllc.com${product.image}`,
  "sku": product.sku || product.nameEn?.toLowerCase().replace(/\s+/g, "-") || product.name.replace(/\s+/g, "-"),
  "category": product.category,
  "brand": {
    "@type": "Brand",
    "name": "Al Saraya Butchery"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "AED",
    "price": Number(product.price) || 0,
    "priceValidUntil": "2027-12-31",
    "availability": product.inStock === false 
      ? "https://schema.org/OutOfStock" 
      : "https://schema.org/InStock",
    "url": "https://alsarayabutcheryllc.com/products",
    "seller": {
      "@type": "Organization",
      "name": "Al Saraya Butchery LLC"
    }
  }
});

export const generateRecipeSchema = (recipe: {
  name: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  steps: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": recipe.name,
  "description": recipe.description,
  "image": recipe.image,
  "author": {
    "@type": "Organization",
    "name": "Al Saraya Butchery"
  },
  "prepTime": recipe.prepTime,
  "cookTime": recipe.cookTime,
  "recipeYield": recipe.servings,
  "recipeCategory": "Main Course",
  "recipeCuisine": "Middle Eastern",
  "recipeIngredient": recipe.ingredients,
  "recipeInstructions": recipe.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "text": step
  }))
});

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  author: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": article.image,
  "datePublished": article.datePublished,
  "author": {
    "@type": "Organization",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "Al Saraya Butchery LLC",
    "logo": {
      "@type": "ImageObject",
      "url": "https://alsarayabutcheryllc.com/logo.jpg"
    }
  }
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://alsarayabutcheryllc.com${item.url}`
  }))
});

export const generateCateringServiceSchema = (service: {
  name: string;
  description: string;
  image: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "FoodService",
  "name": service.name,
  "description": service.description,
  "image": service.image,
  "provider": {
    "@type": "Organization",
    "name": "Al Saraya Butchery LLC",
    "url": "https://alsarayabutcheryllc.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United Arab Emirates"
  },
  "serviceType": "Catering"
});
