import React, { useState } from 'react';
import { FoodEntry, FoodItem } from '../types';

interface Props {
  entries: FoodEntry[];
  foodItems: FoodItem[];
  onAddFood: (foodId: number, quantity: number, meal: string, customName?: string, customCal?: number, customProt?: number) => void;
  onDeleteFood: (entryId: number) => void;
}

export const FoodTrackingCard: React.FC<Props> = ({
  entries,
  foodItems,
  onAddFood,
  onDeleteFood
}) => {
  const [selectedFoodId, setSelectedFoodId] = useState<number>(foodItems[0]?.id || 1);
  const [quantity, setQuantity] = useState<number>(1);
  const [meal, setMeal] = useState<string>('Breakfast');
  const [showAddForm, setShowAddForm] = useState<boolean>(true);
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(250);
  const [customProtein, setCustomProtein] = useState<number>(20);

  const getMealIcon = (mealName: string) => {
    switch (mealName.toLowerCase()) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🥗';
      case 'dinner': return '🍲';
      case 'snack': return '🍎';
      default: return '🍴';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMode) {
      if (!customName.trim()) return;
      onAddFood(0, quantity, meal, customName.trim(), customCalories, customProtein);
      setCustomName('');
    } else {
      onAddFood(selectedFoodId, quantity, meal);
    }
    setQuantity(1);
  };

  return (
    <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
      <h2>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🍽️</span> Today's Food
        </span>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ fontSize: '13px', padding: '7px 14px' }}
        >
          {showAddForm ? '✕ Close Log Form' : '+ Log Food'}
        </button>
      </h2>

      {showAddForm && (
        <div className="add-food-card">
          <form id="food-entry-form" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="entryMode"
                  checked={!customMode}
                  onChange={() => setCustomMode(false)}
                />
                Choose from Database
              </label>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="entryMode"
                  checked={customMode}
                  onChange={() => setCustomMode(true)}
                />
                Custom Food
              </label>
            </div>

            <div className="form-row" style={{ flexWrap: 'wrap' }}>
              {!customMode ? (
                <div style={{ flex: '2', minWidth: '220px' }}>
                  <label htmlFor="food-id" style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Select Food
                  </label>
                  <select
                    id="food-id"
                    value={selectedFoodId}
                    onChange={e => setSelectedFoodId(Number(e.target.value))}
                    style={{ width: '100%' }}
                  >
                    {foodItems.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.calories} kcal • {f.protein}g protein)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ flex: '2', minWidth: '180px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Food Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Avocado Toast with Egg"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ width: '110px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={customCalories}
                      onChange={e => setCustomCalories(Number(e.target.value))}
                      style={{ width: '100%' }}
                      min="0"
                    />
                  </div>
                  <div style={{ width: '110px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={customProtein}
                      onChange={e => setCustomProtein(Number(e.target.value))}
                      style={{ width: '100%' }}
                      min="0"
                    />
                  </div>
                </>
              )}

              <div style={{ width: '95px' }}>
                <label htmlFor="quantity" style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="0.25"
                  step="0.25"
                  value={quantity}
                  onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ width: '140px' }}>
                <label htmlFor="meal" style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>
                  Meal Type
                </label>
                <select
                  id="meal"
                  value={meal}
                  onChange={e => setMeal(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Breakfast">🍳 Breakfast</option>
                  <option value="Lunch">🥗 Lunch</option>
                  <option value="Dinner">🍲 Dinner</option>
                  <option value="Snack">🍎 Snack</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{ height: '44px', padding: '0 22px' }}>
                  + Add Entry
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div id="food-entries" className="food-entries-container">
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>🥗</span>
            <p style={{ fontWeight: 500 }}>No meals logged yet today.</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Choose a food above or ask the AI Coach to log for you!
            </p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="food-entry-item">
              <div className="food-entry-info">
                <strong>
                  {getMealIcon(entry.meal)} {entry.foodName}
                </strong>
                <span>
                  {entry.quantity} portion • {entry.meal}
                </span>
              </div>
              <div className="food-entry-stats">
                <strong>
                  {entry.calories} kcal <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>|</span> {entry.protein} g protein
                </strong>
                <button
                  className="btn-danger"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => onDeleteFood(entry.id)}
                  title="Delete entry"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
