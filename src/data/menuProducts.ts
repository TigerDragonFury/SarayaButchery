// Menu products data extracted from Al Saraya Butchery official menu
// All prices are in AED per kg unless otherwise specified

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  unit?: string;
  image: string;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
  originalPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  seoTitle: string;
  seoTitleEn: string;
  seoDesc: string;
}

export const categories: Category[] = [
  { id: "all", name: "جميع المنتجات", nameEn: "All Products", seoTitle: "متجر اللحوم", seoTitleEn: "Meat Shop", seoDesc: "تسوق جميع أنواع اللحوم الطازجة والحلال" },
  { id: "lamb", name: "لحم غنم", nameEn: "Lamb Meat", seoTitle: "لحم غنم طازج", seoTitleEn: "Fresh Lamb Meat", seoDesc: "أجود قطع لحم الغنم الطازج - ريش، كتف، فخذ، مفروم" },
  { id: "beef", name: "لحم عجل", nameEn: "Beef Meat", seoTitle: "لحم عجل طازج", seoTitleEn: "Fresh Beef Meat", seoDesc: "لحم عجل طازج - شقف، مفروم، ستيك، فيليه" },
  { id: "local-veal", name: "لحم عجل محلي", nameEn: "Local Veal Meat", seoTitle: "لحم عجل هولندي محلي", seoTitleEn: "Holland Veal Meat", seoDesc: "لحم عجل هولندي محلي فاخر" },
  { id: "steak", name: "ستيك وقطعيات", nameEn: "Steak and Chops", seoTitle: "ستيك وقطعيات فاخرة", seoTitleEn: "Premium Steaks and Chops", seoDesc: "ريب آي، واغيو، انجوس، تي بون - أفخم القطعيات" },
  { id: "marinated", name: "لحوم متبلة", nameEn: "Marinated Meat", seoTitle: "لحوم متبلة جاهزة", seoTitleEn: "Marinated Meat Ready", seoDesc: "كفتة، كباب، برغر، شاورما - متبلة وجاهزة" },
  { id: "skewers", name: "مشاكيك جاهزة", nameEn: "Marinated Skewers", seoTitle: "مشاكيك جاهزة للشوي", seoTitleEn: "Ready to Grill Skewers", seoDesc: "مشاكيك متبلة جاهزة للشوي - كباب، تكا، شيش طاووق" },
  { id: "chicken", name: "دجاج", nameEn: "Chicken", seoTitle: "دجاج طازج حلال", seoTitleEn: "Fresh Halal Chicken", seoDesc: "دجاج طازج - صدور، أفخاذ، شيش طاووق، شاورما" },
  { id: "ready-to-cook", name: "جاهز للطهي", nameEn: "Ready to Cook", seoTitle: "أطباق جاهزة للطهي", seoTitleEn: "Ready to Cook Dishes", seoDesc: "صواني كبة، كفتة، محاشي، ورق عنب جاهزة للفرن" },
  { id: "frozen", name: "مفرزنات", nameEn: "Frozen Ready", seoTitle: "مفرزنات جاهزة", seoTitleEn: "Frozen Ready Items", seoDesc: "سمبوسك، كبة، رولات - مفرزنات جاهزة للقلي" },
  { id: "raw-meat", name: "لحوم نية", nameEn: "Raw Meat", seoTitle: "لحوم نية طازجة", seoTitleEn: "Fresh Raw Meat", seoDesc: "كبة نية، كفتة نية، هبرة - لحوم نية طازجة" },
  { id: "offal", name: "أحشاء", nameEn: "Offal & Bowels", seoTitle: "أحشاء ومخلفات", seoTitleEn: "Offal and Variety Meats", seoDesc: "كبدة، كلاوي، قلوب، طحال، كوارع" },
];

// Fresh product images
import chickenStripsFresh from "@/assets/products/chicken-strips-fresh.jpg";
import lambRibsSliced from "@/assets/products/lamb-ribs-sliced.jpg";
import lambRibsFresh from "@/assets/products/lamb-ribs-fresh.jpg";
import lambTikkaSkewers from "@/assets/products/lamb-tikka-skewers.jpg";
import tikkaMeatMarinatedBox from "@/assets/products/tikka-meat-marinated-box.jpg";
import tikkaMeatBox from "@/assets/products/tikka-meat-box.jpg";
import beefTenderloin from "@/assets/products/beef-tenderloin.jpg";
import chickenWingsFresh from "@/assets/products/chicken-wings-fresh.jpg";
import chickenWingsMarinated from "@/assets/products/chicken-wings-marinated.jpg";
import wholeChickenMarinated from "@/assets/products/whole-chicken-marinated.jpg";
import chickenDrumsticksFresh from "@/assets/products/chicken-drumsticks-fresh.jpg";
import chickenDrumsticksMarinated from "@/assets/products/chicken-drumsticks-marinated.jpg";
import trayDawoodBasha from "@/assets/products/tray-dawood-basha.jpg";
import chickenCubesFresh from "@/assets/products/chicken-cubes-fresh.jpg";
import beefCubesFresh from "@/assets/products/beef-cubes-fresh.jpg";
import lambNeckBone from "@/assets/products/lamb-neck-bone.jpg";
import lambNeckSlices from "@/assets/products/lamb-neck-slices.jpg";
import lambRumpSteak from "@/assets/products/lamb-rump-steak.jpg";
import striploinSteakFresh from "@/assets/products/striploin-steak-fresh.jpg";
import beefStroganoff from "@/assets/products/beef-stroganoff.jpg";
import lambShahbiyat from "@/assets/products/lamb-shahbiyat.jpg";
import beefShortRibs from "@/assets/products/beef-short-ribs.jpg";
import shortRibsMarinated from "@/assets/products/short-ribs-marinated.jpg";
import shishTawookYogurt from "@/assets/products/shish-tawook-yogurt.jpg";
import shishTawookGarlic from "@/assets/products/shish-tawook-garlic.jpg";
import shishTawookTurkish from "@/assets/products/shish-tawook-turkish.jpg";
import shishTawookLemon from "@/assets/products/shish-tawook-lemon.jpg";

