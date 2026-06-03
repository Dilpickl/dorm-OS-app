// Built-in mock catalog (fallback when CATALOG_API_URL is not set).
//
// Exported as `mockCatalog` for getCatalog() and as sample data for your own API.

import type { CatalogProduct } from "./catalog/types";
import type { Climate, DormType } from "./types";

export type { CatalogProduct };

const COLD_CLIMATES: Climate[] = ["cold", "four-season"];
const WARM_CLIMATES: Climate[] = ["hot", "four-season"];

const KITCHEN_DORMS: DormType[] = ["suite", "apartment", "off-campus"];
const ALL_DORMS: DormType[] = [
  "traditional-double",
  "traditional-single",
  "suite",
  "apartment",
  "off-campus",
];

/** Amazon affiliate short links (order matches catalog list in STATE.md). */
const AFFILIATE_LINKS: Record<string, string> = {
  "twin-xl-sheets": "https://amzn.to/4uM9TU3",
  comforter: "https://amzn.to/3PZK1Fg",
  pillows: "https://amzn.to/43bpYqs",
  "mattress-topper": "https://amzn.to/3QdTPLU",
  "heated-blanket": "https://amzn.to/4fR6sqE",
  "cooling-sheets": "https://amzn.to/4vvkKC5",
  "towel-set": "https://amzn.to/4x1HB9K",
  "shower-caddy": "https://amzn.to/4vgXOGg",
  "shower-shoes": "https://amzn.to/437ZxC3",
  "toiletry-bag": "https://amzn.to/4a4k26k",
  robe: "https://amzn.to/4ao69Qq",
  "storage-bins": "https://amzn.to/3RLOhJ1",
  "underbed-risers": "https://amzn.to/4dKf15c",
  "closet-organizer": "https://amzn.to/4fWHxC3",
  "drawer-cart": "https://amzn.to/43bqKUo",
  "power-strip": "https://amzn.to/4uHI9A5",
  "ext-cord": "https://amzn.to/4uHI9A5",
  "desk-lamp": "https://amzn.to/4uODfBq",
  fan: "https://amzn.to/3PR3ubd",
  "space-heater": "https://amzn.to/3Q0XBbj",
  "bluetooth-speaker": "https://amzn.to/4uWHDyf",
  "desk-organizer": "https://amzn.to/4u8bXEL",
  notebooks: "https://amzn.to/4vsUb0j",
  whiteboard: "https://amzn.to/4dLQ9dt",
  "desk-chair-cushion": "https://amzn.to/4e4H66f",
  "laundry-hamper": "https://amzn.to/43vulNj",
  detergent: "https://amzn.to/4ehZw4G",
  "cleaning-wipes": "https://amzn.to/4o3mMqv",
  "mini-fridge": "https://amzn.to/4fVCcuD",
  microwave: "https://amzn.to/4uOgu0z",
  kettle: "https://amzn.to/3RBqoE3",
  "dish-set": "https://amzn.to/4uPUy54",
  cookware: "https://amzn.to/43JotzT",
  "string-lights": "https://amzn.to/4ugf9OF",
  "wall-tapestry": "https://amzn.to/4umu6PC",
  "area-rug": "https://amzn.to/4vjXlDf",
  plants: "https://amzn.to/4vvlKGl",
  "yoga-mat": "https://amzn.to/3PYlgcn",
  dumbbells: "https://amzn.to/4o17S3S",
  "resistance-bands": "https://amzn.to/4fUoCHY",
  "gaming-headset": "https://amzn.to/4e0dXcj",
  controller: "https://amzn.to/4ucK2DI",
  monitor: "https://amzn.to/3SfTito",
  "mini-blender": "https://amzn.to/43auZiY",
  "snack-storage": "https://amzn.to/4vplV5F",
  headphones: "https://amzn.to/4vtt1Xa",
  ukulele: "https://amzn.to/4fFQZd9",
  "art-supplies": "https://amzn.to/4o4g8Qw",
  easel: "https://amzn.to/4dLyp1F",
  "book-shelf": "https://amzn.to/4oezbb5",
  "reading-light": "https://amzn.to/3RFqFpv",
  "gym-bag": "https://amzn.to/4fWrKmI",
  "water-bottle": "https://amzn.to/4dXImYR",
  "coffee-maker": "https://amzn.to/3QfAWbu",
  "travel-mug": "https://amzn.to/4dJvqXE",
  "portable-vacuum": "https://amzn.to/4o2HneB",
  "ear-plugs": "https://amzn.to/4o7sVll",
  tv: "https://amzn.to/4uHySI9",
  "board-games": "https://amzn.to/4fWKW3K",
};

