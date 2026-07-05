import os
from flask import Flask, render_template, jsonify, request
import psycopg2
import psycopg2.extras
from ai import ask_gemini

app = Flask(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL")


def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    return conn


@app.route("/")
def dashboard():
    return render_template("index.html")


@app.route("/api/sales", methods=["GET"])
def get_sales():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sales ORDER BY id ASC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/sales", methods=["POST"])
def add_sale():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sales (product, quantity, price) VALUES (%s, %s, %s)",
        (data["product"], data["quantity"], data["price"]),
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "ok"})


@app.route("/api/sales/<int:sale_id>", methods=["DELETE"])
def delete_sale(sale_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM sales WHERE id = %s", (sale_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "deleted"})


@app.route("/api/ask", methods=["POST"])
def ask_assistant():
    data = request.get_json()
    question = data.get("question", "")
    language = data.get("language", "en")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sales")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    sales_context = [dict(r) for r in rows]

    answer = ask_gemini(question, sales_context, language)
    return jsonify({"answer": answer})