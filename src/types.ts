export interface User {
  id: number;
  username: string;
  calorieTarget: number;
  proteinTarget: number;
  startingWeight: number;
}

export interface FoodItem {
  id: number;
  name: string;
  calories: number; // per serving
  protein: number;  // grams per serving
  unit?: string;
}

export interface FoodEntry {
  id: number;
  userId: number;
  foodId: number;
  foodName: string;
  calories: number;
  protein: number;
  quantity: number;
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | string;
  entryDate: string; // YYYY-MM-DD
}

export interface WeightEntry {
  id: number;
  userId: number;
  weight: number;
  entryDate: string; // YYYY-MM-DD
}

export interface WaterEntry {
  userId: number;
  glasses: number;
  goal: number;
  entryDate: string; // YYYY-MM-DD
}
