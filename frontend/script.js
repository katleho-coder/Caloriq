

async function loadFoods() {
    try {
        const response = await fetch(
            "http://127.0.0.1:8001/foods"
        );

        if (!response.ok) {
            throw new Error("Failed to load foods");
        }

        const foods = await response.json();

        const foodSelect = document.getElementById("food-id");

        foods.forEach(function (food) {
            const option = document.createElement("option");

            option.value = food.id;
            option.textContent = food.name;

            foodSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading foods:", error);
    }
} 
async function loadFoodEntries() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8001/users/${userId}/food-entries`
        );

        if (!response.ok) {
            throw new Error("Failed to load food entries");
        }

        const entries = await response.json();

        const foodEntriesList =
            document.getElementById("food-entries-list");

        foodEntriesList.innerHTML = "";

        if (entries.length === 0) {
            foodEntriesList.innerHTML =
                "<p>No food entries yet.</p>";
            return;
        }

        entries.forEach(function (entry) {
            const foodEntry = document.createElement("div");

            foodEntry.className = "food-entry";

            foodEntry.innerHTML = `
                <strong>${entry.food_name}</strong>
                <span>${entry.quantity} × ${entry.meal}</span>
            `;

            foodEntriesList.appendChild(foodEntry);
        });

    } catch (error) {
        console.error("Error loading food entries:", error);
    }
}

async function loadDashboard() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8001/users/${userId}/dashboard`
        );

        if (!response.ok) {
            throw new Error("Failed to load dashboard");
        }

        const data = await response.json();

        document.getElementById("calorie-target").textContent =
            data.calories.target;

        document.getElementById("calories-consumed").textContent =
            data.calories.consumed;

        document.getElementById("calories-remaining").textContent =
            data.calories.remaining;

        document.getElementById("protein-consumed").textContent =
            data.protein.consumed;

        document.getElementById("starting-weight").textContent =
            data.weight.starting;

        document.getElementById("current-weight").textContent =
            data.weight.current;

        document.getElementById("weight-change").textContent =
            data.weight.change;

    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
}

document.getElementById("food-entry-form").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const foodId = Number(
            document.getElementById("food-id").value
        );

        const quantity = Number(
            document.getElementById("quantity").value
        );

        const meal = document.getElementById("meal").value;

        try {
            const response = await fetch(
                "http://127.0.0.1:8001/food-entries",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        food_id: foodId,
                        quantity: quantity,
                        meal: meal
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to add food"
                );
            }

            console.log("Food added:", data);

            document.getElementById("food-entry-form").reset();

            await loadDashboard();
            await loadFoodEntries();

        } catch (error) {
            console.error("Error adding food:", error);
            alert(error.message);
        }
    }
);

loadFoods();
loadFoodEntries();
loadDashboard();

async function loadDashboard(userId = 1) {
  try {
    const res = await fetch(`http://127.0.0.1:8001/users/${userId}/dashboard`);
    const data = await res.json();

    // Calories
    document.getElementById("calories-target").textContent = data.calorie_target;
    document.getElementById("calories-consumed").textContent = data.calories_consumed;
    document.getElementById("calories-remaining").textContent = data.calories_remaining;

    // Protein
    document.getElementById("protein-consumed").textContent = data.protein_consumed;

    // Weight
    document.getElementById("weight-starting").textContent = data.weight_starting + " kg";
    document.getElementById("weight-current").textContent = data.weight_current + " kg";
    document.getElementById("weight-change").textContent = data.weight_change + " kg";
  } catch (err) {
    console.error("Dashboard load failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const weightForm = document.getElementById("weight-form");
  if (weightForm) {
    weightForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const weight = parseFloat(document.getElementById("weight-input").value);

      try {
        const res = await fetch("http://127.0.0.1:8001/weight-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: 1,
            weight: weight,
            entry_date: new Date().toISOString().split("T")[0]
          })
        });

        const data = await res.json();
        document.getElementById("weight-status").textContent =
          res.ok ? `✅ ${data.message}` : "⚠️ Failed to update weight.";
        document.getElementById("weight-input").value = "";
        loadDashboard();
        loadWeightHistory();
      } catch (err) {
        console.error("Weight update failed:", err);
        document.getElementById("weight-status").textContent =
          "❌ Error connecting to server.";
      }
    });
  }
});

