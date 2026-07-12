export const initialProducts = [
  { id: 'p1', name: 'Maize Flour (2kg)', category: 'Staples' },
  { id: 'p2', name: 'Rice (2kg)', category: 'Staples' },
  { id: 'p3', name: 'Wheat Flour (2kg)', category: 'Baking' },
  { id: 'p4', name: 'Sugar (2kg)', category: 'Baking' },
  { id: 'p5', name: 'Cooking Oil (1L)', category: 'Cooking Essentials' },
  { id: 'p6', name: 'Cooking Fat (1kg)', category: 'Cooking Essentials' },
  { id: 'p7', name: 'Milk (500ml)', category: 'Dairy' },
  { id: 'p8', name: 'Bread (400g)', category: 'Bakery' },
  { id: 'p9', name: 'Toilet Paper (2 rolls)', category: 'Household' },
  { id: 'p10', name: 'Eggs (tray of 30)', category: 'Dairy & Eggs' }
];

export const initialSupermarkets = ['Carrefour', 'Naivas', 'Quickmart'];

// Like-for-like supermarket basket researched in June 2026.
// Source: Soko Directory's comparison of Naivas, Quickmart, and Carrefour.
const comparisonSource = 'Soko Directory supermarket essentials basket (June 2026)';
const comparisonDate = '2026-06-01';

const priceBasket = [
  ['Maize Flour (2kg)', 139, 154, 124],
  ['Rice (2kg)', 324, 307, 306],
  ['Wheat Flour (2kg)', 129, 135, 129],
  ['Sugar (2kg)', 298, 309, 300],
  ['Cooking Oil (1L)', 299, 312, 298],
  ['Cooking Fat (1kg)', 355, 343, 342],
  ['Milk (500ml)', 42, 43, 42],
  ['Bread (400g)', 55, 65, 54],
  ['Toilet Paper (2 rolls)', 145, 80, 88],
  ['Eggs (tray of 30)', 560, 600, 628]
];

export const initialPrices = priceBasket.flatMap(([productName, naivas, quickmart, carrefour], itemIndex) => [
  {
    id: itemIndex * 3 + 1,
    productName,
    supermarket: 'Naivas',
    price: naivas,
    location: 'Online comparison basket',
    date: comparisonDate,
    source: comparisonSource,
    submittedBy: 'MarkerTracker research',
    approved: true
  },
  {
    id: itemIndex * 3 + 2,
    productName,
    supermarket: 'Quickmart',
    price: quickmart,
    location: 'Online comparison basket',
    date: comparisonDate,
    source: comparisonSource,
    submittedBy: 'MarkerTracker research',
    approved: true
  },
  {
    id: itemIndex * 3 + 3,
    productName,
    supermarket: 'Carrefour',
    price: carrefour,
    location: 'Online comparison basket',
    date: comparisonDate,
    source: comparisonSource,
    submittedBy: 'MarkerTracker research',
    approved: true
  }
]);
