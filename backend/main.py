from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
import psycopg2
import jwt
import datetime
import io
import csv
from reportlab.pdfgen import canvas

app = FastAPI()

import os
from dotenv import load_dotenv

load_dotenv()

# --- Database connection ---


# --- Auth setup ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
def get_connection():
    """Establish and return a PostgreSQL database connection."""
    return psycopg2.connect(
        host="localhost",
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

# --- Register new user ---
@app.post("/register")
def register(username: str, password: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
    conn.commit()
    conn.close()
    return {"message": "Account created successfully!"}

# --- Login & token ---
def authenticate_user(username: str, password: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    conn.close()
    if not user or user[2] != password:
        return None
    return {"id": user[0], "username": user[1]}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token({"sub": user["username"], "id": user["id"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"username": payload["sub"], "id": payload["id"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Weight update ---
@app.post("/users/{user_id}/weight")
def update_weight(user_id: int, weight: float):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO weight_entries (user_id, weight, entry_date) VALUES (%s, %s, CURRENT_DATE)", (user_id, weight))
    conn.commit()
    conn.close()
    return {"message": "Weight updated successfully!"}

@app.get("/users/{user_id}/weight-history")
def get_weight_history(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT entry_date, weight FROM weight_entries WHERE user_id = %s ORDER BY entry_date ASC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"entry_date": r[0], "weight": r[1]} for r in rows]

# --- Daily summary ---
@app.get("/users/{user_id}/daily-summary")
def get_daily_summary(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(calories), SUM(protein) FROM food_entries WHERE user_id = %s AND entry_date = CURRENT_DATE", (user_id,))
    food_totals = cursor.fetchone()
    cursor.execute("SELECT weight FROM weight_entries WHERE user_id = %s ORDER BY entry_date DESC LIMIT 1", (user_id,))
    weight_row = cursor.fetchone()
    conn.close()
    return {
        "calories": food_totals[0] or 0,
        "protein": food_totals[1] or 0,
        "weight": weight_row[0] if weight_row else None
    }

# --- Weekly trends ---
@app.get("/users/{user_id}/weekly-trends")
def get_weekly_trends(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT entry_date, SUM(calories), SUM(protein)
        FROM food_entries
        WHERE user_id = %s AND entry_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY entry_date
        ORDER BY entry_date ASC
    """, (user_id,))
    food_rows = cursor.fetchall()
    cursor.execute("""
        SELECT entry_date, weight
        FROM weight_entries
        WHERE user_id = %s AND entry_date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY entry_date ASC
    """, (user_id,))
    weight_rows = cursor.fetchall()
    conn.close()
    return {
        "food": [{"date": r[0], "calories": r[1], "protein": r[2]} for r in food_rows],
        "weight": [{"date": r[0], "weight": r[1]} for r in weight_rows]
    }

# --- Export CSV ---
@app.get("/users/{user_id}/export-csv")
def export_csv(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT entry_date, food_name, calories, protein FROM food_entries WHERE user_id = %s ORDER BY entry_date ASC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Food", "Calories", "Protein"])
    writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=report.csv"})

# --- Export PDF ---
@app.get("/users/{user_id}/export-pdf")
def export_pdf(user_id: int):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)
    p.setFont("Helvetica", 12)
    p.drawString(100, 800, f"User {user_id} Progress Report")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT entry_date, food_name, calories, protein FROM food_entries WHERE user_id = %s ORDER BY entry_date ASC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    y = 770
    for row in rows:
        p.drawString(100, y, f"{row[0]} | {row[1]} | {row[2]} kcal | {row[3]} g protein")
        y -= 20
    p.showPage()
    p.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=report.pdf"})
