import React, { useState, useRef, useEffect } from 'react';
import { User, FoodEntry } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
  logSuggestion?: {
    foodName: string;
    calories: number;
    protein: number;
    quantity: number;
    meal: string;
  };
}

interface Props {
  currentUser: User;
  todayFoodEntries: FoodEntry[];
  caloriesConsumed: number;
  caloriesRemaining: number;
  proteinConsumed: number;
  currentWeight: number;
  onAddFood: (foodId: number, quantity: number, meal: string, customName?: string, customCal?: number, customProt?: number) => void;
}

export const AIChatCard: React.FC<Props> = ({
  currentUser,
  todayFoodEntries,
  caloriesConsumed,
  caloriesRemaining,
  proteinConsumed,
  currentWeight,
  onAddFood,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${currentUser.username}! 👋 I'm your **Caloriq AI Nutrition Coach**. You have **${caloriesRemaining} kcal** remaining today and reached **${proteinConsumed}g** of protein. How can I help you reach your goals today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIds, setLoggedIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    '🥗 Healthy snack under 200 kcal?',
    '💪 How to hit my protein goal today?',
    '🍽️ Meal suggestion with my remaining calories',
    '🥑 Estimate calories in avocado toast',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          userProfile: currentUser,
          todaySummary: {
            caloriesConsumed,
            caloriesRemaining,
            proteinConsumed,
            currentWeight,
            meals: todayFoodEntries.map(e => `${e.foodName} (${e.calories} kcal, ${e.protein}g protein, ${e.meal})`),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      let replyText = data.reply || '';
      let logSuggestion = undefined;

      // Check if response contains a log suggestion tag: [CALORIQ_LOG: {...}]
      const logMatch = replyText.match(/\[CALORIQ_LOG:\s*({.*?})\]/s);
      if (logMatch) {
        try {
          logSuggestion = JSON.parse(logMatch[1]);
          // Clean the raw tag from the text for visual elegance
          replyText = replyText.replace(/\[CALORIQ_LOG:\s*{.*?}\]/s, '').trim();
        } catch (e) {
          console.error('Failed to parse log suggestion', e);
        }
      }

      const modelMsg: Message = {
        id: String(Date.now() + 1),
        role: 'model',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        logSuggestion,
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        role: 'model',
        text: `⚠️ **Coach Error**: ${err.message || 'Unable to connect to AI Coach.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = (msgId: string, suggestion: any) => {
    onAddFood(
      0,
      suggestion.quantity || 1,
      suggestion.meal || 'Snack',
      suggestion.foodName,
      suggestion.calories,
      suggestion.protein
    );
    setLoggedIds(prev => ({ ...prev, [msgId]: true }));
  };

  return (
    <div className="dashboard-card ai-chat-card" style={{ gridColumn: 'span 2' }}>
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <div className="ai-avatar-ring">
            <span className="ai-icon">🤖</span>
            <span className="ai-online-dot"></span>
          </div>
          <div>
            <h2>Caloriq AI Coach</h2>
            <p className="ai-subtitle">Real-time nutritional guidance & instant food estimates</p>
          </div>
        </div>
        <div className="ai-badge-pill">
          ✨ Powered by Gemini
        </div>
      </div>

      {/* Message Stream */}
      <div className="ai-chat-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`ai-message-row ${msg.role === 'user' ? 'user-row' : 'model-row'}`}
          >
            {msg.role === 'model' && <div className="msg-avatar">🍎</div>}
            <div className={`ai-bubble ${msg.role === 'user' ? 'user-bubble' : 'model-bubble'}`}>
              <div className="ai-bubble-content">
                {msg.text.split('\n').map((line, idx) => {
                  if (!line.trim()) return <br key={idx} />;
                  // Basic formatting for bold **
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={idx} style={{ margin: '3px 0' }}>
                      {parts.map((p, i) => {
                        if (p.startsWith('**') && p.endsWith('**')) {
                          return <strong key={i}>{p.slice(2, -2)}</strong>;
                        }
                        return p;
                      })}
                    </p>
                  );
                })}
              </div>

              {/* 1-Click Food Log action if AI suggested food */}
              {msg.logSuggestion && (
                <div className="ai-food-suggest-box">
                  <div className="suggest-info">
                    <strong>🍴 {msg.logSuggestion.foodName}</strong>
                    <span>
                      {msg.logSuggestion.calories} kcal • {msg.logSuggestion.protein}g protein • {msg.logSuggestion.meal}
                    </span>
                  </div>
                  <button
                    className="btn-quick-log"
                    disabled={loggedIds[msg.id]}
                    onClick={() => handleQuickLog(msg.id, msg.logSuggestion)}
                  >
                    {loggedIds[msg.id] ? '✅ Added to Today' : '+ Log this to Meals'}
                  </button>
                </div>
              )}

              <span className="msg-time">{msg.time}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-message-row model-row">
            <div className="msg-avatar">🍎</div>
            <div className="ai-bubble model-bubble loading-bubble">
              <span className="dot dot1"></span>
              <span className="dot dot2"></span>
              <span className="dot dot3"></span>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '6px' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="ai-quick-prompts">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            type="button"
            className="quick-prompt-chip"
            onClick={() => handleSend(p)}
            disabled={loading}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        className="ai-chat-input-form"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          placeholder="Ask anything or describe what you ate (e.g. 'I had a turkey wrap and iced coffee')..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-ai-send">
          Send 🚀
        </button>
      </form>
    </div>
  );
};
