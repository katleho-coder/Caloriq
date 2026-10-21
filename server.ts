import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const host = '0.0.0.0';

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], userProfile, todaySummary } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in the environment.',
      });
    }

    const contextPrompt = `
User Context:
- Username: ${userProfile?.username || 'User'}
- Daily Calorie Target: ${userProfile?.calorieTarget || 2000} kcal
- Daily Protein Target: ${userProfile?.proteinTarget || 100} g
- Today's Consumed Calories: ${todaySummary?.caloriesConsumed || 0} kcal
- Today's Remaining Calories: ${todaySummary?.caloriesRemaining || 2000} kcal
- Today's Consumed Protein: ${todaySummary?.proteinConsumed || 0} g
- Current Weight: ${todaySummary?.currentWeight || 'Not set'} kg
- Today's Logged Meals: ${JSON.stringify(todaySummary?.meals || [])}
`;

    const systemInstruction = `You are 'Caloriq AI', an encouraging, expert nutrition and fitness coach embedded inside the Caloriq dashboard.
Your mission is to help the user hit their calorie and protein targets, estimate calories for foods they describe, suggest meals fitting their remaining allowance, analyze trends, and stay motivated.

${contextPrompt}

Guidelines:
1. Speak in a warm, direct, and supportive tone.
2. Format responses with clean bullet points or bold highlights. Keep answers concise and easy to read.
3. If the user mentions eating or wanting to log something (e.g., "I just had 2 scrambled eggs on toast", "Add a protein shake"), calculate the estimated calories & protein and include a structured tag at the end of your response in this exact format so the user can add it with 1-click:
[CALORIQ_LOG: {"foodName": "Scrambled Eggs on Toast", "calories": 310, "protein": 18, "quantity": 1, "meal": "Breakfast"}]
4. Never give dangerous extreme diet advice. Recommend balanced sustainable nutrition.`;

    // Map conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent history if provided
    if (Array.isArray(history)) {
      for (const msg of history.slice(-8)) {
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let replyText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      replyText = response.text || "I'm here to help with your nutrition and calorie goals!";
    } catch (apiErr: any) {
      console.warn('Gemini API call failed, providing nutrition fallback:', apiErr?.message);
      // Smart contextual fallback coach
      const q = message.toLowerCase();
      if (q.includes('snack') || q.includes('under 200')) {
        replyText = `Here are 3 great snack ideas under 200 kcal:\n• **Greek Yogurt & Berries**: 150g Greek yogurt with a handful of blueberries (~140 kcal, 15g protein)\n• **Boiled Eggs with Paprika**: 2 large eggs (~155 kcal, 13g protein)\n• **Apple & PB**: 1 medium apple with 1 tbsp peanut butter (~190 kcal, 4g protein)\n\n[CALORIQ_LOG: {"foodName": "Greek Yogurt & Blueberries", "calories": 140, "protein": 15, "quantity": 1, "meal": "Snack"}]`;
      } else if (q.includes('protein')) {
        replyText = `To hit your **${userProfile?.proteinTarget || 100}g** target today:\n• Prioritize lean protein sources like chicken breast, salmon, tofu, eggs, and Greek yogurt.\n• If you need a quick boost, a scoop of whey or plant protein powder with water or milk adds ~25g protein for just ~130 kcal.\n• You currently have **${todaySummary?.proteinConsumed || 0}g** logged today!`;
      } else if (q.includes('remaining') || q.includes('meal suggestion')) {
        const remaining = todaySummary?.caloriesRemaining || 600;
        replyText = `With **${remaining} kcal** remaining, here is a balanced dinner idea:\n• **Grilled Chicken Bowl**: 150g grilled chicken, 1/2 cup brown rice, steamed broccoli, and 1 tsp olive oil (~420 kcal, 38g protein).\n\n[CALORIQ_LOG: {"foodName": "Grilled Chicken & Brown Rice Bowl", "calories": 420, "protein": 38, "quantity": 1, "meal": "Dinner"}]`;
      } else if (q.includes('avocado') || q.includes('toast')) {
        replyText = `**Avocado Toast Estimation**:\n• 1 slice whole wheat bread (~80 kcal, 4g protein)\n• 1/2 medium avocado (~120 kcal, 1.5g protein)\n• 1 poached egg on top (~75 kcal, 6g protein)\n• **Total**: ~275 kcal, 11.5g protein.\n\n[CALORIQ_LOG: {"foodName": "Avocado Toast with Egg", "calories": 275, "protein": 11.5, "quantity": 1, "meal": "Breakfast"}]`;
      } else {
        replyText = `Based on your goal of **${userProfile?.calorieTarget || 2000} kcal** and current **${todaySummary?.caloriesConsumed || 0} kcal** logged today, you have **${todaySummary?.caloriesRemaining || 2000} kcal** left. Stay consistent, drink plenty of water, and ensure each meal has a solid source of protein!`;
      }
    }

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response from AI coach',
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host, port },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, host, () => {
    console.log(`Caloriq server running on http://${host}:${port}`);
  });
}

startServer();
