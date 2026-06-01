// Mock product catalog.
//
// In a real app this data would come from an API or database. For now we
// hard-code a list of products and "tag" each one with metadata so the
// recommendation engine (see recommendations.ts) can pick the right items
// for a given student.
//
// Each product stores a single `basePrice` (the "Standard" tier price). The
// recommendation engine expands that into the four tier prices using
// deriveTiers() from budget.ts, so we only have to maintain one number here.

import type { Climate, DormType, Hobby } from "./types";

export interface MockProduct {
  id: string;
  name: string;
  category: string;
  basePrice: number; // the "Standard" tier price, in whole US dollars
  link: string;

  // ----- Optional filtering tags -----

  // If set, the item is only suggested for these climates.
  climates?: Climate[];

  // If set, the item is only suggested for these dorm types.
  dormTypes?: DormType[];

  // If set, the item belongs to a hobby and only shows when the student
  // selected that hobby.
  hobby?: Hobby;
}

// Reusable climate groups so the data below reads clearly.
const COLD_CLIMATES: Climate[] = ["cold", "four-season", "variable"];
const WARM_CLIMATES: Climate[] = ["hot", "four-season", "variable"];

// Dorm types that have access to some kind of kitchen / cooking space.
const KITCHEN_DORMS: DormType[] = ["suite", "apartment", "off-campus"];
const ALL_DORMS: DormType[] = [
  "traditional-double",
  "traditional-single",
  "suite",
  "apartment",
  "off-campus",
];

// All mock product links point to a placeholder search page so the demo
// "links" actually open something instead of 404-ing.
const shopLink = (name: string) =>
  `https://www.example-shop.com/search?q=${encodeURIComponent(name)}`;

// A small helper so each product object stays short and readable.
const product = (
  p: Omit<MockProduct, "link"> & { link?: string }
): MockProduct => ({
  ...p,
  link: p.link ?? shopLink(p.name),
});

