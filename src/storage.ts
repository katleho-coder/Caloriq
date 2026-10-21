import { User, FoodItem, FoodEntry, WeightEntry, WaterEntry } from './types';
import { jsPDF } from 'jspdf';

const USERS_KEY = 'caloriq_users';
const CURRENT_USER_KEY = 'caloriq_current_user_id';
const FOOD_ITEMS_KEY = 'caloriq_food_items';
const FOOD_ENTRIES_KEY = 'caloriq_food_entries';
const WEIGHT_ENTRIES_KEY = 'caloriq_weight_entries';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatShortDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Initial default food items
const DEFAULT_FOOD_ITEMS: FoodItem[] = [
  { id: 1, name: 'Oatmeal with Milk & Berries', calories: 320, protein: 12, unit: 'bowl' },
  { id: 2, name: 'Grilled Chicken Breast', calories: 240, protein: 46, unit: 'breast (180g)' },
  { id: 3, name: 'Brown Rice', calories: 215, protein: 5, unit: 'cup cooked' },
  { id: 4, name: 'Boiled Eggs (2 large)', calories: 155, protein: 13, unit: 'serving' },
  { id: 5, name: 'Greek Yogurt (0% fat)', calories: 120, protein: 17, unit: 'cup (170g)' },
  { id: 6, name: 'Whey Protein Shake', calories: 140, protein: 25, unit: 'scoop' },
  { id: 7, name: 'Fresh Banana', calories: 105, protein: 1.3, unit: 'medium' },
  { id: 8, name: 'Salmon Fillet (Baked)', calories: 340, protein: 34, unit: 'fillet (200g)' },
  { id: 9, name: 'Mixed Green Salad with Olive Oil', calories: 160, protein: 3, unit: 'bowl' },
  { id: 10, name: 'Whole Wheat Toast with Peanut Butter', calories: 260, protein: 10, unit: '2 slices' }
];

export function getStoredUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    const initialUsers: User[] = [
      {
        id: 1,
        username: 'Alex',
        calorieTarget: 2200,
        proteinTarget: 130,
        startingWeight: 82.5
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUserId(): number {
  const idStr = localStorage.getItem(CURRENT_USER_KEY);
  if (idStr) {
    const id = Number(idStr);
    if (!isNaN(id)) return id;
  }
  return 1;
}

export function setCurrentUserId(userId: number): void {
  localStorage.setItem(CURRENT_USER_KEY, String(userId));
}

export function getFoodItems(): FoodItem[] {
  const data = localStorage.getItem(FOOD_ITEMS_KEY);
  if (!data) {
    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(DEFAULT_FOOD_ITEMS));
    return DEFAULT_FOOD_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_FOOD_ITEMS;
  }
}

export function addFoodItem(name: string, calories: number, protein: number, unit = 'serving'): FoodItem {
  const foods = getFoodItems();
  const newItem: FoodItem = {
    id: Date.now(),
    name,
    calories,
    protein,
    unit
  };
  foods.push(newItem);
  localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foods));
  return newItem;
}

