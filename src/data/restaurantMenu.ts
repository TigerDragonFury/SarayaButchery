// Restaurant Menu - Ready-to-eat food items
// منيو المطعم - الأكل الجاهز

// Import restaurant images
import manakeeshSpinachCheese from "@/assets/restaurant/manakeesh-spinach-cheese.jpg";
import manakeeshArugula from "@/assets/restaurant/manakeesh-arugula.jpg";
import koftaPlate from "@/assets/restaurant/kofta-plate.jpg";
import kebabTomato from "@/assets/restaurant/kebab-tomato.jpg";
import kebabPlatter from "@/assets/restaurant/kebab-platter.jpg";
import mixedGrillPlatter from "@/assets/restaurant/mixed-grill-platter.jpg";
import kebabSkewers from "@/assets/restaurant/kebab-skewers.jpg";
import kibbehGrilled from "@/assets/restaurant/kibbeh-grilled.jpg";
import manakeeshZaatarPomegranate from "@/assets/restaurant/manakeesh-zaatar-pomegranate.jpg";
import shawarmaSaj from "@/assets/restaurant/shawarma-saj.jpg";
import potteryTomatoMeat from "@/assets/restaurant/pottery-tomato-meat.jpg";

export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  nameEn: string;
  image?: string;
  items: MenuItem[];
}