// Lamb Meat - لحم غنم
export const lambProducts: Product[] = [
  { id: "lamb-1", name: "خروف بالعظم", nameEn: "Lamb with Bones", description: "لحم خروف طازج بالعظم", price: 49, image: "/src/assets/products/lamb-with-bones.png", category: "lamb" },
  { id: "lamb-2", name: "كتف غنم بالعظم", nameEn: "Lamb Shoulder with Bones", description: "كتف غنم طازج بالعظم", price: 49, image: "/src/assets/products/lamb-shoulder-bone.png", category: "lamb" },
  { id: "lamb-3", name: "فخذ غنم بالعظم", nameEn: "Lamb Leg with Bones", description: "فخذ غنم طازج كامل", price: 49, image: "/src/assets/products/lamb-leg-bone.png", category: "lamb" },
  { id: "lamb-4", name: "رقبة غنم بالعظم", nameEn: "Lamb Neck with Bones", description: "رقبة غنم طازجة", price: 49, image: lambNeckBone, category: "lamb" },
  { id: "lamb-5", name: "رقبة غنم طرنشات", nameEn: "Lamb Neck Slices w/ Bones", description: "رقبة غنم مقطعة شرائح", price: 49, image: lambNeckSlices, category: "lamb" },
  { id: "lamb-6", name: "ظهر غنم بالعظم", nameEn: "Lamb Loin with Bones", description: "ظهر غنم طازج", price: 56, image: "/src/assets/products/lamb-loin-bone.png", category: "lamb" },
  { id: "lamb-7", name: "ظهر غنم طرنشات", nameEn: "Lamb Loin w/ Bone Slices", description: "ظهر غنم مقطع شرائح", price: 56, image: "/src/assets/products/lamb-loin-slices.png", category: "lamb" },
  { id: "lamb-8", name: "موزات غنم عظم", nameEn: "Lamb Shank with Bones", description: "موزات غنم طازجة بالعظم", price: 60, image: "/src/assets/products/lamb-shank-bone.png", category: "lamb" },
  { id: "lamb-9", name: "شقف غنم", nameEn: "Lamb Cubes", description: "شقف غنم للطبخ والشوي", price: 69, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
  { id: "lamb-10", name: "رأس عصفور غنم", nameEn: "Lamb Small Cubes", description: "قطع صغيرة للطبخ السريع", price: 69, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
  { id: "lamb-11", name: "مفروم غنم خشن", nameEn: "Lamb Minced 10mm", description: "لحم غنم مفروم خشن", price: 69, image: "/src/assets/products/lamb-minced.png", category: "lamb" },
  { id: "lamb-12", name: "مفروم غنم ناعم", nameEn: "Lamb Minced 3mm", description: "لحم غنم مفروم ناعم", price: 69, image: "/src/assets/products/lamb-minced.png", category: "lamb" },
  { id: "lamb-13", name: "شرحات غنم", nameEn: "Lamb Slices", description: "شرائح غنم للشوي", price: 86, image: "/src/assets/products/lamb-loin-slices.png", category: "lamb" },
  { id: "lamb-14", name: "عالسكين غنم", nameEn: "Lamb Knife Minced", description: "لحم غنم مفروم بالسكين", price: 69, image: "/src/assets/products/lamb-minced.png", category: "lamb" },
  { id: "lamb-15", name: "هبرة غنم", nameEn: "Lamb Habra", description: "هبرة غنم طازجة", price: 69, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
  { id: "lamb-16", name: "ريش غنم", nameEn: "Lamb Chops", description: "ريش غنم فاخرة للشوي", price: 93, image: "/src/assets/products/lamb-chops.png", category: "lamb", isNew: true },
  { id: "lamb-17", name: "ظهر غنم بدون عظم", nameEn: "Lamb Loin Boneless", description: "ظهر غنم منزوع العظم", price: 86, image: "/src/assets/products/lamb-loin-bone.png", category: "lamb" },
  { id: "lamb-18", name: "فتايل غنم", nameEn: "Lamb Fuse", description: "فتايل غنم فاخرة", price: 96, image: "/src/assets/products/lamb-fuse.png", category: "lamb" },
  { id: "lamb-19", name: "موزات بدون عظم", nameEn: "Lamb Shank Boneless", description: "موزات غنم منزوعة العظم", price: 69, image: "/src/assets/products/lamb-shank-bone.png", category: "lamb" },
  { id: "lamb-20", name: "كتف غنم بدون عظم", nameEn: "Lamb Shoulder Boneless", description: "كتف غنم منزوع العظم", price: 69, image: "/src/assets/products/lamb-shoulder-bone.png", category: "lamb" },
  { id: "lamb-21", name: "دقن اللحام غنم", nameEn: "Lamb Rump", description: "لحم دقن اللحام غنم", price: 69, image: lambRumpSteak, category: "lamb" },
  { id: "lamb-22", name: "رقبة غنم بدون عظم للحشي", nameEn: "Lamb Neck Boneless", description: "رقبة غنم للحشي", price: 69, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
  { id: "lamb-23", name: "اصابع غنم", nameEn: "Lamb Straganoff", description: "لحم غنم مقطع اصابع", price: 69, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
  { id: "lamb-24", name: "اضلاع غنم بالعظم", nameEn: "Lamb Ribs with Bones", description: "اضلاع غنم طازجة", price: 47, image: lambRibsFresh, category: "lamb" },
  { id: "lamb-32", name: "اضلاع غنم مقطعة", nameEn: "Lamb Ribs Sliced", description: "اضلاع غنم مقطعة قطع", price: 49, image: lambRibsSliced, category: "lamb", isNew: true },
  { id: "lamb-25", name: "شهبيات غنم", nameEn: "Lamb Shehbaia", description: "شهبيات غنم فاخرة", price: 79, image: lambShahbiyat, category: "lamb" },
  { id: "lamb-26", name: "بسمشكات غنم", nameEn: "Lamb Basmashkat", description: "بسمشكات غنم", price: 92, image: "/src/assets/products/lamb-chops.png", category: "lamb" },
  { id: "lamb-27", name: "فخذ غنم كامل بدون عظم", nameEn: "Lamb Leg Boneless", description: "فخذ غنم كامل منزوع العظم", price: 69, image: "/src/assets/products/lamb-leg-bone.png", category: "lamb" },
  { id: "lamb-28", name: "خد فخذ غنم", nameEn: "Lamb Leg Top Side", description: "قطعة خد الفخذ", price: 78, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
  { id: "lamb-29", name: "نكل غنم", nameEn: "Lamb Knucle", description: "نكل غنم", price: 84, image: "/src/assets/products/lamb-shank-bone.png", category: "lamb" },
  { id: "lamb-30", name: "لية غنم", nameEn: "Lamb Back Side Fat", description: "لية غنم طازجة", price: 38, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
  { id: "lamb-31", name: "شحمة غنم", nameEn: "Lamb Inside Fat", description: "شحم غنم داخلي", price: 21, image: "/src/assets/products/lamb-cubes.png", category: "lamb" },
];

// Beef Meat - لحم عجل
export const beefProducts: Product[] = [
  { id: "beef-1", name: "شقف عجل", nameEn: "Beef Cubes", description: "شقف عجل للطبخ", price: 45, image: beefCubesFresh, category: "beef" },
  { id: "beef-2", name: "رأس عصفور عجل", nameEn: "Beef Small Cubes", description: "قطع عجل صغيرة", price: 45, image: beefCubesFresh, category: "beef" },
  { id: "beef-3", name: "مفروم عجل خشن", nameEn: "Beef Minced 10mm", description: "لحم عجل مفروم خشن", price: 44, image: "/src/assets/products/beef-minced.png", category: "beef" },
  { id: "beef-4", name: "مفروم عجل ناعم", nameEn: "Beef Minced 3mm", description: "لحم عجل مفروم ناعم", price: 44, image: "/src/assets/products/beef-minced.png", category: "beef" },
  { id: "beef-5", name: "لحم مفروم (10)", nameEn: "Mix Minced Meat 10mm", description: "لحم مفروم مشكل خشن", price: 44, image: "/src/assets/products/beef-minced.png", category: "beef" },
  { id: "beef-6", name: "لحم مفروم ناعم (3)", nameEn: "Mix Minced Meat 3mm", description: "لحم مفروم مشكل ناعم", price: 44, image: "/src/assets/products/beef-minced.png", category: "beef" },
  { id: "beef-7", name: "ستيك عجل بدون دهن", nameEn: "Beef Steak w/o Fat", description: "ستيك عجل قليل الدهون", price: 75, image: "/src/assets/products/beef-steaks-fresh.jpg", category: "beef" },
  { id: "beef-8", name: "اصابع عجل", nameEn: "Beef Straganoff", description: "لحم عجل مقطع اصابع", price: 46, image: beefStroganoff, category: "beef" },
  { id: "beef-9", name: "بسمشكات عجل", nameEn: "Beef Basmashkat", description: "بسمشكات عجل", price: 75, image: "/src/assets/products/ribeye-steak.png", category: "beef" },
  { id: "beef-10", name: "موزات عجل بدون عظم", nameEn: "Beef Shank Boneless", description: "موزات عجل منزوعة العظم", price: 52, image: "/src/assets/products/beef-shank-boneless.png", category: "beef" },
  { id: "beef-11", name: "فيلية عجل", nameEn: "Beef Fillet", description: "فيلية عجل فاخرة", price: 94, image: "/src/assets/products/beef-fillet.png", category: "beef", isNew: true },
  { id: "beef-16", name: "تندرليون عجل", nameEn: "Beef Tenderloin", description: "تندرليون عجل فاخر طازج", price: 110, image: beefTenderloin, category: "beef", isNew: true },
  { id: "beef-12", name: "هبرة عجل", nameEn: "Beef Habra", description: "هبرة عجل طازجة", price: 50, image: "/src/assets/products/beef-cubes.png", category: "beef" },
  { id: "beef-13", name: "روستو عجل", nameEn: "Beef Rosto", description: "روستو عجل للفرن", price: 55, image: "/src/assets/products/beef-brisket.png", category: "beef" },
  { id: "beef-14", name: "عالسكين عجل", nameEn: "Beef Knife Minced", description: "لحم عجل مفروم بالسكين", price: 45, image: "/src/assets/products/beef-minced.png", category: "beef" },
  { id: "beef-15", name: "مفروم واغيو", nameEn: "Wagyu Minced", description: "لحم واغيو مفروم", price: 74, image: "/src/assets/products/wagyu-ribeye.png", category: "beef", isNew: true },
];

// Local Veal Meat - لحم عجل محلي هولندي
export const localVealProducts: Product[] = [
  { id: "veal-1", name: "لحم عجل هولندي محلي بالعظم", nameEn: "Veal Meat with Bones Holland", description: "لحم عجل هولندي بالعظم", price: 46, image: "/src/assets/products/lamb-with-bones.png", category: "local-veal" },
  { id: "veal-2", name: "لحم عجل هولندي محلي بدون عظم", nameEn: "Veal Meat Boneless Holland", description: "لحم عجل هولندي بدون عظم", price: 66, image: "/src/assets/products/beef-cubes.png", category: "local-veal" },
  { id: "veal-3", name: "ريش عجل هولندي محلي", nameEn: "Veal Chops Holland", description: "ريش عجل هولندي فاخرة", price: 86, image: "/src/assets/products/lamb-chops.png", category: "local-veal", isNew: true },
  { id: "veal-4", name: "فيلية عجل هولندي محلي", nameEn: "Veal Fillet Holland", description: "فيلية عجل هولندي فاخرة", price: 100, image: "/src/assets/products/beef-fillet.png", category: "local-veal" },
  { id: "veal-5", name: "ستيك عجل هولندي محلي", nameEn: "Veal Steak Holland", description: "ستيك عجل هولندي", price: 78, image: "/src/assets/products/ribeye-steak.png", category: "local-veal" },
  { id: "veal-6", name: "تي بون عجل هولندي محلي", nameEn: "Veal T Bone Steak Holland", description: "تي بون عجل هولندي", price: 84, image: "/src/assets/products/tbone-steak.png", category: "local-veal" },
  { id: "veal-7", name: "اوسوبوكو عجل هولندي محلي", nameEn: "Veal Osso Bucco Holland", description: "اوسوبوكو عجل هولندي", price: 68, image: "/src/assets/products/oxtail.png", category: "local-veal" },
  { id: "veal-8", name: "رامب ستيك عجل هولندي محلي", nameEn: "Veal Rump Steak Holland", description: "رامب ستيك عجل هولندي", price: 78, image: "/src/assets/products/rump-steak.png", category: "local-veal" },
  { id: "veal-9", name: "روستو عجل هولندي محلي", nameEn: "Veal Rosto Holland", description: "روستو عجل هولندي", price: 70, image: "/src/assets/products/beef-brisket.png", category: "local-veal" },
  { id: "veal-10", name: "ستيك توب سايد عجل هولندي محلي", nameEn: "Veal Top Side Steak Holland", description: "ستيك توب سايد هولندي", price: 72, image: "/src/assets/products/striploin-steak.png", category: "local-veal" },
  { id: "veal-11", name: "فلانك ستيك عجل هولندي محلي", nameEn: "Veal Flank Steak Holland", description: "فلانك ستيك هولندي", price: 72, image: "/src/assets/products/striploin-steak.png", category: "local-veal" },
  { id: "veal-12", name: "موزات عجل هولندي محلي بدون عظم", nameEn: "Veal Shank Boneless Holland", description: "موزات عجل هولندي بدون عظم", price: 68, image: "/src/assets/products/beef-shank-boneless.png", category: "local-veal" },
  { id: "veal-13", name: "موزات عجل هولندي محلي بعظم", nameEn: "Veal Shank w/ Bone Holland", description: "موزات عجل هولندي بالعظم", price: 68, image: "/src/assets/products/lamb-shank-bone.png", category: "local-veal" },
  { id: "veal-14", name: "بريسكت عجل هولندي محلي", nameEn: "Veal Brisket Holland", description: "بريسكت عجل هولندي", price: 46, image: "/src/assets/products/beef-brisket.png", category: "local-veal" },
  { id: "veal-15", name: "لحم عجل هولندي مفروم ناعم", nameEn: "Veal Holland Minced 3MM", description: "مفروم عجل هولندي ناعم", price: 59, image: "/src/assets/products/beef-minced.png", category: "local-veal" },
  { id: "veal-16", name: "لحم عجل هولندي مفروم خشن", nameEn: "Veal Holland Minced 10MM", description: "مفروم عجل هولندي خشن", price: 59, image: "/src/assets/products/beef-minced.png", category: "local-veal" },
  { id: "veal-17", name: "برغر عجل هولندي محلي", nameEn: "Veal Burger Holland", description: "برغر عجل هولندي", price: 59, image: "/src/assets/products/burger-patties.png", category: "local-veal" },
  { id: "veal-18", name: "مفروم عالسكين هولندي", nameEn: "Veal Knife Minced", description: "مفروم عجل هولندي بالسكين", price: 66, image: "/src/assets/products/beef-minced.png", category: "local-veal" },
];

// Steak and Chops - ستيك وقطعيات
export const steakProducts: Product[] = [
  { id: "steak-1", name: "ريب اي عجل استرالي (تغذية حبوب)", nameEn: "Beef Rib Eye (Grain Fed)", description: "ريب آي استرالي تغذية حبوب", price: 115, image: "/src/assets/products/ribeye-steak.png", category: "steak" },
  { id: "steak-2", name: "ريب اي عجل استرالي (تغذية مرعى)", nameEn: "Beef Rib Eye (Grass Fed)", description: "ريب آي استرالي تغذية مرعى", price: 100, image: "/src/assets/products/ribeye-steak.png", category: "steak" },
  { id: "steak-3", name: "ريب اي عجل نيوزلندي", nameEn: "Beef Rib Eye New Zealand", description: "ريب آي نيوزلندي فاخر", price: 100, image: "/src/assets/products/ribeye-steak.png", category: "steak" },
  { id: "steak-4", name: "ريب اي واغيو استرالي", nameEn: "Wagyu Beef Rib Eye", description: "ريب آي واغيو استرالي", price: 179, image: "/src/assets/products/wagyu-ribeye.png", category: "steak", isNew: true },
  { id: "steak-5", name: "ريب اي انجوس استرالي", nameEn: "Angus Beef Rib Eye", description: "ريب آي انجوس استرالي", price: 136, image: "/src/assets/products/ribeye-steak.png", category: "steak" },
  { id: "steak-6", name: "فيلية انجوس استرالي", nameEn: "Beef Angus Fillet", description: "فيلية انجوس استرالي", price: 168, image: "/src/assets/products/beef-fillet.png", category: "steak" },
  { id: "steak-7", name: "شورت ربس انجوس استرالي", nameEn: "Angus Beef Short Ribs", description: "شورت ربس انجوس", price: 89, image: beefShortRibs, category: "steak" },
  { id: "steak-8", name: "بريسكت انجوس استرالي", nameEn: "Angus Beef Brisket", description: "بريسكت انجوس استرالي", price: 60, image: "/src/assets/products/beef-brisket.png", category: "steak" },
  { id: "steak-9", name: "ستربلوين عجل استرالي", nameEn: "Beef Striploin", description: "ستربلوين استرالي فاخر", price: 75, image: striploinSteakFresh, category: "steak" },
  { id: "steak-10", name: "توما هوك عجل استرالي", nameEn: "Beef Tomahawk", description: "توماهوك ستيك فاخر", price: 175, image: "/src/assets/products/tomahawk-steak.png", category: "steak", isNew: true },
  { id: "steak-11", name: "فيلية بقر نيوزلندي", nameEn: "Beef Fillet New Zealand", description: "فيلية بقر نيوزلندي", price: 130, image: "/src/assets/products/beef-fillet.png", category: "steak" },
  { id: "steak-12", name: "واغيو ريب أي (4-5)", nameEn: "Wagyu Rib Eye 4-5", description: "واغيو ريب آي درجة 4-5", price: 289, image: "/src/assets/products/wagyu-ribeye.png", category: "steak" },
  { id: "steak-13", name: "واغيو ريب أي (6-7)", nameEn: "Wagyu Rib Eye 6-7", description: "واغيو ريب آي درجة 6-7", price: 348, image: "/src/assets/products/wagyu-ribeye.png", category: "steak" },
  { id: "steak-14", name: "واغيو ريب أي (7-8)", nameEn: "Wagyu Rib Eye 7-8", description: "واغيو ريب آي درجة 7-8", price: 419, image: "/src/assets/products/wagyu-ribeye.png", category: "steak" },
  { id: "steak-15", name: "واغيو ريب أي (+9)", nameEn: "Wagyu Rib Eye 9+", description: "واغيو ريب آي درجة +9", price: 680, image: "/src/assets/products/wagyu-ribeye.png", category: "steak" },
  { id: "steak-16", name: "واغيو ستربلوين (7-8)", nameEn: "Wagyu Striploin 7-8", description: "واغيو ستربلوين درجة 7-8", price: 380, image: "/src/assets/products/striploin-steak.png", category: "steak" },
  { id: "steak-17", name: "بلاك انجوس ستربلوين", nameEn: "Black Angus Striploin", description: "بلاك انجوس ستربلوين", price: 149, image: "/src/assets/products/striploin-steak.png", category: "steak" },
  { id: "steak-18", name: "بلاك انجوس توما هوك", nameEn: "Black Angus Tomahawk", description: "بلاك انجوس توماهوك", price: 225, image: "/src/assets/products/tomahawk-steak.png", category: "steak" },
  { id: "steak-19", name: "بلاك انجوس تندرلوين", nameEn: "Black Angus Tenderloin", description: "بلاك انجوس تندرلوين", price: 300, image: "/src/assets/products/beef-fillet.png", category: "steak" },
  { id: "steak-20", name: "واغيو توماهوك", nameEn: "Wagyu Tomahawk", description: "واغيو توماهوك فاخر", price: 240, image: "/src/assets/products/tomahawk-steak.png", category: "steak" },
  { id: "steak-21", name: "شورت ربس واغيو", nameEn: "Wagyu Short Ribs", description: "شورت ربس واغيو", price: 115, image: "/src/assets/products/short-ribs.png", category: "steak" },
  { id: "steak-22", name: "بريسكت واغيو", nameEn: "Wagyu Brisket", description: "بريسكت واغيو", price: 115, image: "/src/assets/products/beef-brisket.png", category: "steak" },
  { id: "steak-23", name: "تي بون عجل", nameEn: "Beef T Bone Steak", description: "تي بون ستيك عجل", price: 199, image: "/src/assets/products/tbone-steak.png", category: "steak" },
];

// Marinated Meat - لحوم متبلة
export const marinatedProducts: Product[] = [
  { id: "mar-1", name: "كفتة لحم", nameEn: "Meat Kafta", description: "كفتة لحم متبلة", price: 44, image: "/src/assets/products/kofta-meat.png", category: "marinated" },
  { id: "mar-2", name: "كفتة عجل", nameEn: "Beef Kafta", description: "كفتة عجل متبلة", price: 44, image: "/src/assets/products/kofta-meat.png", category: "marinated" },
  { id: "mar-3", name: "كفتة عجل هولندي محلي", nameEn: "Veal Kofta Holland", description: "كفتة عجل هولندي", price: 59, image: "/src/assets/products/kofta-meat.png", category: "marinated" },
  { id: "mar-4", name: "كفتة غنم", nameEn: "Lamb Kofta", description: "كفتة غنم متبلة", price: 69, image: "/src/assets/products/kofta-meat.png", category: "marinated" },
  { id: "mar-5", name: "كباب لحم", nameEn: "Meat Kabab", description: "كباب لحم شامي", price: 44, image: "/src/assets/products/kabab-skewers.png", category: "marinated" },
  { id: "mar-6", name: "كباب هندي", nameEn: "Indian Kabab", description: "كباب هندي متبل", price: 44, image: "/src/assets/products/kabab-skewers.png", category: "marinated" },
  { id: "mar-7", name: "كباب عراقي", nameEn: "Iraqi Kabab", description: "كباب عراقي أصيل", price: 46, image: "/src/assets/products/kabab-skewers.png", category: "marinated" },
  { id: "mar-8", name: "كباب هولندي", nameEn: "Holland Veal Kabab", description: "كباب عجل هولندي", price: 59, image: "/src/assets/products/kabab-skewers.png", category: "marinated" },
  { id: "mar-9", name: "كباب هندي غنم", nameEn: "Indian Lamb Kabab", description: "كباب هندي غنم", price: 68, image: "/src/assets/products/kabab-skewers.png", category: "marinated" },
  { id: "mar-10", name: "كباب غنم", nameEn: "Lamb Kabab", description: "كباب غنم شامي", price: 69, image: "/src/assets/products/kabab-skewers.png", category: "marinated" },
  { id: "mar-11", name: "عرايس لحم", nameEn: "Meat Arayes", description: "عرايس لحم جاهزة", price: 52, image: "/src/assets/products/kofta-meat.png", category: "marinated" },
  { id: "mar-12", name: "تكا غنم", nameEn: "Lamb Tekka", description: "تكا غنم متبلة", price: 69, image: "/src/assets/products/tikka-meat.png", category: "marinated" },
  { id: "mar-13", name: "تكا فتايل غنم", nameEn: "Lamb Fuse Tekka", description: "تكا فتايل غنم", price: 86, image: "/src/assets/products/tikka-meat.png", category: "marinated" },
  { id: "mar-14", name: "ريش غنم متبلة", nameEn: "Marinated Lamb Chops", description: "ريش غنم متبلة جاهزة", price: 93, image: "/src/assets/products/lamb-chops.png", category: "marinated", isNew: true },
  { id: "mar-15", name: "برغر لحم", nameEn: "Meat Burger", description: "برغر لحم طازج", price: 44, image: "/src/assets/products/burger-patties.png", category: "marinated" },
  { id: "mar-16", name: "برغر امريكي", nameEn: "American Burger", description: "برغر امريكي فاخر", price: 50, image: "/src/assets/products/burger-patties.png", category: "marinated" },
  { id: "mar-17", name: "برغر واغيو", nameEn: "Wagyu Burger", description: "برغر واغيو فاخر", price: 74, image: "/src/assets/products/burger-patties.png", category: "marinated" },
  { id: "mar-18", name: "سجق لحم", nameEn: "Sausage", description: "سجق لحم شامي", price: 44, image: "/src/assets/products/meat-sausage.png", category: "marinated" },
  { id: "mar-19", name: "نقانق لحم", nameEn: "Makanek", description: "نقانق لحم لبناني", price: 44, image: "/src/assets/products/meat-sausage.png", category: "marinated" },
  { id: "mar-20", name: "كرات لحم", nameEn: "Meat Ball", description: "كرات لحم متبلة", price: 44, image: "/src/assets/products/kofta-meat.png", category: "marinated" },
  { id: "mar-21", name: "داوود باشا", nameEn: "Dawood Basha Mix", description: "داوود باشا مشكل", price: 44, image: trayDawoodBasha, category: "marinated" },
  { id: "mar-22", name: "داوود باشا غنم", nameEn: "Dawood Basha LAMB", description: "داوود باشا غنم", price: 68, image: trayDawoodBasha, category: "marinated" },
  { id: "mar-23", name: "فاهيتا لحم", nameEn: "Meat Fahita", description: "فاهيتا لحم متبلة", price: 45, image: "/src/assets/products/beef-cubes.png", category: "marinated" },
  { id: "mar-24", name: "شاورما لحم", nameEn: "Meat Shawarma", description: "شاورما لحم جاهزة", price: 45, image: "/src/assets/products/tikka-meat.png", category: "marinated" },
  { id: "mar-25", name: "اسكالوب لحم", nameEn: "Beef Escalope", description: "اسكالوب لحم بقري", price: 55, image: "/src/assets/products/striploin-steak.png", category: "marinated" },
  { id: "mar-26", name: "لحم عجين مع خضار", nameEn: "Meat Ajeen w/ Vegetables", description: "لحم عجين مع خضار", price: 54, image: "/src/assets/products/beef-minced.png", category: "marinated" },
  { id: "mar-27", name: "لحم عجين مع دبس رمان", nameEn: "Meat Ajeen w/ Pomegranate", description: "لحم عجين مع دبس رمان", price: 54, image: "/src/assets/products/beef-minced.png", category: "marinated" },
  { id: "mar-28", name: "لحم بالصحن", nameEn: "Bilsahen Meat", description: "لحم بالصحن جاهز", price: 44, image: "/src/assets/products/beef-minced.png", category: "marinated" },
  { id: "mar-29", name: "عجينة كبة", nameEn: "Agenna Kebba", description: "عجينة كبة جاهزة", price: 30, image: "/src/assets/products/kibbeh.png", category: "marinated" },
  { id: "mar-30", name: "كبة على السيخ", nameEn: "Grilled Kebba", description: "كبة مشوية على السيخ", price: 44, image: "/src/assets/products/kibbeh.png", category: "marinated" },
  { id: "mar-31", name: "كفتة جبن", nameEn: "Cheese Kafta", description: "كفتة محشية جبن", price: 55, image: "/src/assets/products/kofta-meat.png", category: "marinated" },
];

// Marinated Skewers - لحوم متبلة جاهزة للشوي مشاكيك
export const skewersProducts: Product[] = [
  { id: "skew-1", name: "كباب دجاج مشكوك", nameEn: "Chicken Kabab Skewers", description: "كباب دجاج على أسياخ", price: 41, image: "/src/assets/products/shish-tawook.png", category: "skewers" },
  { id: "skew-2", name: "كباب مشكوك", nameEn: "Kabab Skewers", description: "كباب لحم على أسياخ", price: 46, image: "/src/assets/products/kabab-skewers.png", category: "skewers" },
  { id: "skew-3", name: "كباب عجل مشكوك", nameEn: "Beef Kabab Skewers", description: "كباب عجل على أسياخ", price: 46, image: "/src/assets/products/kabab-skewers.png", category: "skewers" },
  { id: "skew-4", name: "كباب هندي مشكوك", nameEn: "Indian Kabab Skewers", description: "كباب هندي على أسياخ", price: 46, image: "/src/assets/products/kabab-skewers.png", category: "skewers" },
  { id: "skew-5", name: "كباب باذنجان مشكوك", nameEn: "Eggplant Kabab Skewers", description: "كباب مع باذنجان", price: 46, image: "/src/assets/products/kabab-skewers.png", category: "skewers" },
  { id: "skew-6", name: "كباب عراقي مشكوك", nameEn: "Iraqi Kabab Skewers", description: "كباب عراقي على أسياخ", price: 49, image: "/src/assets/products/kabab-skewers.png", category: "skewers" },
  { id: "skew-7", name: "كباب بتلو مشكوك", nameEn: "Veal Kabab Skewers", description: "كباب عجل بتلو", price: 62, image: "/src/assets/products/kabab-skewers.png", category: "skewers" },
  { id: "skew-8", name: "كباب غنم مشكوك", nameEn: "Lamb Kabab Skewers", description: "كباب غنم على أسياخ", price: 73, image: "/src/assets/products/kabab-skewers.png", category: "skewers" },
  { id: "skew-9", name: "تكا عجل مشكوك", nameEn: "Beef Tekka Skewers", description: "تكا عجل على أسياخ", price: 48, image: "/src/assets/products/tikka-meat.png", category: "skewers" },
  { id: "skew-10", name: "تكا غنم مشكوك", nameEn: "Lamb Tekka Skewers", description: "تكا غنم على أسياخ", price: 73, image: "/src/assets/products/tikka-meat.png", category: "skewers" },
  { id: "skew-11", name: "تكا سوشي", nameEn: "Sushi Tekka", description: "تكا ستايل سوشي", price: 73, image: "/src/assets/products/sushi-tekka.jpg", category: "skewers" },
  { id: "skew-12", name: "تكا فتايل غنم مشكوك", nameEn: "Lamb Fuse Tekka Skewers", description: "تكا فتايل غنم", price: 89, image: "/src/assets/products/tikka-meat.png", category: "skewers" },
  { id: "skew-13", name: "شيش طاووق مشكوك", nameEn: "Shish Tawook Garlic Skewers", description: "شيش طاووق بالثوم", price: 41, image: shishTawookGarlic, category: "skewers" },
  { id: "skew-14", name: "شيش طاووق بالليمون مشكوك", nameEn: "Shish Tawook w/Lemon Skewers", description: "شيش طاووق بالليمون", price: 41, image: shishTawookLemon, category: "skewers" },
  { id: "skew-15", name: "شيش طاووق بالروب مشكوك", nameEn: "Shish Tawook w/Yoghurt Skewers", description: "شيش طاووق بالزبادي", price: 41, image: shishTawookYogurt, category: "skewers" },
  { id: "skew-16", name: "سجق لحم مشكوك", nameEn: "Sausage Skewers", description: "سجق لحم على أسياخ", price: 46, image: "/src/assets/products/meat-sausage.png", category: "skewers" },
  { id: "skew-17", name: "نقانق لحم مشكوك", nameEn: "Makanek Skewers", description: "نقانق على أسياخ", price: 46, image: "/src/assets/products/meat-sausage.png", category: "skewers" },
  { id: "skew-18", name: "نقانق دجاج مشكوك", nameEn: "Chicken Sausage Skewers", description: "نقانق دجاج على أسياخ", price: 41, image: "/src/assets/products/meat-sausage.png", category: "skewers" },
  { id: "skew-19", name: "تكا غنم مشكوك", nameEn: "Lamb Tikka Skewers", description: "تكا غنم على أسياخ خشبية", price: 75, image: lambTikkaSkewers, category: "skewers", isNew: true },
  { id: "skew-20", name: "تكة لحم متبلة بوكس", nameEn: "Marinated Meat Tikka Box", description: "بوكس تكة لحم متبلة جاهزة للشوي", price: 85, image: tikkaMeatMarinatedBox, category: "skewers", isNew: true },
  { id: "skew-21", name: "تكة لحم بوكس", nameEn: "Meat Tikka Box", description: "بوكس تكة لحم طازجة على أسياخ", price: 80, image: tikkaMeatBox, category: "skewers", isNew: true },
  { id: "skew-22", name: "شيش طاووق خلطة تركية", nameEn: "Turkish Shish Tawook Skewers", description: "شيش طاووق بتتبيلة تركية مميزة", price: 45, image: shishTawookTurkish, category: "skewers", isNew: true },
  { id: "skew-23", name: "شورت ربس متبل", nameEn: "Marinated Short Ribs", description: "شورت ربس متبل جاهز للشوي", price: 95, image: shortRibsMarinated, category: "skewers", isNew: true },
];

// Chicken - دجاج
export const chickenProducts: Product[] = [
  { id: "chk-1", name: "صدور دجاج", nameEn: "Chicken Breast", description: "صدور دجاج طازجة", price: 37, image: "/src/assets/products/chicken-pieces.png", category: "chicken" },
  { id: "chk-2", name: "صدور دجاج فراشة", nameEn: "Butterfly Chicken Breast", description: "صدور دجاج مفتوحة", price: 39, image: "/src/assets/products/chicken-pieces.png", category: "chicken" },
  { id: "chk-3", name: "أوراك دجاج", nameEn: "Chicken Thighs", description: "أوراك دجاج طازجة", price: 29, image: "/src/assets/products/chicken-drumsticks.png", category: "chicken" },
  { id: "chk-4", name: "أفخاذ دجاج", nameEn: "Chicken Drumsticks", description: "أفخاذ دجاج طازجة", price: 29, image: chickenDrumsticksFresh, category: "chicken" },
  { id: "chk-5", name: "اجنحة دجاج", nameEn: "Chicken Wings", description: "أجنحة دجاج طازجة", price: 26, image: chickenWingsFresh, category: "chicken" },
  { id: "chk-17", name: "جوانح دجاج متبلة للشوي", nameEn: "Marinated Chicken Wings", description: "جوانح دجاج متبلة جاهزة للشوي", price: 32, image: chickenWingsMarinated, category: "chicken", isNew: true },
  { id: "chk-18", name: "درم ستيك دجاج متبل", nameEn: "Marinated Drumsticks", description: "درم ستيك دجاج متبل جاهز للشوي", price: 35, image: chickenDrumsticksMarinated, category: "chicken", isNew: true },
  { id: "chk-19", name: "دجاجة متبلة للفرن", nameEn: "Marinated Whole Chicken", description: "دجاجة كاملة متبلة جاهزة للفرن", price: 40, image: wholeChickenMarinated, category: "chicken", isNew: true },
  { id: "chk-6", name: "شيش طاووق بالثوم", nameEn: "Shish Tawook Garlic", description: "شيش طاووق متبل بالثوم", price: 39, image: shishTawookGarlic, category: "chicken" },
  { id: "chk-7", name: "شيش طاووق بالليمون", nameEn: "Shish Tawook Lemon", description: "شيش طاووق متبل بالليمون", price: 39, image: shishTawookLemon, category: "chicken" },
  { id: "chk-8", name: "شيش طاووق بالروب", nameEn: "Shish Tawook Yoghurt", description: "شيش طاووق متبل بالزبادي", price: 39, image: shishTawookYogurt, category: "chicken" },
  { id: "chk-21", name: "شيش طاووق خلطة تركية", nameEn: "Turkish Shish Tawook", description: "شيش طاووق بتتبيلة تركية", price: 42, image: shishTawookTurkish, category: "chicken", isNew: true },
  { id: "chk-9", name: "شاورما دجاج", nameEn: "Chicken Shawarma", description: "شاورما دجاج جاهزة", price: 39, image: shishTawookGarlic, category: "chicken" },
  { id: "chk-10", name: "فاهيتا دجاج", nameEn: "Chicken Fahita", description: "فاهيتا دجاج متبلة", price: 39, image: "/src/assets/products/chicken-fajita.jpg", category: "chicken" },
  { id: "chk-15", name: "دجاجة كاملة", nameEn: "Whole Chicken", description: "دجاجة كاملة طازجة", price: 25, image: "/src/assets/products/whole-chicken.jpg", category: "chicken" },
  { id: "chk-11", name: "كباب دجاج", nameEn: "Chicken Kabab", description: "كباب دجاج متبل", price: 39, image: "/src/assets/products/kofta-meat.png", category: "chicken" },
  { id: "chk-12", name: "برغر دجاج", nameEn: "Chicken Burger", description: "برغر دجاج طازج", price: 39, image: "/src/assets/products/burger-patties.png", category: "chicken" },
  { id: "chk-13", name: "اسكالوب دجاج", nameEn: "Chicken Escalope", description: "اسكالوب دجاج بانيه", price: 39, image: "/src/assets/products/chicken-pieces.png", category: "chicken" },
  { id: "chk-14", name: "مفروم دجاج", nameEn: "Minced Chicken", description: "دجاج مفروم طازج", price: 37, image: "/src/assets/products/beef-minced.png", category: "chicken" },
  { id: "chk-16", name: "أصابع دجاج", nameEn: "Chicken Strips", description: "أصابع دجاج طازجة مقطعة شرائح", price: 40, image: chickenStripsFresh, category: "chicken", isNew: true },
  { id: "chk-20", name: "رأس عصفور دجاج", nameEn: "Chicken Cubes", description: "قطع دجاج صغيرة للطبخ السريع", price: 38, image: chickenCubesFresh, category: "chicken", isNew: true },
];

// Ready to Cook - جاهز للطهي
import trayWings from "@/assets/products/tray-wings.jpg";
import trayChicken from "@/assets/products/tray-chicken.jpg";
import trayLambChops from "@/assets/products/tray-lamb-chops.jpg";
import traySausage from "@/assets/products/tray-sausage.jpg";
import trayShishTawookCream from "@/assets/products/tray-shish-tawook-cream.jpg";
import trayShishTawookSpicy from "@/assets/products/tray-shish-tawook-spicy.jpg";
import trayShishTawookOnion from "@/assets/products/tray-shish-tawook-onion.jpg";
import trayChickenFajita from "@/assets/products/tray-chicken-fajita.jpg";
import trayChickenThigh from "@/assets/products/tray-chicken-thigh.jpg";
import trayChickenDrumsticks from "@/assets/products/tray-chicken-drumsticks.jpg";
import trayKibbeh from "@/assets/products/tray-kibbeh.jpg";
import trayKibbehPotato from "@/assets/products/tray-kibbeh-potato.jpg";
import trayChickenBreast from "@/assets/products/tray-chicken-breast.jpg";
import trayChickenPieces from "@/assets/products/tray-chicken-pieces.jpg";
import trayKaftaTomato from "@/assets/products/tray-kafta-tomato.jpg";
import trayKaftaEggplant from "@/assets/products/tray-kafta-eggplant.jpg";
import trayKaftaPeppers from "@/assets/products/tray-kafta-peppers.jpg";
import trayKaftaCherry from "@/assets/products/tray-kafta-cherry.jpg";
import trayMakanek from "@/assets/products/tray-makanek.jpg";

export const readyToCookProducts: Product[] = [
  { id: "rtc-1", name: "صينية كفتة بالبندورة", nameEn: "Kafta Tray w/ Tomato", description: "صينية كفتة جاهزة للفرن", price: 55, image: trayKaftaTomato, category: "ready-to-cook" },
  { id: "rtc-2", name: "صينية كفتة بالطحينة", nameEn: "Kafta Tray w/ Tahini", description: "صينية كفتة بالطحينة", price: 55, image: trayKaftaPeppers, category: "ready-to-cook" },
  { id: "rtc-3", name: "صينية كبة بالصينية", nameEn: "Kebba Tray", description: "صينية كبة جاهزة للفرن", price: 55, image: trayKibbeh, category: "ready-to-cook" },
  { id: "rtc-4", name: "صينية كبة لبنية", nameEn: "Kebba w/ Yoghurt Tray", description: "كبة باللبن جاهزة", price: 55, image: "/src/assets/products/kibbeh.png", category: "ready-to-cook" },
  { id: "rtc-5", name: "ورق عنب باللحم", nameEn: "Stuffed Grape Leaves w/ Meat", description: "ورق عنب محشي باللحم", price: 60, image: "/src/assets/products/lamb-cubes.png", category: "ready-to-cook" },
  { id: "rtc-6", name: "كوسا محشي", nameEn: "Stuffed Zucchini", description: "كوسا محشية باللحم", price: 55, image: "/src/assets/products/lamb-cubes.png", category: "ready-to-cook" },
  { id: "rtc-7", name: "باذنجان محشي", nameEn: "Stuffed Eggplant", description: "باذنجان محشي باللحم", price: 55, image: "/src/assets/products/lamb-cubes.png", category: "ready-to-cook" },
  { id: "rtc-8", name: "فلفل محشي", nameEn: "Stuffed Bell Pepper", description: "فلفل محشي باللحم", price: 55, image: "/src/assets/products/lamb-cubes.png", category: "ready-to-cook" },
  { id: "rtc-9", name: "ملفوف محشي", nameEn: "Stuffed Cabbage", description: "ملفوف محشي باللحم", price: 55, image: "/src/assets/products/lamb-cubes.png", category: "ready-to-cook" },
  { id: "rtc-10", name: "صينية جوانح دجاج", nameEn: "Chicken Wings Tray", description: "صينية جوانح دجاج متبلة جاهزة للطهي", price: 65, image: trayWings, category: "ready-to-cook", isNew: true },
  { id: "rtc-11", name: "صينية دجاج متبل", nameEn: "Marinated Chicken Tray", description: "صينية دجاج متبل جاهزة للفرن", price: 60, image: trayChicken, category: "ready-to-cook", isNew: true },
  { id: "rtc-12", name: "صينية ريش غنم", nameEn: "Lamb Chops Tray", description: "صينية ريش غنم متبلة جاهزة للفرن", price: 95, image: trayLambChops, category: "ready-to-cook", isNew: true },
  { id: "rtc-13", name: "صينية سجق بالخضار", nameEn: "Sausage with Vegetables Tray", description: "صينية سجق مع الخضار جاهزة للفرن", price: 55, image: traySausage, category: "ready-to-cook", isNew: true },
  { id: "rtc-14", name: "صينية شيش طاووق بالكريمة", nameEn: "Shish Tawook Cream Tray", description: "صينية شيش طاووق بالكريمة والبطاطس", price: 55, image: trayShishTawookCream, category: "ready-to-cook", isNew: true },
  { id: "rtc-15", name: "صينية شيش طاووق بالبهارات", nameEn: "Spicy Shish Tawook Tray", description: "صينية شيش طاووق متبل بالبهارات", price: 55, image: trayShishTawookSpicy, category: "ready-to-cook", isNew: true },
  { id: "rtc-16", name: "صينية شيش طاووق بالبصل", nameEn: "Shish Tawook with Onion Tray", description: "صينية شيش طاووق مع البصل جاهزة للفرن", price: 55, image: trayShishTawookOnion, category: "ready-to-cook", isNew: true },
  { id: "rtc-17", name: "صينية فاهيتا دجاج", nameEn: "Chicken Fajita Tray", description: "صينية فاهيتا دجاج مع الخضار الملونة", price: 60, image: trayChickenFajita, category: "ready-to-cook", isNew: true },
  { id: "rtc-18", name: "صينية أفخاذ دجاج متبلة", nameEn: "Marinated Chicken Thigh Tray", description: "صينية أفخاذ دجاج متبلة مع الخضار", price: 55, image: trayChickenThigh, category: "ready-to-cook", isNew: true },
  { id: "rtc-19", name: "صينية دبابيس دجاج", nameEn: "Chicken Drumsticks Tray", description: "صينية دبابيس دجاج متبلة جاهزة للفرن", price: 55, image: trayChickenDrumsticks, category: "ready-to-cook", isNew: true },
  { id: "rtc-20", name: "صينية كبة بالبطاطا", nameEn: "Potato Kibbeh Tray", description: "صينية كبة البطاطا جاهزة للفرن", price: 50, image: trayKibbehPotato, category: "ready-to-cook", isNew: true },
  { id: "rtc-21", name: "صينية صدور دجاج متبلة", nameEn: "Marinated Chicken Breast Tray", description: "صينية صدور دجاج متبلة مع الفلفل الملون", price: 60, image: trayChickenBreast, category: "ready-to-cook", isNew: true },
  { id: "rtc-22", name: "صينية قطع دجاج بالبطاطس", nameEn: "Chicken Pieces with Potato Tray", description: "صينية قطع دجاج متبلة مع البطاطس", price: 55, image: trayChickenPieces, category: "ready-to-cook", isNew: true },
  { id: "rtc-23", name: "صينية كفتة بالباذنجان", nameEn: "Kafta with Eggplant Tray", description: "صينية كفتة مع شرائح الباذنجان والبطاطس", price: 60, image: trayKaftaEggplant, category: "ready-to-cook", isNew: true },
  { id: "rtc-24", name: "صينية كفتة بالطماطم الكرزية", nameEn: "Kafta with Cherry Tomato Tray", description: "صينية كفتة مع الطماطم الكرزية", price: 55, image: trayKaftaCherry, category: "ready-to-cook", isNew: true },
  { id: "rtc-25", name: "صينية نقانق لحم", nameEn: "Makanek Meat Tray", description: "صينية نقانق لحم مع الخضار جاهزة للفرن", price: 55, image: trayMakanek, category: "ready-to-cook", isNew: true },
];

// Frozen Ready - مفرزنات
export const frozenProducts: Product[] = [
  { id: "frz-1", name: "سمبوسك لحم", nameEn: "Meat Sambousa", description: "سمبوسك لحم مفرزة", price: 45, image: "/src/assets/products/sambousa.png", category: "frozen" },
  { id: "frz-2", name: "سمبوسك جبن", nameEn: "Cheese Sambousa", description: "سمبوسك جبن مفرزة", price: 45, image: "/src/assets/products/sambousa.png", category: "frozen" },
  { id: "frz-3", name: "كبة مقلية", nameEn: "Fried Kebba", description: "كبة مقلية مفرزة", price: 55, image: "/src/assets/products/kibbeh.png", category: "frozen" },
  { id: "frz-4", name: "رول لحم", nameEn: "Meat Roll", description: "رولات لحم مفرزة", price: 50, image: "/src/assets/products/sambousa.png", category: "frozen" },
  { id: "frz-5", name: "رول جبن", nameEn: "Cheese Roll", description: "رولات جبن مفرزة", price: 50, image: "/src/assets/products/sambousa.png", category: "frozen" },
  { id: "frz-6", name: "فطاير لحم", nameEn: "Meat Fatayer", description: "فطاير لحم مفرزة", price: 45, image: "/src/assets/products/sambousa.png", category: "frozen" },
  { id: "frz-7", name: "فطاير جبن", nameEn: "Cheese Fatayer", description: "فطاير جبن مفرزة", price: 45, image: "/src/assets/products/sambousa.png", category: "frozen" },
  { id: "frz-8", name: "فطاير سبانخ", nameEn: "Spinach Fatayer", description: "فطاير سبانخ مفرزة", price: 40, image: "/src/assets/products/sambousa.png", category: "frozen" },
];

// Raw Meat - لحوم نية
export const rawMeatProducts: Product[] = [
  { id: "raw-1", name: "كبة نية", nameEn: "Raw Kebba", description: "كبة نية طازجة", price: 69, image: "/src/assets/products/tikka-meat.png", category: "raw-meat" },
  { id: "raw-2", name: "كفتة نية", nameEn: "Raw Kafta", description: "كفتة نية طازجة", price: 55, image: "/src/assets/products/beef-minced.png", category: "raw-meat" },
  { id: "raw-3", name: "هبرة ناعمة", nameEn: "Fine Habra", description: "هبرة ناعمة للكبة", price: 69, image: "/src/assets/products/beef-minced.png", category: "raw-meat" },
  { id: "raw-4", name: "هبرة خشنة", nameEn: "Coarse Habra", description: "هبرة خشنة للكبة", price: 69, image: "/src/assets/products/beef-minced.png", category: "raw-meat" },
];

// Offal & Bowels - أحشاء
export const offalProducts: Product[] = [
  { id: "off-1", name: "كبدة عجل", nameEn: "Beef Liver", description: "كبدة عجل طازجة", price: 35, image: "/src/assets/products/beef-liver.png", category: "offal" },
  { id: "off-2", name: "كبدة غنم", nameEn: "Lamb Liver", description: "كبدة غنم طازجة", price: 45, image: "/src/assets/products/beef-liver.png", category: "offal" },
  { id: "off-3", name: "كلاوي عجل", nameEn: "Beef Kidney", description: "كلاوي عجل طازجة", price: 30, image: "/src/assets/products/oxtail.png", category: "offal" },
  { id: "off-4", name: "كلاوي غنم", nameEn: "Lamb Kidney", description: "كلاوي غنم طازجة", price: 40, image: "/src/assets/products/oxtail.png", category: "offal" },
  { id: "off-5", name: "قلوب عجل", nameEn: "Beef Heart", description: "قلوب عجل طازجة", price: 25, image: "/src/assets/products/oxtail.png", category: "offal" },
  { id: "off-6", name: "قلوب غنم", nameEn: "Lamb Heart", description: "قلوب غنم طازجة", price: 35, image: "/src/assets/products/oxtail.png", category: "offal" },
  { id: "off-7", name: "طحال عجل", nameEn: "Beef Spleen", description: "طحال عجل طازج", price: 20, image: "/src/assets/products/beef-liver.png", category: "offal" },
  { id: "off-8", name: "كوارع عجل", nameEn: "Beef Trotters", description: "كوارع عجل طازجة", price: 25, image: "/src/assets/products/oxtail.png", category: "offal" },
  { id: "off-9", name: "رأس غنم", nameEn: "Lamb Head", description: "رأس غنم طازج", price: 45, image: "/src/assets/products/lamb-with-bones.png", category: "offal" },
  { id: "off-10", name: "ذيل بقري", nameEn: "Oxtail", description: "ذيل بقري طازج للطبخ البطيء", price: 65, image: "/src/assets/products/oxtail.png", category: "offal", isNew: true },
];

// Combined products for easy access
export const allProducts: Product[] = [
  ...lambProducts,
  ...beefProducts,
  ...localVealProducts,
  ...steakProducts,
  ...marinatedProducts,
  ...skewersProducts,
  ...chickenProducts,
  ...readyToCookProducts,
  ...frozenProducts,
  ...rawMeatProducts,
  ...offalProducts,
];

// Get products by category
export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === "all") return allProducts;
  return allProducts.filter(product => product.category === categoryId);
};
