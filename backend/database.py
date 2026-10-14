import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """Establish and return a PostgreSQL database connection."""
    return psycopg2.connect(
        host="localhost",
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