// Initial food entries for realistic demo tracking
function getSeedFoodEntries(userId: number): FoodEntry[] {
  const today = getTodayDateString();
  const d = new Date();
  
  const getPastDate = (daysAgo: number) => {
    const past = new Date(d);
    past.setDate(past.getDate() - daysAgo);
    const year = past.getFullYear();
    const month = String(past.getMonth() + 1).padStart(2, '0');
    const day = String(past.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return [
    {
      id: 101,
      userId,
      foodId: 1,
      foodName: 'Oatmeal with Milk & Berries',
      calories: 320,
      protein: 12,
      quantity: 1,
      meal: 'Breakfast',
      entryDate: today
    },
    {
      id: 102,
      userId,
      foodId: 4,
      foodName: 'Boiled Eggs (2 large)',
      calories: 155,
      protein: 13,
      quantity: 1,
      meal: 'Breakfast',
      entryDate: today
    },
    {
      id: 103,
      userId,
      foodId: 2,
      foodName: 'Grilled Chicken Breast',
      calories: 240,
      protein: 46,
      quantity: 1.5,
      meal: 'Lunch',
      entryDate: today
    },
    {
      id: 104,
      userId,
      foodId: 3,
      foodName: 'Brown Rice',
      calories: 215,
      protein: 5,
      quantity: 1,
      meal: 'Lunch',
      entryDate: today
    },
    // Past days for weekly trends
    { id: 105, userId, foodId: 2, foodName: 'Grilled Chicken Breast', calories: 480, protein: 92, quantity: 2, meal: 'Lunch', entryDate: getPastDate(1) },
    { id: 106, userId, foodId: 1, foodName: 'Oatmeal with Milk & Berries', calories: 320, protein: 12, quantity: 1, meal: 'Breakfast', entryDate: getPastDate(1) },
    { id: 107, userId, foodId: 8, foodName: 'Salmon Fillet (Baked)', calories: 680, protein: 68, quantity: 2, meal: 'Dinner', entryDate: getPastDate(1) },
    { id: 108, userId, foodId: 2, foodName: 'Grilled Chicken Breast', calories: 240, protein: 46, quantity: 1, meal: 'Lunch', entryDate: getPastDate(2) },
    { id: 109, userId, foodId: 5, foodName: 'Greek Yogurt (0% fat)', calories: 240, protein: 34, quantity: 2, meal: 'Snack', entryDate: getPastDate(2) },
    { id: 110, userId, foodId: 8, foodName: 'Salmon Fillet (Baked)', calories: 340, protein: 34, quantity: 1, meal: 'Dinner', entryDate: getPastDate(2) },
    { id: 111, userId, foodId: 1, foodName: 'Oatmeal with Milk & Berries', calories: 320, protein: 12, quantity: 1, meal: 'Breakfast', entryDate: getPastDate(3) },
    { id: 112, userId, foodId: 2, foodName: 'Grilled Chicken Breast', calories: 480, protein: 92, quantity: 2, meal: 'Lunch', entryDate: getPastDate(3) },
    { id: 113, userId, foodId: 6, foodName: 'Whey Protein Shake', calories: 280, protein: 50, quantity: 2, meal: 'Snack', entryDate: getPastDate(3) },
    { id: 114, userId, foodId: 8, foodName: 'Salmon Fillet (Baked)', calories: 340, protein: 34, quantity: 1, meal: 'Dinner', entryDate: getPastDate(4) },
    { id: 115, userId, foodId: 10, foodName: 'Whole Wheat Toast with Peanut Butter', calories: 520, protein: 20, quantity: 2, meal: 'Breakfast', entryDate: getPastDate(4) },
    { id: 116, userId, foodId: 2, foodName: 'Grilled Chicken Breast', calories: 240, protein: 46, quantity: 1, meal: 'Lunch', entryDate: getPastDate(5) },
    { id: 117, userId, foodId: 3, foodName: 'Brown Rice', calories: 215, protein: 5, quantity: 1, meal: 'Lunch', entryDate: getPastDate(5) },
    { id: 118, userId, foodId: 6, foodName: 'Whey Protein Shake', calories: 140, protein: 25, quantity: 1, meal: 'Snack', entryDate: getPastDate(5) },
    { id: 119, userId, foodId: 1, foodName: 'Oatmeal with Milk & Berries', calories: 320, protein: 12, quantity: 1, meal: 'Breakfast', entryDate: getPastDate(6) },
    { id: 120, userId, foodId: 8, foodName: 'Salmon Fillet (Baked)', calories: 340, protein: 34, quantity: 1, meal: 'Dinner', entryDate: getPastDate(6) }
  ];
}

function getSeedWeightEntries(userId: number): WeightEntry[] {
  const d = new Date();
  const getPastDate = (daysAgo: number) => {
    const past = new Date(d);
    past.setDate(past.getDate() - daysAgo);
    const year = past.getFullYear();
    const month = String(past.getMonth() + 1).padStart(2, '0');
    const day = String(past.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return [
    { id: 1, userId, weight: 82.5, entryDate: getPastDate(14) },
    { id: 2, userId, weight: 82.1, entryDate: getPastDate(10) },
    { id: 3, userId, weight: 81.8, entryDate: getPastDate(7) },
    { id: 4, userId, weight: 81.5, entryDate: getPastDate(5) },
    { id: 5, userId, weight: 81.2, entryDate: getPastDate(3) },
    { id: 6, userId, weight: 80.9, entryDate: getPastDate(1) },
    { id: 7, userId, weight: 80.6, entryDate: getTodayDateString() }
  ];
}

export function getFoodEntries(): FoodEntry[] {
  const data = localStorage.getItem(FOOD_ENTRIES_KEY);
  if (!data) {
    const seed = getSeedFoodEntries(1);
    localStorage.setItem(FOOD_ENTRIES_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveFoodEntries(entries: FoodEntry[]): void {
  localStorage.setItem(FOOD_ENTRIES_KEY, JSON.stringify(entries));
}

export function getWeightEntries(): WeightEntry[] {
  const data = localStorage.getItem(WEIGHT_ENTRIES_KEY);
  if (!data) {
    const seed = getSeedWeightEntries(1);
    localStorage.setItem(WEIGHT_ENTRIES_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveWeightEntries(entries: WeightEntry[]): void {
  localStorage.setItem(WEIGHT_ENTRIES_KEY, JSON.stringify(entries));
}

export function addWeightEntry(userId: number, weight: number, dateStr?: string): WeightEntry {
  const entries = getWeightEntries();
  const entryDate = dateStr || getTodayDateString();
  const existingIdx = entries.findIndex(e => e.userId === userId && e.entryDate === entryDate);
  
  let newEntry: WeightEntry;
  if (existingIdx >= 0) {
    entries[existingIdx].weight = weight;
    newEntry = entries[existingIdx];
  } else {
    newEntry = {
      id: Date.now(),
      userId,
      weight,
      entryDate
    };
    entries.push(newEntry);
  }
  saveWeightEntries(entries);
  return newEntry;
}

export function addFoodLogEntry(
  userId: number,
  foodId: number,
  quantity: number,
  meal: string,
  customName?: string,
  customCalories?: number,
  customProtein?: number
): FoodEntry {
  const foods = getFoodItems();
  const selectedFood = foods.find(f => f.id === foodId);
  const name = selectedFood ? selectedFood.name : (customName || 'Custom Food');
  const calPerUnit = selectedFood ? selectedFood.calories : (customCalories || 100);
  const protPerUnit = selectedFood ? selectedFood.protein : (customProtein || 10);

  const entry: FoodEntry = {
    id: Date.now(),
    userId,
    foodId: selectedFood ? selectedFood.id : 0,
    foodName: name,
    calories: Math.round(calPerUnit * quantity),
    protein: Math.round(protPerUnit * quantity * 10) / 10,
    quantity,
    meal,
    entryDate: getTodayDateString()
  };

  const current = getFoodEntries();
  current.push(entry);
  saveFoodEntries(current);
  return entry;
}

export function deleteFoodEntry(entryId: number): void {
  const current = getFoodEntries();
  const filtered = current.filter(e => e.id !== entryId);
  saveFoodEntries(filtered);
}

// Export CSV handler
export function exportUserCSV(userId: number, username: string): void {
  const entries = getFoodEntries().filter(e => e.userId === userId);
  const headers = ['Date', 'Food', 'Quantity', 'Meal', 'Calories (kcal)', 'Protein (g)'];
  const rows = entries.map(e => [
    e.entryDate,
    `"${e.foodName.replace(/"/g, '""')}"`,
    e.quantity,
    e.meal,
    e.calories,
    e.protein
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `caloriq_${username}_report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export PDF handler using jsPDF matching backend reportlab structure
export function exportUserPDF(userId: number, username: string): void {
  const entries = getFoodEntries().filter(e => e.userId === userId);
  const doc = new jsPDF();

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Caloriq Progress Report - User ${username} (#${userId})`, 14, 22);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
  doc.line(14, 34, 196, 34);

  let y = 44;
  doc.setTextColor(20);
  doc.setFont('Helvetica', 'bold');
  doc.text('Date', 14, y);
  doc.text('Food Item', 45, y);
  doc.text('Portion / Meal', 115, y);
  doc.text('Calories', 155, y);
  doc.text('Protein', 180, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  doc.setFont('Helvetica', 'normal');

  let totalCal = 0;
  let totalProt = 0;

  if (entries.length === 0) {
    doc.text('No food entries recorded yet.', 14, y);
  } else {
    for (const entry of entries) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      totalCal += entry.calories;
      totalProt += entry.protein;

      const dateText = entry.entryDate;
      const foodText = entry.foodName.length > 28 ? entry.foodName.substring(0, 26) + '...' : entry.foodName;
      const mealText = `${entry.quantity}x (${entry.meal})`;

      doc.text(dateText, 14, y);
      doc.text(foodText, 45, y);
      doc.text(mealText, 115, y);
      doc.text(`${entry.calories} kcal`, 155, y);
      doc.text(`${entry.protein} g`, 180, y);
      y += 8;
    }

    y += 5;
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFont('Helvetica', 'bold');
    doc.text('Total Tracked Intake:', 14, y);
    doc.text(`${totalCal} kcal`, 155, y);
    doc.text(`${Math.round(totalProt * 10) / 10} g`, 180, y);
  }

  doc.save(`caloriq_${username}_report.pdf`);
}

// --- Water Intake Persistence ---
const WATER_ENTRIES_KEY = 'caloriq_water_entries';

export function getWaterEntries(): WaterEntry[] {
  const data = localStorage.getItem(WATER_ENTRIES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveWaterEntries(entries: WaterEntry[]): void {
  localStorage.setItem(WATER_ENTRIES_KEY, JSON.stringify(entries));
}

export function getTodayWaterEntry(userId: number): WaterEntry {
  const entries = getWaterEntries();
  const today = getTodayDateString();
  const existing = entries.find(e => e.userId === userId && e.entryDate === today);
  if (existing) {
    return existing;
  }
  // Default new entry with 8 glasses goal
  return {
    userId,
    glasses: 0,
    goal: 8,
    entryDate: today
  };
}

export function updateWaterEntry(userId: number, glasses: number, goal?: number): WaterEntry {
  const entries = getWaterEntries();
  const today = getTodayDateString();
  const existingIdx = entries.findIndex(e => e.userId === userId && e.entryDate === today);

  const finalGlasses = Math.max(0, glasses);

  if (existingIdx >= 0) {
    entries[existingIdx].glasses = finalGlasses;
    if (goal !== undefined && goal > 0) {
      entries[existingIdx].goal = goal;
    }
    saveWaterEntries(entries);
    return entries[existingIdx];
  } else {
    const newEntry: WaterEntry = {
      userId,
      glasses: finalGlasses,
      goal: goal || 8,
      entryDate: today
    };
    entries.push(newEntry);
    saveWaterEntries(entries);
    return newEntry;
  }
}
