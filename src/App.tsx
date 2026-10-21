import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, FoodItem, FoodEntry, WeightEntry, WaterEntry } from './types';
import {
  getStoredUsers,
  getCurrentUserId,
  setCurrentUserId,
  getFoodItems,
  getFoodEntries,
  getWeightEntries,
  getTodayDateString,
  addFoodLogEntry,
  deleteFoodEntry,
  addWeightEntry,
  getTodayWaterEntry,
  updateWaterEntry
} from './storage';
import { Header } from './components/Header';
import { AuthCard } from './components/AuthCard';
import { CaloriesCard } from './components/CaloriesCard';
import { DailySummaryCard } from './components/DailySummaryCard';
import { GoalsCard } from './components/GoalsCard';
import { WaterIntakeCard } from './components/WaterIntakeCard';
import { WeeklyTrendsChart } from './components/WeeklyTrendsChart';
import { ExportCard } from './components/ExportCard';
import { ProteinCard } from './components/ProteinCard';
import { WeightStatsCard } from './components/WeightStatsCard';
import { UpdateWeightCard } from './components/UpdateWeightCard';
import { WeightHistoryChart } from './components/WeightHistoryChart';
import { FoodTrackingCard } from './components/FoodTrackingCard';
import { AIChatCard } from './components/AIChatCard';