export const mockProducts: MockProduct[] = [
  // ----- Bedding -----
  product({ id: "twin-xl-sheets", name: "Twin XL Sheet Set", category: "Bedding", basePrice: 35 }),
  product({ id: "comforter", name: "Comforter", category: "Bedding", basePrice: 45 }),
  product({ id: "pillows", name: "Pillows (2-pack)", category: "Bedding", basePrice: 25 }),
  product({ id: "mattress-topper", name: "Memory Foam Mattress Topper", category: "Bedding", basePrice: 60 }),
  product({ id: "heated-blanket", name: "Heated Throw Blanket", category: "Bedding", basePrice: 40, climates: COLD_CLIMATES }),
  product({ id: "cooling-sheets", name: "Cooling Bamboo Sheets", category: "Bedding", basePrice: 55, climates: WARM_CLIMATES }),

  // ----- Bathroom -----
  product({ id: "towel-set", name: "Bath Towel Set", category: "Bathroom", basePrice: 30 }),
  product({ id: "shower-caddy", name: "Shower Caddy", category: "Bathroom", basePrice: 15 }),
  product({ id: "shower-shoes", name: "Shower Sandals", category: "Bathroom", basePrice: 12 }),
  product({ id: "toiletry-bag", name: "Toiletry Bag", category: "Bathroom", basePrice: 18 }),
  product({ id: "robe", name: "Plush Bathrobe", category: "Bathroom", basePrice: 28 }),

  // ----- Storage & Organization -----
  product({ id: "storage-bins", name: "Collapsible Storage Bins (3-pack)", category: "Storage", basePrice: 22 }),
  product({ id: "underbed-risers", name: "Bed Risers", category: "Storage", basePrice: 18 }),
  product({ id: "closet-organizer", name: "Hanging Closet Organizer", category: "Storage", basePrice: 20 }),
  product({ id: "drawer-cart", name: "Rolling Drawer Cart", category: "Storage", basePrice: 45 }),

  // ----- Electronics -----
  product({ id: "power-strip", name: "Surge Protector Power Strip", category: "Electronics", basePrice: 20 }),
  product({ id: "ext-cord", name: "Extension Cord", category: "Electronics", basePrice: 12 }),
  product({ id: "desk-lamp", name: "LED Desk Lamp", category: "Electronics", basePrice: 25 }),
  product({ id: "fan", name: "Clip-On Fan", category: "Electronics", basePrice: 22, climates: WARM_CLIMATES }),
  product({ id: "space-heater", name: "Small Space Heater", category: "Electronics", basePrice: 35, climates: COLD_CLIMATES }),
  product({ id: "bluetooth-speaker", name: "Bluetooth Speaker", category: "Electronics", basePrice: 40 }),
  product({ id: "noise-machine", name: "White Noise Machine", category: "Electronics", basePrice: 30 }),

  // ----- Study -----
  product({ id: "desk-organizer", name: "Desk Organizer", category: "Study", basePrice: 16 }),
  product({ id: "notebooks", name: "Notebooks & Supplies", category: "Study", basePrice: 25 }),
  product({ id: "whiteboard", name: "Small Whiteboard", category: "Study", basePrice: 18 }),
  product({ id: "desk-chair-cushion", name: "Desk Chair Cushion", category: "Study", basePrice: 28 }),

  // ----- Laundry & Cleaning -----
  product({ id: "laundry-hamper", name: "Pop-Up Laundry Hamper", category: "Laundry & Cleaning", basePrice: 16 }),
  product({ id: "detergent", name: "Laundry Detergent Pods", category: "Laundry & Cleaning", basePrice: 14 }),
  product({ id: "cleaning-wipes", name: "Disinfecting Wipes", category: "Laundry & Cleaning", basePrice: 10 }),

  // ----- Kitchen -----
  product({ id: "mini-fridge", name: "Mini Fridge", category: "Kitchen", basePrice: 120, dormTypes: ALL_DORMS }),
  product({ id: "microwave", name: "Compact Microwave", category: "Kitchen", basePrice: 70, dormTypes: KITCHEN_DORMS }),
  product({ id: "kettle", name: "Electric Kettle", category: "Kitchen", basePrice: 25, dormTypes: KITCHEN_DORMS }),
  product({ id: "dish-set", name: "Dish & Utensil Set", category: "Kitchen", basePrice: 35, dormTypes: KITCHEN_DORMS }),
  product({ id: "cookware", name: "Basic Cookware Set", category: "Kitchen", basePrice: 55, dormTypes: ["apartment", "off-campus"] }),

  // ----- Decor -----
  product({ id: "string-lights", name: "LED String Lights", category: "Decor", basePrice: 15 }),
  product({ id: "wall-tapestry", name: "Wall Tapestry", category: "Decor", basePrice: 20 }),
  product({ id: "area-rug", name: "Soft Area Rug", category: "Decor", basePrice: 40 }),
  product({ id: "plants", name: "Faux Plants Set", category: "Decor", basePrice: 22 }),

  // ----- Hobby: Fitness -----
  product({ id: "yoga-mat", name: "Yoga Mat", category: "Fitness", basePrice: 20, hobby: "fitness" }),
  product({ id: "dumbbells", name: "Adjustable Dumbbells", category: "Fitness", basePrice: 50, hobby: "fitness" }),
  product({ id: "resistance-bands", name: "Resistance Bands Set", category: "Fitness", basePrice: 18, hobby: "fitness" }),

  // ----- Hobby: Gaming -----
  product({ id: "gaming-headset", name: "Gaming Headset", category: "Gaming", basePrice: 45, hobby: "gaming" }),
  product({ id: "controller", name: "Wireless Controller", category: "Gaming", basePrice: 50, hobby: "gaming" }),
  product({ id: "monitor", name: "Gaming Monitor", category: "Gaming", basePrice: 160, hobby: "gaming" }),

  // ----- Hobby: Cooking -----
  product({ id: "mini-blender", name: "Personal Blender", category: "Cooking", basePrice: 30, hobby: "cooking" }),
  product({ id: "snack-storage", name: "Airtight Snack Containers", category: "Cooking", basePrice: 16, hobby: "cooking" }),

  // ----- Hobby: Music -----
  product({ id: "headphones", name: "Over-Ear Headphones", category: "Music", basePrice: 60, hobby: "music" }),
  product({ id: "ukulele", name: "Beginner Ukulele", category: "Music", basePrice: 40, hobby: "music" }),

  // ----- Hobby: Art -----
  product({ id: "art-supplies", name: "Sketchbook & Pencil Set", category: "Art", basePrice: 25, hobby: "art" }),
  product({ id: "easel", name: "Tabletop Easel", category: "Art", basePrice: 30, hobby: "art" }),

  // ----- Hobby: Reading -----
  product({ id: "book-shelf", name: "Small Bookshelf", category: "Reading", basePrice: 35, hobby: "reading" }),
  product({ id: "reading-light", name: "Clip Reading Light", category: "Reading", basePrice: 14, hobby: "reading" }),

  // ----- Hobby: Sports -----
  product({ id: "gym-bag", name: "Gym Duffel Bag", category: "Sports", basePrice: 28, hobby: "sports" }),
  product({ id: "water-bottle", name: "Insulated Water Bottle", category: "Sports", basePrice: 22, hobby: "sports" }),

  // ----- Hobby: Coffee -----
  product({ id: "coffee-maker", name: "Single-Serve Coffee Maker", category: "Coffee", basePrice: 45, hobby: "coffee" }),
  product({ id: "travel-mug", name: "Insulated Travel Mug", category: "Coffee", basePrice: 18, hobby: "coffee" }),
];