export const restaurantCategories: MenuCategory[] = [
  {
    id: "bbq",
    name: "مشاوي",
    nameEn: "BBQ",
    image: kebabSkewers,
    items: [
      { id: "bbq-1", name: "ستيك بلاك أنجوس", nameEn: "Black Angus Steak", price: 95, category: "bbq" },
      { id: "bbq-2", name: "ستيك واغيو (4-5)", nameEn: "Wagyu Steak (4-5)", price: 185, category: "bbq" },
      { id: "bbq-3", name: "شيش برك", nameEn: "Shish Barak", price: 48, category: "bbq" },
      { id: "bbq-4", name: "كفتة بندورة", nameEn: "Kafta Tomato", price: 50, category: "bbq", image: koftaPlate },
      { id: "bbq-5", name: "فريكة باللحم", nameEn: "Meat Freekeh", price: 58, category: "bbq" },
      { id: "bbq-6", name: "محشي ورق عنب باللحم", nameEn: "Stuffed Lamb", price: 60, category: "bbq" },
      { id: "bbq-7", name: "مقلوبة لحم", nameEn: "Meat Maqluba", price: 60, category: "bbq" },
      { id: "bbq-8", name: "كفتة بالطحينة", nameEn: "Kafta Tahina", price: 50, category: "bbq", image: kebabTomato },
      { id: "bbq-9", name: "منسف أردني", nameEn: "Jordanian Mansaf", price: 60, category: "bbq" },
      { id: "bbq-10", name: "فريكة بالدجاج", nameEn: "Chicken Freekeh", price: 48, category: "bbq" },
      { id: "bbq-11", name: "ورق عنب مع ريش غنم", nameEn: "Vine Leaves Lamb Chop", price: 60, category: "bbq" },
      { id: "bbq-12", name: "مقلوبة دجاج", nameEn: "Chicken Maqluba", price: 50, category: "bbq" },
      { id: "bbq-13", name: "كباب لحم", nameEn: "Meat Kebab", price: 55, category: "bbq", image: kebabSkewers },
      { id: "bbq-14", name: "طبق كباب مشكل", nameEn: "Mixed Kebab Platter", price: 75, category: "bbq", image: mixedGrillPlatter },
    ]
  },
  {
    id: "pottery",
    name: "فخاريات",
    nameEn: "Pottery Dishes",
    image: potteryTomatoMeat,
    items: [
      { id: "pot-1", name: "فخارة بندورة", nameEn: "Tomato Pottery", price: 17, category: "pottery" },
      { id: "pot-2", name: "فخارة بندورة باللحم", nameEn: "Tomato Meat Pottery", price: 28, category: "pottery", image: potteryTomatoMeat },
      { id: "pot-3", name: "فخارة بطاطا باللحم", nameEn: "Potato Meat Pottery", price: 28, category: "pottery" },
      { id: "pot-4", name: "فخارة بطاطا حارة", nameEn: "Spicy Potato Pottery", price: 25, category: "pottery" },
      { id: "pot-5", name: "فخارة فطر باللحم", nameEn: "Mushroom Meat Pottery", price: 28, category: "pottery" },
      { id: "pot-6", name: "فخارة رأس عصفور", nameEn: "Meat Ras Alasfour Pottery", price: 28, category: "pottery" },
      { id: "pot-7", name: "فخارة سجق", nameEn: "Sausage Pottery", price: 26, category: "pottery" },
      { id: "pot-8", name: "فخارة كبدة دجاج", nameEn: "Chicken Liver Pottery", price: 24, category: "pottery" },
      { id: "pot-9", name: "كفتة بالطحينة", nameEn: "Kafta Tahina", price: 25, category: "pottery" },
      { id: "pot-10", name: "كبدة دجاج بالرمان", nameEn: "Chicken Liver with Pomegranate", price: 24, category: "pottery" },
      { id: "pot-11", name: "فخارة بيض", nameEn: "Egg Pottery", price: 14, category: "pottery" },
      { id: "pot-12", name: "فخارة بيض باللحم", nameEn: "Egg Meat Pottery", price: 28, category: "pottery" },
      { id: "pot-13", name: "محشي ورق عنب", nameEn: "Stuffed Lamb", price: 24, category: "pottery" },
      { id: "pot-14", name: "فخارة بيض بالبطاطا", nameEn: "Egg Potato Pottery", price: 20, category: "pottery" },
    ]
  },
  {
    id: "sandwiches",
    name: "سندويشات",
    nameEn: "Sandwiches",
    image: shawarmaSaj,
    items: [
      { id: "sand-1", name: "سندويش تكة لحم", nameEn: "Meat Takka Sandwich", price: 17, category: "sandwiches" },
      { id: "sand-2", name: "سندويش كباب دجاج", nameEn: "Chicken Kabab Sandwich", price: 14, category: "sandwiches" },
      { id: "sand-3", name: "عرايس لحم", nameEn: "Meat Arayes", price: 16, category: "sandwiches" },
      { id: "sand-4", name: "سندويش سجق", nameEn: "Sausage Sandwich", price: 15, category: "sandwiches" },
      { id: "sand-5", name: "سندويش شيش طاووق", nameEn: "Shish Tawouk Sandwich", price: 14, category: "sandwiches" },
      { id: "sand-6", name: "سندويش كباب لحم", nameEn: "Meat Kabab Sandwich", price: 16, category: "sandwiches" },
      { id: "sand-7", name: "شاورما صاج", nameEn: "Shawarma Saj", price: 16, category: "sandwiches", image: shawarmaSaj },
      { id: "sand-8", name: "سندويش كباب دجاج كبير", nameEn: "Chicken Kabab Sandwich Large", price: 27, category: "sandwiches" },
      { id: "sand-9", name: "شاورما دجاج بالجبنة صاج", nameEn: "Chicken Shawarma with Cheese Saj", price: 18, category: "sandwiches" },
    ]
  },
  {
    id: "fattat",
    name: "فتات وفول",
    nameEn: "Fattat & Foul",
    items: [
      { id: "fat-1", name: "فتة حمص باللحم", nameEn: "Hummus Fatteh with Meat", price: 32, category: "fattat" },
      { id: "fat-2", name: "فول مدمس", nameEn: "Black Beans", price: 15, category: "fattat" },
      { id: "fat-3", name: "قدسية", nameEn: "Qadisyeh", price: 16, category: "fattat" },
      { id: "fat-4", name: "فتة حمص بالطحينة", nameEn: "Hummus Fatteh with Tahina", price: 26, category: "fattat" },
      { id: "fat-5", name: "فول بالطحينة", nameEn: "Foul with Tahina", price: 16, category: "fattat" },
    ]
  },
  {
    id: "shamyat",
    name: "شاميات",
    nameEn: "Shamyat (Pies)",
    items: [
      { id: "sham-1", name: "لحم وخضار (كيلو)", nameEn: "Meat and Vegetables (KG)", price: 125, category: "shamyat" },
      { id: "sham-2", name: "جبنة (كيلو)", nameEn: "Cheese (KG)", price: 120, category: "shamyat" },
      { id: "sham-3", name: "مشكل (كيلو)", nameEn: "Mix (KG)", price: 125, category: "shamyat" },
      { id: "sham-4", name: "لحم بدبس الرمان (كيلو)", nameEn: "Meat with Pomegranate Honey (KG)", price: 125, category: "shamyat" },
      { id: "sham-5", name: "سبانخ (كيلو)", nameEn: "Spinach (KG)", price: 105, category: "shamyat" },
    ]
  },
  {
    id: "manakeesh",
    name: "مناقيش",
    nameEn: "Manakeesh",
    image: manakeeshSpinachCheese,
    items: [
      { id: "man-1", name: "زعتر", nameEn: "Zaatar", price: 8, category: "manakeesh" },
      { id: "man-2", name: "زعتر خضار", nameEn: "Zaatar with Vegetables", price: 9, category: "manakeesh" },
      { id: "man-3", name: "جبنة عكاوي", nameEn: "Akkawi Cheese", price: 10, category: "manakeesh", image: manakeeshArugula },
      { id: "man-4", name: "جبنة وزعتر", nameEn: "Cheese with Zaatar", price: 12, category: "manakeesh" },
      { id: "man-5", name: "جبنة لحم", nameEn: "Cheese with Meat", price: 13, category: "manakeesh" },
      { id: "man-6", name: "جبنة بقدونس", nameEn: "Cheese with Parsley", price: 10, category: "manakeesh" },
      { id: "man-7", name: "جبنة كرافت", nameEn: "Kraft Cheese", price: 10, category: "manakeesh" },
      { id: "man-8", name: "جبنة قشقوان", nameEn: "Kashkaval Cheese", price: 12, category: "manakeesh" },
      { id: "man-9", name: "جبنة مع مرتديلا", nameEn: "Mortadella with Cheese", price: 13, category: "manakeesh" },
      { id: "man-10", name: "لبنة مع خضار", nameEn: "Labnah with Vegetables", price: 12, category: "manakeesh" },
      { id: "man-11", name: "محمرة", nameEn: "Muhammara", price: 9, category: "manakeesh" },
      { id: "man-12", name: "لحم", nameEn: "Meat", price: 9, category: "manakeesh" },
      { id: "man-13", name: "لحم دبس رمان", nameEn: "Meat with Pomegranate Honey", price: 9, category: "manakeesh", image: manakeeshZaatarPomegranate },
      { id: "man-14", name: "شرائح لحم", nameEn: "Meat Slices", price: 28, category: "manakeesh" },
      { id: "man-15", name: "سجق", nameEn: "Sausage", price: 9, category: "manakeesh" },
      { id: "man-16", name: "سجق جبن", nameEn: "Sausage with Cheese", price: 12, category: "manakeesh" },
      { id: "man-17", name: "سبانخ", nameEn: "Spinach", price: 9, category: "manakeesh", image: manakeeshSpinachCheese },
      { id: "man-18", name: "لبنة", nameEn: "Labnah", price: 9, category: "manakeesh" },
      { id: "man-19", name: "لبنة زعتر", nameEn: "Labnah with Zaatar", price: 11, category: "manakeesh" },
    ]
  },
  {
    id: "mini-pastries",
    name: "معجنات صغيرة",
    nameEn: "Mini Pastries",
    items: [
      { id: "mini-1", name: "زعتر", nameEn: "Zaatar", price: 2.5, category: "mini-pastries" },
      { id: "mini-2", name: "جبنة فيتا", nameEn: "Feta Cheese", price: 2.5, category: "mini-pastries" },
      { id: "mini-3", name: "لحم", nameEn: "Meat", price: 2.5, category: "mini-pastries" },
      { id: "mini-4", name: "سبانخ", nameEn: "Spinach", price: 2.5, category: "mini-pastries" },
      { id: "mini-5", name: "بيتزا", nameEn: "Pizza", price: 2.5, category: "mini-pastries" },
      { id: "mini-6", name: "لبنة", nameEn: "Labneh", price: 2.5, category: "mini-pastries" },
      { id: "mini-7", name: "هوت دوج", nameEn: "Hot Dog", price: 2.5, category: "mini-pastries" },
    ]
  },
  {
    id: "soup",
    name: "شوربات",
    nameEn: "Soup",
    items: [
      { id: "soup-1", name: "شوربة عدس", nameEn: "Lentil Soup", price: 12, category: "soup" },
      { id: "soup-2", name: "شوربة دجاج", nameEn: "Chicken Soup", price: 15, category: "soup" },
      { id: "soup-3", name: "شوربة فطر", nameEn: "Mushroom Soup", price: 15, category: "soup" },
      { id: "soup-4", name: "شوربة شمالية", nameEn: "Grilled North", price: 15, category: "soup" },
    ]
  },
  {
    id: "appetizers",
    name: "مقبلات",
    nameEn: "Appetizers",
    items: [
      { id: "app-1", name: "صحن حمص", nameEn: "Hummus Plate", price: 18, category: "appetizers" },
      { id: "app-2", name: "حمص بيروتي", nameEn: "Hummus Beiruti", price: 20, category: "appetizers" },
      { id: "app-3", name: "حمص بالمكسرات", nameEn: "Hummus with Nuts", price: 24, category: "appetizers" },
      { id: "app-4", name: "حمص باللحم والمكسرات", nameEn: "Hummus with Meat & Nuts", price: 28, category: "appetizers" },
      { id: "app-5", name: "متبل", nameEn: "Moutabal", price: 18, category: "appetizers" },
      { id: "app-6", name: "بابا غنوج", nameEn: "Baba Ghanoush", price: 18, category: "appetizers" },
      { id: "app-7", name: "ورق عنب", nameEn: "Vine Leaves", price: 20, category: "appetizers" },
      { id: "app-8", name: "صحن ثوم", nameEn: "Garlic Plate", price: 10, category: "appetizers" },
    ]
  },
  {
    id: "hot-starters",
    name: "مقبلات ساخنة",
    nameEn: "Hot Starters",
    image: kibbehGrilled,
    items: [
      { id: "hot-1", name: "بطاطا مقلية", nameEn: "French Fries", price: 15, category: "hot-starters" },
      { id: "hot-2", name: "كبة مقلية", nameEn: "Fried Kabba", price: 20, category: "hot-starters" },
      { id: "hot-3", name: "كبة بطاطا", nameEn: "Kabba Potato", price: 18, category: "hot-starters" },
      { id: "hot-4", name: "كبة مشوية", nameEn: "Grilled Kebba", price: 12, category: "hot-starters", image: kibbehGrilled },
      { id: "hot-5", name: "سمبوسة جبنة", nameEn: "Cheese Sambousek", price: 20, category: "hot-starters" },
      { id: "hot-6", name: "سمبوسة لحم", nameEn: "Meat Sambousek", price: 20, category: "hot-starters" },
      { id: "hot-7", name: "رول جبنة", nameEn: "Cheese Roll", price: 20, category: "hot-starters" },
    ]
  },
  {
    id: "salads",
    name: "سلطات",
    nameEn: "Salads",
    items: [
      { id: "sal-1", name: "تبولة", nameEn: "Tabbouleh", price: 20, category: "salads" },
      { id: "sal-2", name: "سلطة عربية", nameEn: "Arabic Salad", price: 18, category: "salads" },
      { id: "sal-3", name: "سلطة يونانية", nameEn: "Greek Salad", price: 22, category: "salads" },
      { id: "sal-4", name: "سلطة سيزر", nameEn: "Caesar Salad", price: 18, category: "salads" },
      { id: "sal-5", name: "فتوش", nameEn: "Fattoush", price: 20, category: "salads" },
      { id: "sal-6", name: "سلطة روكا", nameEn: "Rocca Salad", price: 20, category: "salads" },
      { id: "sal-7", name: "سلطة حلوم", nameEn: "Halloumi Salad", price: 22, category: "salads" },
      { id: "sal-8", name: "سلطة طحينة", nameEn: "Tahina Salad", price: 10, category: "salads" },
    ]
  },
  {
    id: "drinks",
    name: "مشروبات",
    nameEn: "Drinks",
    items: [
      { id: "drink-1", name: "عصير كوكتيل", nameEn: "Cocktail Juice", price: 18, category: "drinks" },
      { id: "drink-2", name: "عصير أفوكادو", nameEn: "Avocado Juice", price: 22, category: "drinks" },
      { id: "drink-3", name: "عصير رمان", nameEn: "Pomegranate Juice", price: 20, category: "drinks" },
      { id: "drink-4", name: "عصير برتقال", nameEn: "Orange Juice", price: 18, category: "drinks" },
      { id: "drink-5", name: "عصير ليمون", nameEn: "Lemon Juice", price: 18, category: "drinks" },
      { id: "drink-6", name: "عصير ليمون نعناع", nameEn: "Lemon with Mint", price: 18, category: "drinks" },
      { id: "drink-7", name: "عصير مانجا", nameEn: "Mango Juice", price: 18, category: "drinks" },
      { id: "drink-8", name: "عصير فراولة", nameEn: "Strawberry Juice", price: 18, category: "drinks" },
      { id: "drink-9", name: "عصير جوافة", nameEn: "Guava Juice", price: 18, category: "drinks" },
      { id: "drink-10", name: "مشروبات غازية", nameEn: "Soft Drinks", price: 3, category: "drinks" },
      { id: "drink-11", name: "مياه غازية", nameEn: "Sparkling Water", price: 7, category: "drinks" },
      { id: "drink-12", name: "مياه عادية", nameEn: "Normal Water (Small)", price: 2, category: "drinks" },
      { id: "drink-13", name: "شاي", nameEn: "Tea", price: 5, category: "drinks" },
      { id: "drink-14", name: "قهوة تركي", nameEn: "Turkish Coffee", price: 10, category: "drinks" },
      { id: "drink-15", name: "لبن عيران", nameEn: "Buttermilk Yogurt", price: 10, category: "drinks" },
    ]
  }
];

// Get all menu items flat
export const getAllMenuItems = (): MenuItem[] => {
  return restaurantCategories.flatMap(cat => cat.items);
};

// Get items by category
export const getItemsByCategory = (categoryId: string): MenuItem[] => {
  const category = restaurantCategories.find(c => c.id === categoryId);
  return category?.items || [];
};