const product = (
  p: Omit<CatalogProduct, "link"> & { link?: string }
): CatalogProduct => ({
  priority: 50,
  ...p,
  link: p.link ?? AFFILIATE_LINKS[p.id] ?? "#",
});

export const mockCatalog: CatalogProduct[] = [
  product({ id: "twin-xl-sheets", name: "Twin XL Sheet Set", category: "Bedding", basePrice: 35, essential: true, priority: 100 }),
  product({ id: "comforter", name: "Comforter", category: "Bedding", basePrice: 45, essential: true, priority: 95 }),
  product({ id: "pillows", name: "Pillows (2-pack)", category: "Bedding", basePrice: 25, essential: true, priority: 90 }),
  product({ id: "mattress-topper", name: "Memory Foam Mattress Topper", category: "Bedding", basePrice: 60, priority: 55 }),
  product({ id: "heated-blanket", name: "Heated Throw Blanket", category: "Bedding", basePrice: 40, climates: COLD_CLIMATES, priority: 70 }),
  product({ id: "cooling-sheets", name: "Cooling Bamboo Sheets", category: "Bedding", basePrice: 55, climates: WARM_CLIMATES, priority: 70 }),

  product({ id: "towel-set", name: "Bath Towel Set", category: "Bathroom", basePrice: 30, essential: true, priority: 100 }),
  product({ id: "shower-caddy", name: "Shower Caddy", category: "Bathroom", basePrice: 15, essential: true, priority: 95 }),
  product({ id: "shower-shoes", name: "Shower Sandals", category: "Bathroom", basePrice: 12, essential: true, priority: 90 }),
  product({ id: "toiletry-bag", name: "Toiletry Bag", category: "Bathroom", basePrice: 18, priority: 45 }),
  product({ id: "robe", name: "Plush Bathrobe", category: "Bathroom", basePrice: 28, priority: 30 }),

  product({ id: "storage-bins", name: "Collapsible Storage Bins (3-pack)", category: "Storage", basePrice: 22, essential: true, priority: 90 }),
  product({ id: "underbed-risers", name: "Bed Risers", category: "Storage", basePrice: 18, essential: true, priority: 85 }),
  product({ id: "closet-organizer", name: "Hanging Closet Organizer", category: "Storage", basePrice: 20, priority: 60 }),
  product({ id: "drawer-cart", name: "Rolling Drawer Cart", category: "Storage", basePrice: 45, priority: 50 }),

  product({ id: "power-strip", name: "Surge Protector Power Strip", category: "Electronics", basePrice: 20, essential: true, priority: 100 }),
  product({ id: "ext-cord", name: "Extension Cord", category: "Electronics", basePrice: 12, essential: true, priority: 95 }),
  product({ id: "desk-lamp", name: "LED Desk Lamp", category: "Electronics", basePrice: 25, essential: true, priority: 90 }),
  product({ id: "fan", name: "Clip-On Fan", category: "Electronics", basePrice: 22, climates: WARM_CLIMATES, priority: 75 }),
  product({ id: "space-heater", name: "Small Space Heater", category: "Electronics", basePrice: 35, climates: COLD_CLIMATES, priority: 75 }),
  product({ id: "bluetooth-speaker", name: "Bluetooth Speaker", category: "Electronics", basePrice: 40, priority: 35 }),
  product({ id: "ear-plugs", name: "Ear Plugs", category: "Electronics", basePrice: 12, priority: 65 }),
  product({ id: "tv", name: "TV", category: "Electronics", basePrice: 150, priority: 32 }),

  product({ id: "desk-organizer", name: "Desk Organizer", category: "Study", basePrice: 16, essential: true, priority: 85 }),
  product({ id: "notebooks", name: "Notebooks & Supplies", category: "Study", basePrice: 25, essential: true, priority: 90 }),
  product({ id: "whiteboard", name: "Small Whiteboard", category: "Study", basePrice: 18, priority: 45 }),
  product({ id: "desk-chair-cushion", name: "Desk Chair Cushion", category: "Study", basePrice: 28, priority: 50 }),

  product({ id: "laundry-hamper", name: "Pop-Up Laundry Hamper", category: "Laundry & Cleaning", basePrice: 16, essential: true, priority: 90 }),
  product({ id: "detergent", name: "Laundry Detergent Pods", category: "Laundry & Cleaning", basePrice: 14, essential: true, priority: 85 }),
  product({ id: "cleaning-wipes", name: "Disinfecting Wipes", category: "Laundry & Cleaning", basePrice: 10, essential: true, priority: 80 }),
  product({ id: "portable-vacuum", name: "Portable Vacuum", category: "Laundry & Cleaning", basePrice: 25, priority: 75 }),

  product({ id: "mini-fridge", name: "Mini Fridge", category: "Kitchen", basePrice: 120, dormTypes: ALL_DORMS, priority: 80 }),
  product({ id: "microwave", name: "Compact Microwave", category: "Kitchen", basePrice: 70, dormTypes: KITCHEN_DORMS, priority: 70 }),
  product({ id: "kettle", name: "Electric Kettle", category: "Kitchen", basePrice: 25, dormTypes: KITCHEN_DORMS, priority: 55 }),
  product({ id: "dish-set", name: "Dish & Utensil Set", category: "Kitchen", basePrice: 35, dormTypes: KITCHEN_DORMS, priority: 60 }),
  product({ id: "cookware", name: "Basic Cookware Set", category: "Kitchen", basePrice: 55, dormTypes: ["apartment", "off-campus"], priority: 65 }),

  product({ id: "string-lights", name: "LED String Lights", category: "Decor", basePrice: 15, priority: 25 }),
  product({ id: "wall-tapestry", name: "Wall Tapestry", category: "Decor", basePrice: 20, priority: 20 }),
  product({ id: "area-rug", name: "Soft Area Rug", category: "Decor", basePrice: 40, priority: 30 }),
  product({ id: "plants", name: "Faux Plants Set", category: "Decor", basePrice: 22, priority: 20 }),
  product({ id: "board-games", name: "Board Games", category: "Games", basePrice: 25, priority: 28 }),

  product({ id: "yoga-mat", name: "Yoga Mat", category: "Fitness", basePrice: 20, hobby: "fitness", priority: 70 }),
  product({ id: "dumbbells", name: "Adjustable Dumbbells", category: "Fitness", basePrice: 50, hobby: "fitness", priority: 55 }),
  product({ id: "resistance-bands", name: "Resistance Bands Set", category: "Fitness", basePrice: 18, hobby: "fitness", priority: 60 }),

  product({ id: "gaming-headset", name: "Gaming Headset", category: "Gaming", basePrice: 45, hobby: "gaming", priority: 75 }),
  product({ id: "controller", name: "Wireless Controller", category: "Gaming", basePrice: 50, hobby: "gaming", priority: 65 }),
  product({ id: "monitor", name: "Gaming Monitor", category: "Gaming", basePrice: 160, hobby: "gaming", priority: 50 }),

  product({ id: "mini-blender", name: "Personal Blender", category: "Cooking", basePrice: 30, hobby: "cooking", priority: 65 }),
  product({ id: "snack-storage", name: "Airtight Snack Containers", category: "Cooking", basePrice: 16, hobby: "cooking", priority: 55 }),

  product({ id: "headphones", name: "Over-Ear Headphones", category: "Music", basePrice: 60, hobby: "music", priority: 70 }),
  product({ id: "ukulele", name: "Beginner Ukulele", category: "Music", basePrice: 40, hobby: "music", priority: 50 }),

  product({ id: "art-supplies", name: "Sketchbook & Pencil Set", category: "Art", basePrice: 25, hobby: "art", priority: 65 }),
  product({ id: "easel", name: "Tabletop Easel", category: "Art", basePrice: 30, hobby: "art", priority: 50 }),

  product({ id: "book-shelf", name: "Small Bookshelf", category: "Reading", basePrice: 35, hobby: "reading", priority: 60 }),
  product({ id: "reading-light", name: "Clip Reading Light", category: "Reading", basePrice: 14, hobby: "reading", priority: 55 }),

  product({ id: "gym-bag", name: "Gym Duffel Bag", category: "Sports", basePrice: 28, hobby: "sports", priority: 65 }),
  product({ id: "water-bottle", name: "Insulated Water Bottle", category: "Sports", basePrice: 22, hobby: "sports", priority: 70 }),

  product({ id: "coffee-maker", name: "Single-Serve Coffee Maker", category: "Coffee", basePrice: 45, hobby: "coffee", priority: 70 }),
  product({ id: "travel-mug", name: "Insulated Travel Mug", category: "Coffee", basePrice: 18, hobby: "coffee", priority: 60 }),
];

/** @deprecated Use mockCatalog */
export const mockProducts = mockCatalog;