export const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [waterEntry, setWaterEntry] = useState<WaterEntry>({
    userId: 1,
    glasses: 0,
    goal: 8,
    entryDate: getTodayDateString(),
  });
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showAIChat, setShowAIChat] = useState<boolean>(true);

  const aiChatRef = useRef<HTMLDivElement>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    setUsers(loadedUsers);

    const activeId = getCurrentUserId();
    const active = loadedUsers.find(u => u.id === activeId) || loadedUsers[0] || null;
    setCurrentUser(active);

    if (active) {
      setWaterEntry(getTodayWaterEntry(active.id));
    }

    setFoodItems(getFoodItems());
    setFoodEntries(getFoodEntries());
    setWeightEntries(getWeightEntries());
  }, []);

  const todayStr = getTodayDateString();

  // User-specific today food entries
  const todayUserEntries = useMemo(() => {
    if (!currentUser) return [];
    return foodEntries.filter(
      e => e.userId === currentUser.id && e.entryDate === todayStr
    );
  }, [foodEntries, currentUser, todayStr]);

  // Calories and Protein totals for today
  const caloriesConsumed = useMemo(() => {
    return todayUserEntries.reduce((sum, e) => sum + e.calories, 0);
  }, [todayUserEntries]);

  const proteinConsumed = useMemo(() => {
    return Math.round(todayUserEntries.reduce((sum, e) => sum + e.protein, 0) * 10) / 10;
  }, [todayUserEntries]);

  const calorieTarget = currentUser ? currentUser.calorieTarget : 2000;
  const proteinTarget = currentUser ? currentUser.proteinTarget : 100;
  const caloriesRemaining = calorieTarget - caloriesConsumed;

  // Weight statistics
  const userWeightHistory = useMemo(() => {
    if (!currentUser) return [];
    return weightEntries
      .filter(w => w.userId === currentUser.id)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  }, [weightEntries, currentUser]);

  const startingWeight = useMemo(() => {
    if (!currentUser) return 70.0;
    if (userWeightHistory.length > 0) {
      return userWeightHistory[0].weight;
    }
    return currentUser.startingWeight || 70.0;
  }, [currentUser, userWeightHistory]);

  const currentWeight = useMemo(() => {
    if (!currentUser) return 70.0;
    if (userWeightHistory.length > 0) {
      return userWeightHistory[userWeightHistory.length - 1].weight;
    }
    return currentUser.startingWeight || 70.0;
  }, [currentUser, userWeightHistory]);

  const weightChange = useMemo(() => {
    return Math.round((currentWeight - startingWeight) * 10) / 10;
  }, [currentWeight, startingWeight]);

  // Handlers
  const handleAddFood = (
    foodId: number,
    quantity: number,
    meal: string,
    customName?: string,
    customCal?: number,
    customProt?: number
  ) => {
    if (!currentUser) return;
    addFoodLogEntry(currentUser.id, foodId, quantity, meal, customName, customCal, customProt);
    setFoodEntries(getFoodEntries());
  };

  const handleDeleteFood = (entryId: number) => {
    deleteFoodEntry(entryId);
    setFoodEntries(getFoodEntries());
  };

  const handleSaveWeight = (weight: number) => {
    if (!currentUser) return;
    addWeightEntry(currentUser.id, weight);
    setWeightEntries(getWeightEntries());
  };

  const handleUpdateWater = (glasses: number, goal?: number) => {
    if (!currentUser) return;
    const updated = updateWaterEntry(currentUser.id, glasses, goal);
    setWaterEntry(updated);
  };

  const handleUserSelected = (user: User) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
    const updatedUsers = getStoredUsers();
    setUsers(updatedUsers);
    setWaterEntry(getTodayWaterEntry(user.id));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuth(true);
  };

  const scrollToAIChat = () => {
    setShowAIChat(true);
    setTimeout(() => {
      aiChatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div>
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        showAuth={showAuth}
        onToggleAuth={() => setShowAuth(prev => !prev)}
        showAIChat={showAIChat}
        onToggleAIChat={() => setShowAIChat(prev => !prev)}
      />

      {showAuth && (
        <AuthCard
          onUserSelected={handleUserSelected}
          currentUser={currentUser}
        />
      )}

      {currentUser ? (
        <>
          <main className="dashboard">
            {/* Today's Calories */}
            <CaloriesCard
              target={calorieTarget}
              consumed={caloriesConsumed}
              remaining={caloriesRemaining}
            />

            {/* Daily Summary */}
            <DailySummaryCard
              calories={caloriesConsumed}
              protein={proteinConsumed}
              currentWeight={currentWeight}
            />

            {/* Goals */}
            <GoalsCard
              caloriesConsumed={caloriesConsumed}
              calorieTarget={calorieTarget}
              proteinConsumed={proteinConsumed}
              proteinTarget={proteinTarget}
            />

            {/* Water Intake Card */}
            <WaterIntakeCard
              waterEntry={waterEntry}
              onUpdateWater={handleUpdateWater}
            />

            {/* Weekly Trends */}
            <WeeklyTrendsChart
              foodEntries={foodEntries}
              weightEntries={weightEntries}
              userId={currentUser.id}
            />

            {/* Export & Reports */}
            <ExportCard
              userId={currentUser.id}
              username={currentUser.username}
            />

            {/* Protein */}
            <ProteinCard consumed={proteinConsumed} />

            {/* Weight */}
            <WeightStatsCard
              startingWeight={startingWeight}
              currentWeight={currentWeight}
              weightChange={weightChange}
            />

            {/* Update Weight */}
            <UpdateWeightCard onSaveWeight={handleSaveWeight} />

            {/* Weight History */}
            <WeightHistoryChart
              weightEntries={weightEntries}
              userId={currentUser.id}
            />

            {/* AI Nutritionist Chatbot */}
            {showAIChat && (
              <div ref={aiChatRef} style={{ gridColumn: 'span 2' }}>
                <AIChatCard
                  currentUser={currentUser}
                  todayFoodEntries={todayUserEntries}
                  caloriesConsumed={caloriesConsumed}
                  caloriesRemaining={caloriesRemaining}
                  proteinConsumed={proteinConsumed}
                  currentWeight={currentWeight}
                  onAddFood={handleAddFood}
                />
              </div>
            )}

            {/* Today's Food */}
            <FoodTrackingCard
              entries={todayUserEntries}
              foodItems={foodItems}
              onAddFood={handleAddFood}
              onDeleteFood={handleDeleteFood}
            />
          </main>

          {/* Floating Action Button for AI Coach */}
          <button
            type="button"
            className="floating-ai-btn"
            onClick={scrollToAIChat}
            title="Chat with Caloriq AI Coach"
          >
            <span>✨</span>
            <span>Ask AI Coach</span>
          </button>
        </>
      ) : (
        <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '30px', background: 'var(--card-bg)', borderRadius: '18px', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🍎</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Welcome to Caloriq
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
            Your daily nutrition dashboard with real-time calorie, protein, and weight tracking.
          </p>
          <button
            style={{ padding: '12px 24px', fontSize: '15px' }}
            onClick={() => {
              const defaultUser = users[0];
              if (defaultUser) {
                handleUserSelected(defaultUser);
              }
            }}
          >
            Quick Log in as Demo User (Alex)
          </button>
        </div>
      )}
    </div>
  );
};