async function loadFoodEntries(userId = 1) {
  try {
    const res = await fetch(`http://127.0.0.1:8001/users/${userId}/food-entries`);
    const entries = await res.json();

    const container = document.getElementById("food-entries");
    container.innerHTML = "";

    entries.forEach(entry => {
      const div = document.createElement("div");
      div.className = "stat";
      div.innerHTML = `
        <span>${entry.food_name} (${entry.quantity} × ${entry.meal})</span>
        <strong>${entry.total_calories} kcal | ${entry.total_protein} g protein</strong>
        <button onclick="deleteFood(${entry.id})">Delete</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Food entries load failed:", err);
  }
}

async function deleteFood(entryId) {
  try {
    await fetch(`http://127.0.0.1:8001/food-entries/${entryId}`, { method: "DELETE" });
    loadFoodEntries();
    loadDashboard();
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

// Load everything on page start
window.onload = () => {
  loadDashboard();
  loadFoodEntries();
};

async function loadDashboard(userId = 1) {
  try {
    const res = await fetch(`http://127.0.0.1:8001/users/${userId}/dashboard`);
    const data = await res.json();

    document.getElementById("calories-target").textContent = data.calorie_target;
    document.getElementById("calories-consumed").textContent = data.calories_consumed;
    document.getElementById("calories-remaining").textContent = data.calories_remaining;
    document.getElementById("protein-consumed").textContent = data.protein_consumed;
    document.getElementById("weight-starting").textContent = data.weight_starting + " kg";
    document.getElementById("weight-current").textContent = data.weight_current + " kg";
    document.getElementById("weight-change").textContent = data.weight_change + " kg";
  } catch (err) {
    console.error("Dashboard load failed:", err);
  }
}

async function loadFoodEntries(userId = 1) {
  try {
    const res = await fetch(`http://127.0.0.1:8001/users/${userId}/food-entries`);
    const entries = await res.json();

    const container = document.getElementById("food-entries");
    container.innerHTML = "";

    entries.forEach(entry => {
      const div = document.createElement("div");
      div.className = "stat";
      div.innerHTML = `
        <span>${entry.food_name} (${entry.quantity} × ${entry.meal})</span>
        <strong>${entry.total_calories} kcal | ${entry.total_protein} g protein</strong>
        <button onclick="deleteFood(${entry.id})">Delete</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Food entries load failed:", err);
  }
}

async function deleteFood(entryId) {
  try {
    await fetch(`http://127.0.0.1:8001/food-entries/${entryId}`, { method: "DELETE" });
    loadFoodEntries();
    loadDashboard();
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

window.onload = () => {
  loadDashboard();
  loadFoodEntries();
};

document.getElementById("weight-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const weight = parseFloat(document.getElementById("weight-input").value);

  try {
    const res = await fetch("http://127.0.0.1:8001/weight-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1,
        weight: weight,
        entry_date: new Date().toISOString().split("T")[0]
      })
    });

    if (res.ok) {
      document.getElementById("weight-status").textContent =
  res.ok ? "✅ Weight updated successfully!" : "❌ Failed to update weight.";

      document.getElementById("weight-input").value = "";
      loadDashboard(); // refresh dashboard stats
    } else {
      document.getElementById("weight-status").textContent = "⚠️ Failed to update weight.";
    }
  } catch (err) {
    console.error("Weight update failed:", err);
    document.getElementById("weight-status").textContent = "❌ Error connecting to server.";
  }
});

window.addEventListener("load", () => {
  const form = document.getElementById("weight-form");
  if (!form) {
    console.error("Weight form not found!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById("weight-input").value);

    try {
      const res = await fetch("http://127.0.0.1:8001/weight-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          weight: weight,
          entry_date: new Date().toISOString().split("T")[0]
        })
      });

      const data = await res.json();
      document.getElementById("weight-status").textContent =
        res.ok ? `✅ ${data.message}` : "⚠️ Failed to update weight.";
    } catch (err) {
      console.error("Weight update failed:", err);
      document.getElementById("weight-status").textContent =
        "❌ Error connecting to server.";
    }
  });
});

async function loadWeightHistory() {
  try {
    const res = await fetch("http://127.0.0.1:8001/users/1/weight-history");
    const data = await res.json();

    const dates = data.map(entry => entry.entry_date);
    const weights = data.map(entry => entry.weight);

    const ctx = document.getElementById("weightChart").getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [{
          label: "Weight (kg)",
          data: weights,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          fill: true,
          tension: 0.4, // smooth curve
          pointStyle: "circle",
          pointRadius: 5,
          pointBackgroundColor: "#2e7d32"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Your Weight Journey 📈",
            font: { size: 18, weight: "bold" },
            color: "#333"
          },
          legend: {
            labels: { color: "#333", font: { size: 14 } }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Date" }
          },
          y: {
            title: { display: true, text: "Weight (kg)" },
            beginAtZero: false
          }
        }
      }
    });
  } catch (err) {
    console.error("Failed to load weight history:", err);
  }
}

// Call it when dashboard loads
loadWeightHistory();

async function loadDailySummary() {
  try {
    const res = await fetch("http://127.0.0.1:8001/users/1/daily-summary");
    const data = await res.json();

    document.getElementById("summary-calories").textContent =
      `🍎 Calories: ${data.calories}`;
    document.getElementById("summary-protein").textContent =
      `💪 Protein: ${data.protein} g`;
    document.getElementById("summary-weight").textContent =
      `⚖️ Weight: ${data.weight ?? "--"} kg`;
  } catch (err) {
    console.error("Failed to load summary:", err);
  }
}

// Call it when dashboard loads
loadDailySummary();

async function loadDailySummary() {
  try {
    const res = await fetch("http://127.0.0.1:8001/users/1/daily-summary");
    const data = await res.json();

    // Update text
    document.getElementById("summary-calories").textContent =
      `🍎 Calories: ${data.calories}`;
    document.getElementById("summary-protein").textContent =
      `💪 Protein: ${data.protein} g`;
    document.getElementById("summary-weight").textContent =
      `⚖️ Weight: ${data.weight ?? "--"} kg`;

    // Progress bars (targets: 2000 kcal, 100 g protein)
    const caloriePercent = Math.min((data.calories / 2000) * 100, 100);
    const proteinPercent = Math.min((data.protein / 100) * 100, 100);

    document.getElementById("calorie-progress").style.width =
      caloriePercent + "%";
    document.getElementById("protein-progress").style.width =
      proteinPercent + "%";

    // Show % inside bar
    document.getElementById("calorie-progress").textContent =
      Math.round(caloriePercent) + "%";
    document.getElementById("protein-progress").textContent =
      Math.round(proteinPercent) + "%";
  } catch (err) {
    console.error("Failed to load summary:", err);
  }
}

async function loadWeeklyTrends() {
  try {
    const res = await fetch("http://127.0.0.1:8001/users/1/weekly-trends");
    const data = await res.json();

    const dates = data.food.map(entry => entry.date);
    const calories = data.food.map(entry => entry.calories);
    const protein = data.food.map(entry => entry.protein);
    const weights = data.weight.map(entry => entry.weight);

    const ctx = document.getElementById("weeklyChart").getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Calories 🍎",
            data: calories,
            borderColor: "#FF9800",
            backgroundColor: "rgba(255,152,0,0.2)",
            fill: true,
            tension: 0.4
          },
          {
            label: "Protein 💪",
            data: protein,
            borderColor: "#2196F3",
            backgroundColor: "rgba(33,150,243,0.2)",
            fill: true,
            tension: 0.4
          },
          {
            label: "Weight ⚖️",
            data: weights,
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76,175,80,0.2)",
            fill: false,
            tension: 0.4,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Weekly Trends Overview 📊",
            font: { size: 18, weight: "bold" }
          }
        },
        scales: {
          y: {
            title: { display: true, text: "Calories / Protein" }
          },
          y1: {
            position: "right",
            title: { display: true, text: "Weight (kg)" },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  } catch (err) {
    console.error("Failed to load weekly trends:", err);
  }
}

// Call it when dashboard loads
loadWeeklyTrends();

function exportCSV() {
  window.open("http://127.0.0.1:8001/users/1/export-csv", "_blank");
}

function exportPDF() {
  window.open("http://127.0.0.1:8001/users/1/export-pdf", "_blank");
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://127.0.0.1:8001/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${username}&password=${password}`
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.access_token);
      document.getElementById("login-status").textContent = "✅ Login successful!";
      // Reload dashboard with user-specific data
      loadDailySummary();
      loadWeightHistory();
      loadWeeklyTrends();
    } else {
      document.getElementById("login-status").textContent = "❌ Login failed.";
    }
  } catch (err) {
    console.error("Login error:", err);
    document.getElementById("login-status").textContent = "⚠️ Error connecting to server.";
  }
});

const token = localStorage.getItem("token");
const res = await fetch("http://127.0.0.1:8001/users/1/daily-summary", {
  headers: { "Authorization": `Bearer ${token}` }
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  try {
    const res = await fetch("http://127.0.0.1:8001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    document.getElementById("register-status").textContent =
      res.ok ? `✅ ${data.message}` : "❌ Registration failed.";
  } catch (err) {
    console.error("Registration error:", err);
    document.getElementById("register-status").textContent =
      "⚠️ Error connecting to server.";
  }
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  try {
    const res = await fetch("http://127.0.0.1:8001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    document.getElementById("register-status").textContent =
      res.ok ? `✅ ${data.message}` : "❌ Registration failed.";
  } catch (err) {
    console.error("Registration error:", err);
    document.getElementById("register-status").textContent =
      "⚠️ Error connecting to server.";
  }
});

if (res.ok) {
  localStorage.setItem("token", data.access_token);
  document.getElementById("login-status").textContent =
    `✅ Welcome ${username}!`;
  // Load user-specific dashboard
  loadDailySummary();
  loadWeightHistory();
  loadWeeklyTrends();
}
